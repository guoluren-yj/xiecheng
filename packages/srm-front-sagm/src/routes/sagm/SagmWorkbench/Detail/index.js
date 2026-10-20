import React, { Fragment, useState, useEffect, useMemo } from 'react';
import qs from 'qs';
import { flowRight, throttle } from 'lodash';
import { Popconfirm } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import AnchorPro from '@/components/AnchorPro';
import { Button as PermissionButton } from 'components/Permission';
import { openTextArea } from '@/utils/modals';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openApproveModal } from '_components/ApproveModal';

import { AgreeAuthorityContext } from '../../ProtocolWorkbench/context';
import BaseInfo from './BaseInfo';
import StrategyLine from './StrategyLine';
import SaleLine from './SaleLine';
import Authority from './Authority';
import Invoice from './Invoice';
import OrderLimit from './OrderLimit';
import ReceiveLimit from './ReceiveLimit';
import ReceiveSaleLine from './ReceiveSaleLine';
import FormPro from '../Comps/FormPro';
import initStores from './initStores';
import { viewSagmRecords } from '../Drawers/record';
import deleteConfirm from '../Drawers/deleteConfirm';
import {
  handleDeleteSagm,
  handlePublish,
  handleCancelPublish,
  handleSave,
  handleSubmit,
} from '../funcs';
import { agreementApprove, agreementReject, fetchSaleAgreeApprove } from '../api';
import { handleRevokeApprove } from '../../commonUtils';

import styles from './style.less';

const approveCode = 'sagm.sale-agreement-workbench-list.button.agreement.approve';

const HeadButton = observer(
  ({
    children,
    dataSet,
    name,
    bindBtn = [],
    permission,
    onClick,
    delay = 0,
    confirmProps,
    ...btnProps
  }) => {
    const loading = dataSet
      ? btnProps.loading || dataSet.getState(`${name}_loading`)
      : btnProps.loading;
    const disabled = dataSet ? btnProps.disabled || dataSet.status !== 'ready' : btnProps.disabled;
    const clickFn = throttle(async () => {
      if (dataSet) {
        dataSet.setState(`${name}_loading`, true);
        if (bindBtn.length > 0) {
          bindBtn.forEach((b) => {
            dataSet.setState(`${b}_loading`, true);
          });
        }
      }
      await onClick();
      if (dataSet) {
        dataSet.setState(`${name}_loading`, false);
        if (bindBtn.length > 0) {
          bindBtn.forEach((b) => {
            dataSet.setState(`${b}_loading`, false);
          });
        }
      }
    }, delay);

    if (confirmProps) {
      return (
        <Popconfirm onConfirm={clickFn} {...confirmProps}>
          <Button {...btnProps} loading={loading} disabled={disabled}>
            {children}
          </Button>
        </Popconfirm>
      );
    }
    const ButtonRef = permission ? PermissionButton : Button;
    return (
      <ButtonRef
        {...btnProps}
        loading={loading}
        onClick={clickFn}
        disabled={disabled}
        type="c7n-pro"
      >
        {children}
      </ButtonRef>
    );
  }
);

const PayConfig = observer((props = {}) => {
  const { readOnly, dataSet } = props;
  useEffect(() => {
    dataSet.getField('salePointsDetails').set('multiple', !readOnly);
  }, [readOnly]);
  return <FormPro {...props} />;
});

function SagmDetail(props) {
  const {
    match: { params: { status } = {}, path },
    history: { push },
    location: { pathname, search },
    customizeTable,
    onFormLoaded,
  } = props;
  const currentPath = `${pathname}${search}`;
  // 工作流
  const isPub = pathname.includes('pub');
  const {
    agreementHeaderId,
    readOnly: urlReadOnly,
    wflApproveFlag,
    wflRevokeApproveFlag,
    taskId,
    processInstanceId,
    businessKey,
  } = qs.parse(search.substr(1));
  const [
    { statusCode: agmStatus, agreementHeaderNum, agreementHeaderId: agmId },
    setAgmInfo,
  ] = useState({ agreementHeaderId });
  const [oldAgmStatus, setOldAgmStatus] = useState(null);
  const [refresh, onRefresh] = useState({});
  const [readOnly, setReadOnly] = useState(false);
  const [viewCanEdit, setViewCanEdit] = useState(false);

  // 新建：保存、发布，编辑：操作记录、删除、保存、发布，已失效：操作记录、编辑，已生效：操作记录、取消发布， 待生效：操作记录

  useEffect(() => setAgmInfo((prev) => ({ ...prev, agreementHeaderId })), [agreementHeaderId]);

  const dataSetMap = useMemo(() => {
    return initStores({ agreementHeaderId, setAgmInfo });
  }, [agreementHeaderId]);

  const { agreementHeaderType: agmType, proxyCompanyId, deleteFlag } =
    dataSetMap.baseInfoDs?.current?.get(['agreementHeaderType', 'proxyCompanyId', 'deleteFlag']) ||
    {};

  useEffect(() => {
    if (isPub) setReadOnly(true);
    else if (urlReadOnly === '0') {
      // 跳转编辑强制设为编辑
      setReadOnly(false);
    } else {
      let _readOnly = agmId ? status === 'read' : false;
      if (['TO_BE_EFFECTIVE', 'EFFECTED', 'APPROVED'].includes(agmStatus)) {
        _readOnly = true;
      }
      // 待发布协议编辑保存后，状态为新建， status 仍为 read  //全部新建进来不编辑
      if (oldAgmStatus === 'WAITING_PUBLISH' && agmStatus === 'NEW' && !deleteFlag) {
        _readOnly = false;
      }
      setReadOnly(_readOnly);
    }
  }, [status, agmId, agmStatus, deleteFlag, urlReadOnly]);

  useEffect(() => {
    if (readOnly && agmType && proxyCompanyId) {
      getResponse(
        fetchSaleAgreeApprove({
          tenantId: getCurrentOrganizationId(),
          companyId: proxyCompanyId,
          agreementHeaderType: agmType,
        })
      ).then((res) => {
        // 松下 无需审批，查看协议可编辑价格
        if (res) setViewCanEdit(res === 'SELF');
      });
    }
  }, [agmType, readOnly]);

  const handleRefresh = (refreshs = []) => {
    const newRefresh = {};
    refreshs.forEach((f) => {
      const prevCount = refresh[f] || 0;
      newRefresh[f] = prevCount + 1;
    });
    onRefresh(newRefresh);
  };

  const handleApprovePass = async () => {
    const { baseInfoDs } = dataSetMap;
    const res = getResponse(
      await agreementApprove({
        agreementHeaderIdList: [baseInfoDs.current.toData().agreementHeaderId],
      })
    );
    if (res) {
      push('/sagm/sale-agreement-workbench/list');
    }
  };

  /**
   * 审批拒绝
   */
  const handleApproveReject = () => {
    const { baseInfoDs } = dataSetMap;
    openTextArea({
      title: intl.get('small.common.view.approveReject').d('审批拒绝'),
      name: 'rejectRemark',
      maxLength: 100,
      label: intl.get('small.common.view.rejectReason').d('拒绝原因'),
      onOk: (param = {}) =>
        agreementReject({
          agreementHeaderIdList: [baseInfoDs.current.toData().agreementHeaderId],
          remark: param.rejectRemark,
        }).then((res) => {
          if (getResponse(res)) {
            push('/sagm/sale-agreement-workbench/list');
          }
        }),
    });
  };
  const headerBtns = useMemo(() => {
    const { baseInfoDs } = dataSetMap;
    const btns = !isPub
      ? [
          {
            show: +wflApproveFlag,
            comp: (
              <Button
                icon="authorize"
                color="primary"
                onClick={() => {
                  openApproveModal({
                    modalProps: {
                      closable: true,
                    },
                    taskId,
                    processInstanceId,
                    onSuccess: () => {
                      push('/sagm/sale-agreement-workbench/list');
                    },
                  });
                }}
              >
                {intl.get('hzero.common.button.approval').d('审批')}
              </Button>
            ),
          },
          {
            show: +wflRevokeApproveFlag,
            comp: (
              <Button
                icon="reply"
                funcType="flat"
                onClick={() =>
                  handleRevokeApprove(businessKey, () =>
                    push('/sagm/sale-agreement-workbench/list')
                  )
                }
              >
                {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
              </Button>
            ),
          },
          {
            show: readOnly && ['WAITING_PUBLISH', 'APPROVED'].includes(agmStatus) && !deleteFlag,
            comp: (
              <HeadButton
                name="publish"
                disabled={!agmId}
                icon="publish2"
                color="primary"
                dataSet={baseInfoDs}
                onClick={() =>
                  handlePublish(dataSetMap, () => {
                    baseInfoDs.query();
                    handleRefresh([
                      'strategys',
                      'saleLine',
                      'orderLimit',
                      'invoice',
                      'receiveLimit',
                    ]);
                  })
                }
              >
                {intl.get('sagm.common.button.publish').d('发布')}
              </HeadButton>
            ),
          },
          {
            show: ['TO_BE_EFFECTIVE', 'EFFECTED'].includes(agmStatus),
            comp: (
              <HeadButton
                name="cancel"
                disabled={!agmId}
                icon="remove_done"
                funcType="flat"
                dataSet={baseInfoDs}
                onClick={async () => {
                  const agmCode = baseInfoDs.current.get('agreementHeaderNum');
                  await deleteConfirm({
                    content: intl
                      .get('sagm.common.view.title.cancelSaleAgm', { num: agmCode })
                      .d(`是否确定取消发布销售协议${agmCode}？`),
                    confirm: () => handleCancelPublish(baseInfoDs),
                  });
                }}
              >
                {intl.get('sagm.common.button.cancel.publish').d('取消发布')}
              </HeadButton>
            ),
          },
          {
            show:
              readOnly &&
              !deleteFlag &&
              ['REJECTED', 'WAITING_PUBLISH', 'EXPIRED', 'APPROVED', 'NEW'].includes(agmStatus),
            comp: (
              <HeadButton
                name="edit"
                icon="mode_edit"
                funcType="flat"
                onClick={() =>
                  props.history.push(
                    `/sagm/sale-agreement-workbench/detail/edit?agreementHeaderId=${agmId}&readOnly=0`
                  )
                } // 强制设置为编辑
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </HeadButton>
            ),
          },
          {
            show:
              agmId &&
              !readOnly &&
              !deleteFlag &&
              ['NEW', 'REJECTED', 'WAITING_PUBLISH', 'EXPIRED', 'APPROVED'].includes(agmStatus),
            comp: (
              <HeadButton
                name="submit"
                icon="check"
                color="primary"
                bindBtn={['save', 'delete']}
                dataSet={baseInfoDs}
                delay={600}
                onClick={() =>
                  handleSubmit(dataSetMap, () => {
                    push('/sagm/sale-agreement-workbench/list');
                  })
                }
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </HeadButton>
            ),
          },
          {
            show:
              !agmId ||
              (!readOnly &&
                !deleteFlag &&
                ['NEW', 'REJECTED', 'WAITING_PUBLISH', 'EXPIRED', 'APPROVED'].includes(agmStatus)),
            comp: (
              <HeadButton
                name="save"
                icon="save"
                funcType={!agmId ? 'raised' : 'flat'}
                color={!agmId ? 'primary' : 'default'}
                bindBtn={['submit', 'delete']}
                dataSet={baseInfoDs}
                onClick={() =>
                  handleSave(dataSetMap, (res) => {
                    const { agreementHeaderId: _agmId } = res;
                    setOldAgmStatus(baseInfoDs?.current?.get('statusCode'));
                    baseInfoDs.setQueryParameter('agreementHeaderId', _agmId);
                    baseInfoDs.query();
                    if (agmId) {
                      handleRefresh([
                        'strategys',
                        'saleLine',
                        'orderLimit',
                        'invoice',
                        'receiveLimit',
                      ]);
                    } else {
                      props.history.push(
                        `/sagm/sale-agreement-workbench/detail/edit?agreementHeaderId=${_agmId}`
                      );
                    }
                  })
                }
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </HeadButton>
            ),
          },
          {
            show:
              agmId &&
              ['NEW', 'REJECTED', 'WAITING_PUBLISH', 'EXPIRED', 'APPROVED'].includes(agmStatus) &&
              !deleteFlag,
            comp: (
              <HeadButton
                name="delete"
                icon="delete"
                funcType="flat"
                dataSet={baseInfoDs}
                onClick={async () => {
                  const agmCode = baseInfoDs.current.get('agreementHeaderNum');
                  await deleteConfirm({
                    content: intl
                      .get('sagm.common.view.title.deleteSaleAgm', {
                        num: agmCode,
                      })
                      .d(`是否确定删除销售协议${agmCode}？`),
                    confirm: () =>
                      handleDeleteSagm(baseInfoDs, () =>
                        props.history.push('/sagm/sale-agreement-workbench/list')
                      ),
                  });
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </HeadButton>
            ),
          },
          {
            show: agmId && ['WAITING_APPROVE'].includes(agmStatus),
            comp: (
              <HeadButton
                dataSet={baseInfoDs}
                name="approvePass"
                color="primary"
                icon="check_circle"
                onClick={handleApprovePass}
                permission
                permissionList={[
                  {
                    code: approveCode,
                    type: 'button',
                    meaning: '协议工作台 -协议审批',
                  },
                ]}
              >
                {intl.get('sagm.common.view.button.approvePass').d('审批通过')}
              </HeadButton>
            ),
          },
          {
            show: agmId && ['WAITING_APPROVE'].includes(agmStatus),
            comp: (
              <HeadButton
                dataSet={baseInfoDs}
                name="approveReject"
                icon="cancel"
                funcType="flat"
                onClick={handleApproveReject}
                permission
                permissionList={[
                  {
                    code: approveCode,
                    type: 'button',
                    meaning: '协议工作台 -协议审批',
                  },
                ]}
              >
                {intl.get('sagm.common.view.button.approveReject').d('审批拒绝')}
              </HeadButton>
            ),
          },
          {
            show: agmId,
            comp: (
              <HeadButton
                dataSet={baseInfoDs}
                name="record"
                icon="operation_service_request"
                funcType="flat"
                onClick={() => viewSagmRecords(baseInfoDs.current)}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </HeadButton>
            ),
          },
        ]
      : [
          {
            comp: (
              <HeadButton
                dataSet={baseInfoDs}
                name="record"
                icon="operation_service_request"
                funcType="flat"
                onClick={() => viewSagmRecords(baseInfoDs.current)}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </HeadButton>
            ),
          },
        ];
    return btns.filter((f) => f.show || !('show' in f)).map((m) => m.comp);
  }, [agmId, agmStatus, readOnly, dataSetMap, refresh, deleteFlag]);

  // 标题
  const title = agmId
    ? readOnly
      ? intl.get('sagm.saleAgreement.view.title.viewSaleAgreement').d('查看销售协议')
      : intl.get('sagm.saleAgreement.view.title.editSaleAgreement').d('编辑销售协议')
    : intl.get('sagm.saleAgreement.view.title.createSaleAgreement').d('新建销售协议');

  // 内容区域
  const contents = [
    {
      id: 'sagm_workbench_base',
      title: intl.get('sagm.common.view.baseInfo').d('基础信息'),
      comp: BaseInfo,
      props: {
        readOnly,
        onFormLoaded,
        dataSet: dataSetMap.baseInfoDs,
        _dataSet: dataSetMap._baseInfoDs,
        agreementHeaderId: agmId,
        refresh: refresh.baseInfo,
      },
    },
    {
      id: 'sagm_workbench_strategys',
      title: intl.get('sagm.common.view.priceStragegy').d('价格策略'),
      comp: StrategyLine,
      show: agmId && agmType && agmType !== 'RECEIVE',
      props: {
        readOnly,
        viewCanEdit,
        isDelete: deleteFlag,
        isPub,
        viewSkuBackPath: currentPath,
        dataSet: dataSetMap.strategyDs,
        agreementHeaderId: agmId,
        refresh: refresh.strategys,
      },
    },
    {
      id: 'sagm_workbench_lines',
      title: intl.get('sagm.saleAgreement.view.saleLine').d('销售协议行'),
      comp: SaleLine,
      show: agmId && agmType && agmType !== 'RECEIVE',
      props: {
        path,
        isPub,
        readOnly,
        customizeTable,
        agreementHeaderId: agmId,
        refresh: refresh.saleLine,
      },
    },
    {
      id: 'sagm_workbench_receive_lines',
      title: intl.get('sagm.saleAgreement.view.saleLine').d('销售协议行'),
      comp: ReceiveSaleLine,
      show: agmId && agmType === 'RECEIVE',
      props: {
        path,
        isDelete: deleteFlag,
        readOnly: agmStatus === 'EFFECTED' ? false : readOnly,
        agmStatus,
        isPub,
        customizeTable,
        agreementHeaderId: agmId,
        refresh: refresh.saleLine,
        dataSet: dataSetMap.receiveSaleLineDs,
        onDeleteCallback: () => handleRefresh(['receiveLimit']),
      },
    },
    {
      id: 'sagm_workbench_authority',
      title: intl.get('sagm.common.view.buyPermisson').d('采买权限'),
      show: agmId,
      comp: (props) => (
        <AgreeAuthorityContext.Provider value={{ __sourceFrom: 'sale' }}>
          <Authority {...props} />
        </AgreeAuthorityContext.Provider>
      ),
      props: {
        readOnly: agmStatus === 'EFFECTED' ? false : readOnly,
        viewSkuBackPath: currentPath,
        agreementHeaderId: agmId,
        agreementHeaderNum,
        agreementHeaderType: agmType,
        agreementType: 'SALE_AGREEMENT',
        channel: agmType === 'MEMBER' ? 'PERSONAL' : 'ENTERPRISE',
        controlRange: agmType === 'MEMBER' ? 'MEMBER' : 'SALE',
      },
    },
    {
      id: 'sagm_workbench_payment',
      title: intl.get('sagm.common.view.paymentRule').d('支付规则'),
      comp: PayConfig,
      show: agmId && agmType !== 'RECEIVE',
      props: {
        readOnly,
        dataSet: dataSetMap.baseInfoDs,
        columns: 3,
        fields: [
          {
            name: agmType === 'MEMBER' ? 'paymentType' : 'paymentMethod',
            _type: 'Select',
          },
          {
            name: 'salePointsDetails',
            _type: 'Select',
            noCache: true,
            maxTagCount: 3,
            maxTagTextLength: 5,
            show: ({ record }) => {
              if (agmType !== 'MEMBER') return false;
              return record.get('paymentType') && record.get('paymentType') !== 'CASH_PAYMENT';
            },
            renderer: !readOnly
              ? null
              : ({ text }) => {
                  return typeof text === 'string' ? text?.split('/')?.join('、') || '-' : '';
                },
          },
        ],
      },
    },
    {
      id: 'sagm_workbench_receive',
      title: intl.get('sagm.common.view.title.reveiveLimit').d('领用限制'),
      show: agmId && agmType === 'RECEIVE',
      comp: ReceiveLimit,
      props: {
        readOnly,
        agreementHeaderId: agmId,
        refresh: refresh.receiveLimit,
        dataSet: dataSetMap.receiveLimitDs,
      },
    },
    {
      id: 'sagm_workbench_invoice',
      title: intl.get('sagm.common.view.invoiceRule').d('开票规则'),
      show: agmId && agmType === 'MEMBER',
      comp: Invoice,
      props: {
        readOnly,
        customizeTable,
        agreementHeaderId: agmId,
        refresh: refresh.invoice,
        dataSet: dataSetMap.invoiceDs,
        _dataSet: dataSetMap._invoiceDs,
      },
    },
    {
      id: 'sagm_workbench_expense',
      title: intl.get('sagm.common.view.orderLimit').d('下单限额'),
      show:
        agmId &&
        agmType === 'MEMBER' &&
        dataSetMap.baseInfoDs?.current?.get('paymentType') !== 'CASH_PAYMENT',
      comp: OrderLimit,
      props: {
        readOnly,
        agreementHeaderId: agmId,
        refresh: refresh.orderLimit,
        dataSet: dataSetMap.orderLimitDs,
        payDataSet: dataSetMap.baseInfoDs,
      },
    },
  ].filter((f) => f.show || !('show' in f));

  return (
    <Fragment>
      <Header title={title} backPath={isPub ? '' : '/sagm/sale-agreement-workbench/list'}>
        {headerBtns}
      </Header>
      <div className={styles['sagm-workbench-detail']}>
        {contents.map((m) => (
          <Content
            key={m.id}
            className={
              contents.length === 1
                ? 'sagm-workbench-content sagm-workbench-content-one'
                : 'sagm-workbench-content'
            }
          >
            <div id={m.id} className="content-title">
              {m.title}
            </div>
            {m.comp ? <m.comp {...m.props} /> : m.title}
          </Content>
        ))}
      </div>
      {contents.length !== 1 && (
        <AnchorPro
          list={contents}
          container={document.querySelector(`.${styles['sagm-workbench-detail']}`)}
        />
      )}
    </Fragment>
  );
}

export default flowRight(
  withCustomize({
    unitCode: [
      'SAGM.SALE_WORKBENCH.DETAIL_LINE.TABLE',
      'SAGM.SALE_WORKBENCH.DETAIL.INVOICE.TABLE',
      'SAGM.SALE_WORKBENCH.DETAIL.INVOICE.TABLE_READONLY',
      'SAGM.SALE_WORKBENCH.RECEIVE.TABLE.BYNS',
      'SAGM.SALE_WORKBENCH.COMMON.TABLE.BTNS',
    ],
  }),
  formatterCollections({
    code: [
      'sagm.common',
      'sagm.saleAgreement',
      'sagm.priceStrategy',
      'sagm.productAuthority',
      'small.common',
      'smpc.product',
    ],
  }),
  observer
)(SagmDetail);
