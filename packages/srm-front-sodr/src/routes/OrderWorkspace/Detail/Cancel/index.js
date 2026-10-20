/*
 * Cancel - 订单明细页-订单取消/关闭
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { DataSet, Modal, TextArea, Form } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { Spin, Collapse } from 'choerodon-ui';
import { compose, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import querystring from 'querystring';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import remotes from 'utils/remote';

import AttachmentInfo from '@/routes/components/AttachmentInfo';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import OrderAffix from '@/routes/components/OrderAffix';
import {
  cancelOrder,
  closeOrder,
  handleRevoke,
  handleTerminate,
  handleUnifyRecall,
} from '@/services/orderWorkspaceService';
import {
  queryCommonDoubleUomConfig,
  openTermsModal,
  getPaymentPlanConfig,
  getDisplayDocAndDocFlow,
} from '@/routes/components/utils';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import { basicInfo, organizationInfo, reason, receiptInfo, billingInfo } from './store/cancelDs';
import { detailInfo } from './store/OrderDetailLineDs';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import OrderDetailLine from './OrderDetailLine';
import ReceiptInfo from './ReceiptInfo';
import BillingInfo from './BillingInfo';
import remoteConfig from './remote';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const prefix = 'sodr.workspace';
const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'giftInfo',
  'receiptInfo',
  'billingInfo',
  'paymentTermInfo',
];
const Cancel = (props) => {
  const {
    remote,
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceType, sourceId } = {}, search },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
  } = props;
  // 后续统一使用action标识页面操作类型
  // action:['revoke','close','cancel','unifyRecall']
  const { revoke, close, cancel, unifyRecall, terminate } = useMemo(() => {
    const searchParam = querystring.parse(search.substr(1));
    return { ...searchParam, [searchParam?.action]: true };
  }, [search]);
  const [loadings, setLoadings] = useState({});
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const backPath = useMemo(
    () =>
      source === 'all'
        ? `/sodr/order-workspace/detail/all-orders/${id}`
        : sourceType === 'copy'
        ? `/sodr/order-workspace/detail/all-orders/${sourceId}`
        : '/sodr/order-workspace/list',
    [source, sourceType]
  );
  const basicInfoDs = useMemo(
    () =>
      new DataSet({
        ...basicInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo()), []);
  const detailInfoDs = useMemo(
    () =>
      new DataSet({
        ...detailInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const giftInfoDs = useMemo(() => new DataSet(giftInfoDsConfig({ poHeaderId: id })), [id]);
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [id]);
  const basicCurrent = basicInfoDs.current;
  const { giftFlag, oldTermHideFlag } = basicCurrent.get(['giftFlag', 'oldTermHideFlag']);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return id && giftFlag;
  }, [id, giftFlag]);
  const reasonDs = useMemo(() => new DataSet(reason()), []);
  const receiptInfoDs = useMemo(() => new DataSet(receiptInfo()), []);
  const billingInfoDs = useMemo(() => new DataSet(billingInfo()), []);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [1, 1, 1],
    }),
    []
  );

  const getValues = useCallback(() => {
    const poHeaderDetailDTO = basicInfoDs.toJSONData()[0];
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    const values = {
      poHeaderDetailDTO: { ...poHeaderDetailDTO, poWorkbenchFlag: 1 },
      poLineDetailDTOs,
    };
    return values;
  }, [basicInfoDs, detailInfoDs]);

  const contentList = useMemo(() => {
    const poSourcePlatform = basicInfoDs?.current?.get('poSourcePlatform');
    const list = [
      {
        key: 'basicInfo',
        content: (
          <Panel
            key="basicInfo"
            id="order-workSpace-detail-content-basicInfo"
            header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
          >
            <BasicInfo ds={basicInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'organizationInfo',
        content: (
          <Panel
            key="organizationInfo"
            id="order-workSpace-detail-content-organizationInfo"
            header={intl.get('sodr.workspace.view.panel.organization').d('交易方及采买组织信息')}
          >
            <OrganizationInfo ds={organizationInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'detailInfo',
        content: (
          <Panel
            key="detailInfo"
            id="order-workSpace-detail-content-detailInfo"
            header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
          >
            <OrderDetailLine
              remote={remote}
              ds={detailInfoDs}
              basicInfoDs={basicInfoDs}
              customizeTable={customizeTable}
              displayDocAndDocFlow={displayDocAndDocFlow}
            />
          </Panel>
        ),
      },
      {
        key: 'giftInfo',
        content: (
          <Panel
            hidden={!hasGift}
            key="giftInfo"
            id="order-workSpace-detail-content-giftInfo"
            header={intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息')}
          >
            <GiftInfo ds={giftInfoDs} />
          </Panel>
        ),
      },
      {
        key: 'paymentTermInfo',
        content: (
          <Panel
            hidden={!oldTermHideFlag}
            key="paymentTermInfo"
            id="order-workSpace-detail-content-paymentTermInfo"
            header={intl.get('sodr.workspace.view.panel.paymentTermInfo').d('订单付款条款信息')}
          >
            <PaymentTermInfo
              ds={paymentTermInfoDs}
              customizeForm={customizeForm}
              customizeCode="SODR.WORKSPACE_CANCEL_DETAIL.PAYMENTTERMINFO"
              getValues={getValues}
            />
          </Panel>
        ),
      },
      {
        key: 'receiptInfo',
        content: (
          <Panel
            key="receiptInfo"
            id="order-workSpace-detail-content-receiptInfo"
            header={intl.get('sodr.workspace.view.panel.receiptInfo').d('收货/收单信息')}
          >
            <ReceiptInfo ds={receiptInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'billingInfo',
        content: (
          <Panel
            key="billingInfo"
            id="order-workSpace-detail-content-billingInfo"
            header={intl.get('sodr.workspace.view.panel.billingInfo').d('开票信息')}
          >
            <BillingInfo ds={billingInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'attachmentInfo',
        content: (
          <Content className={styles['order-workspace-detail-content']}>
            <AttachmentInfo
              ds={basicInfoDs}
              poHeaderId={id}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              customizeCode={[
                'SODR.WORKSPACE_CANCEL_DETAIL.ATTACHMENTINFO',
                'SODR.WORKSPACE_CANCEL_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
            />
          </Content>
        ),
      },
    ];
    const panels = remote.process('processPanels', list, { basicInfoDs, id });
    if (poSourcePlatform === 'CATALOGUE') {
      return panels.filter((i) => i.key !== 'billingInfo');
    } else if (poSourcePlatform === 'E-COMMERCE') {
      return panels;
    } else {
      return panels.filter((i) => !['receiptInfo', 'billingInfo'].includes(i.key));
    }
  });

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  useEffect(() => {
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
    });
    if (id) {
      loading({ all: true });
      fetchDoubleUom();
      getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
      basicInfoDs.query().then((res) => {
        loading({ all: false });
        if (res) {
          if (res.giftFlag) {
            giftInfoDs.query();
          }
          organizationInfoDs.loadData([res]);
          paymentTermInfoDs.loadData([res]);
          receiptInfoDs.create(res);
          billingInfoDs.loadData([res]);
        }
      });
      // detailInfoDs.query();
    }
  }, []);

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs].forEach((i) => {
      i.setState(state);
    });
  };

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  const operationList = basicInfoDs?.current?.get('operationList') || [];

  // close OR cancel
  const action = async (type) => {
    const basicDsCurrent = basicInfoDs?.current;
    const basicData = basicDsCurrent?.toJSONData() || {};
    const isCancel = type === 'cancel';
    const code = isCancel
      ? 'SODR.WORKSPACE_CANCEL_DETAIL.CANCEL_MODAL'
      : 'SODR.WORKSPACE_CANCEL_DETAIL.CLOSE_MODAL';
    const { paymentPlanNum, displayPoNum, termsCode } = basicData;
    const onOk = async () => {
      const status = await reasonDs.validate();
      if (!status) return false;
      loading({ [type]: true });
      const data = [{ ...basicData, ...reasonDs?.current?.toJSONData() }];
      const res = getResponse(
        await (isCancel
          ? cancelOrder(data, { customizeUnitCode: code })
          : closeOrder(data, { customizeUnitCode: code }))
      );
      loading({ [type]: false });
      if (res) {
        notification.success();
        history.push({
          pathname: backPath,
          state: { _back: -1 },
        });
      }
      return !!res;
    };
    const modalProps = {
      style: { width: 380 },
      drawer: true,
      title: isCancel
        ? intl.get('sodr.workspace.model.common.cancellationReason').d('取消原因')
        : intl.get('sodr.workspace.model.common.closingReason').d('关闭原因'),
      children: customizeForm(
        {
          code,
        },
        <Form dataSet={reasonDs} columns={1} labelLayout="float">
          <TextArea
            name="closeCancelRemark"
            placeholder={
              isCancel
                ? intl.get('sodr.workspace.view.message.cancellationReason').d('请输入取消原因')
                : intl.get('sodr.workspace.view.message.closingReason').d('请输入关闭原因')
            }
          />
        </Form>
      ),
      onOk,
      afterClose: () => {
        reasonDs.reset();
      },
      okProps: { loading: loadings[type] },
    };
    const beforRes = await remote.event.fireEvent('beforAction', true, {
      basicInfoDs,
      basicData,
      type,
      context: props,
    });
    if (!beforRes) return false;
    if (
      paymentPlanNum &&
      isCancel &&
      (await getPaymentPlanConfig({
        sourceCode: 'ORDER',
        sourceDisplayNum: displayPoNum,
        termNum: termsCode,
      }))
    ) {
      return openTermsModal({ type: 'cancel', record: basicDsCurrent }, basicData, modalProps);
    } else {
      Modal.open(modalProps);
    }
  };
  const handleRecord = () => {
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <C7nOperationApprove poHeaderId={id} modal={modal} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // recall OR unifyRecall
  const comfirmHandleRevoke = (type) => {
    const { poHeaderId } = basicInfoDs.toJSONData()[0];
    const isRecall = type === 'recall';
    Modal.confirm({
      title: isRecall
        ? intl.get('sodr.common.model.common.confirmRevoke').d('是否确认撤销变更')
        : intl.get('sodr.common.model.common.confirmunifyRecall').d('是否确认撤销审批'),
      okText: intl.get('sodr.common.button.sure').d('确定'),
      cancelText: intl.get('sodr.common.view.button.canceled').d('取消'),
      onOk: throttle(
        () => {
          loading({ [type]: true });
          (isRecall ? handleRevoke : handleUnifyRecall)({ poHeaderId }).then((res) => {
            loading({ [type]: false });
            if (getResponse(res)) {
              history.push({
                pathname: backPath,
                state: { _back: -1 },
              });
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const handleTerminateSign = () => {
    const { pcHeaderId } = basicInfoDs.toJSONData()[0];
    Modal.confirm({
      title: intl.get('sodr.common.model.common.confirmTerminate').d('是否确认发起解约'),
      okText: intl.get('sodr.common.button.sure').d('确定'),
      cancelText: intl.get('sodr.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          loading({ terminate: true });
          handleTerminate({ pcHeaderId }).then((res) => {
            loading({ terminate: false });
            if (getResponse(res)) {
              history.push({
                pathname: backPath,
                state: { _back: -1 },
              });
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const HeaderBtns = observer(() => {
    const headerBtnLoading =
      loadings.cancel ||
      loadings.close ||
      loadings.revoke ||
      loadings.recall ||
      loadings.terminate ||
      loadings.unifyRecall ||
      basicInfoDs.status !== 'ready' ||
      detailInfoDs.status !== 'ready';
    const headerBtns = [
      {
        name: 'record',
        btnComp: Button,
        child: intl.get('sodr.workspace.view.button.operationRecord').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: handleRecord,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.record',
              type: 'c7n-pro',
              meaning: '订单工作台-取消明细-操作记录',
            },
          ],
        },
      },
      cancel &&
        operationList.includes('CANCEL') && {
          name: 'cancel',
          btnComp: Button,
          child: intl.get(`sodr.workspace.view.button.cancel`).d('取消'),
          btnProps: {
            wait: THROTTLE_TIME,
            icon: 'cancel',
            type: 'c7n-pro',
            color: 'primary',
            onClick: () => action('cancel'),
            loading: headerBtnLoading,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.cancel',
                type: 'c7n-pro',
                meaning: '订单工作台-取消明细-取消',
              },
            ],
          },
        },
      close &&
        operationList.includes('CLOSE') && {
          name: 'close',
          btnComp: Button,
          child: intl.get(`sodr.workspace.view.button.close`).d('关闭'),
          btnProps: {
            wait: THROTTLE_TIME,
            icon: 'not_interested',
            type: 'c7n-pro',
            color: 'primary',
            onClick: () => action('close'),
            loading: headerBtnLoading,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.close',
                type: 'c7n-pro',
                meaning: '订单工作台-取消明细-关闭',
              },
            ],
          },
        },
      revoke &&
        operationList.includes('RECALL') && {
          name: 'revoke',
          type: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sodr.common.model.common.revoke`).d('撤销变更'),
          btnProps: {
            icon: 'cancel',
            color: 'primary',
            type: 'c7n-pro',
            onClick: () => comfirmHandleRevoke('recall'),
            loading: headerBtnLoading,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.revoke',
                type: 'c7n-pro',
                meaning: '订单工作台-变更明细-撤销变更',
              },
            ],
          },
        },
      unifyRecall &&
        operationList.includes('UNIFY_RECALL') && {
          name: 'unifyRecall',
          btnComp: Button,
          child: intl.get(`sodr.common.view.button.unifyRecall`).d('撤销审批'),
          btnProps: {
            icon: 'reply',
            color: 'primary',
            type: 'c7n-pro',
            onClick: () => comfirmHandleRevoke('unifyRecall'),
            loading: headerBtnLoading,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.canceldetail.unifyRecall',
                meaning: '订单工作台-取消明细-撤销审批',
              },
            ],
          },
        },
      terminate &&
        operationList.includes('TERMINATE') && {
          name: 'terminate',
          btnComp: Button,
          child: intl.get(`sodr.common.view.button.terminate`).d('发起解约'),
          btnProps: {
            icon: 'reply',
            color: 'primary',
            type: 'c7n-pro',
            onClick: () => handleTerminateSign(),
            loading: headerBtnLoading,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.cancelsigingdetail.terminate',
                meaning: '订单工作台-撤销签署明细-发起解约',
              },
            ],
          },
        },
    ];
    return customizeBtnGroup(
      {
        code: 'SODR.WORKSPACE_CANCEL_DETAIL.BUTTONS',
        pro: true,
      },
      <DynamicButtons buttons={headerBtns} />
    );
  });
  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
      >
        <HeaderBtns />
      </Header>
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_CANCEL_DETAIL.COLLAPSE',
            },
            <Collapse
              trigger="text-icon"
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {contentList.map((i) => i.content)}
            </Collapse>
          )}
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_CANCEL_DETAIL.BASICINFO',
      'SODR.WORKSPACE_CANCEL_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_CANCEL_DETAIL.DETAILINFO',
      // 'SODR.WORKSPACE_CANCEL_DETAIL.OTHERINFO',
      // 'SODR.WORKSPACE_CANCEL_DETAIL.PARTNER',
      'SODR.WORKSPACE_CANCEL_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_CANCEL_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_CANCEL_DETAIL.BOM',
      // 'SODR.WORKSPACE_CANCEL_DETAIL.TABS',
      'SODR.WORKSPACE_CANCEL_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_CANCEL_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_CANCEL_DETAIL.BUTTONS',
      'SODR.WORKSPACE_CANCEL_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_CANCEL_DETAIL.CANCEL_MODAL',
      'SODR.WORKSPACE_CANCEL_DETAIL.CLOSE_MODAL',
      'SODR.WORKSPACE_CANCEL_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig)
)(Cancel);
