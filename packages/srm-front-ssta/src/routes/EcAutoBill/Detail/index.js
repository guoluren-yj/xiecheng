import React, { Fragment, useMemo, useEffect, useState, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose } from 'lodash';
import { observer } from 'mobx-react';
import DynamicButtons from '_components/DynamicButtons';

import Line from './Line';
import BasicInfo from './BasicInfo';
import { formatDynamicBtns } from '@/utils/utils';
import { getPermissions } from '@/routes/Components';
import { operationDS } from '@/routes/pubDS/operationDS';
import { lineDS, headerDS } from '@/stores/EcAutoBillDS';
import EcAutoRecord from '@/routes/Components/EcAutoRecord';
import {
  save,
  match,
  confirm,
  returnBack,
  getEcLines,
  billFail,
} from '@/services/ecAutoBillService';
import Styles from '@/routes/common.less';

const lineCustomizeUnitCode = [
  'SSTA.ECAUTO_BILL_DETAIL.EC',
  'SSTA.ECAUTO_BILL_DETAIL.OPTION',
  'SSTA.ECAUTO_BILL_DETAIL.PRICE',
  'SSTA.ECAUTO_BILL_DETAIL.FILTER',
].join();

const matchCustomizeUnitCode = [
  'SSTA.ECAUTO_BILL_DETAIL.EC',
  'SSTA.ECAUTO_BILL_DETAIL.OPTION',
  'SSTA.ECAUTO_BILL_DETAIL.PRICE',
].join();

const { Panel } = Collapse;
const defaultActiveKey = ['basic', 'line'];

const Detail = (props) => {
  const {
    history,
    customizeTable,
    match: {
      params: { autoBillId, action },
    },
  } = props;
  const updateFlag = action === 'update';
  const createFlag = autoBillId === 'create';
  const isShowEditBtnFlag = action !== 'readOnly' && autoBillId !== 'create';
  const headerDs = useMemo(() => new DataSet(headerDS()), []);

  const lineDs = useMemo(() => new DataSet(lineDS()), []);

  const [lineTotalCount, setLineTotalCount] = useState(0);

  // 权限集
  const [permsMap, setPermsMap] = React.useState(new Map());

  const operationDs = useMemo(
    () =>
      new DataSet(
        operationDS({
          url: `/ssta/v1/${getCurrentOrganizationId()}/auto-bill-actions/`,
          pk: 'autoBillId',
          urlPramas: true,
          lookupCode: 'SSTA.AUTO_BILL_ACTION_STATUS',
          lovPara: { autoBillId },
          isFilter: true,
        })
      ),
    []
  );

  const loading = headerDs.status !== 'ready';
  const setLoading = useCallback(
    (flag) => {
      headerDs.status = flag ? 'loading' : 'ready';
    },
    [headerDs]
  );

  useEffect(() => {
    getPermissionList();
    if (autoBillId !== 'create') {
      headerDs.setQueryParameter('autoBillId', autoBillId);
      lineDs.setQueryParameter('autoBillId', autoBillId);
      headerDs.query().then((res) => {
        const { ecBillDimension } = res || {};
        lineDs.setState('isPoAllFlag', ['EC_PO_SUB_NUM_ALL'].includes(ecBillDimension));
        // 获取总数据
        getEcLines({
          autoBillId,
          customizeUnitCode: lineCustomizeUnitCode,
        }).then((res) => {
          if (getResponse(res)) {
            setLineTotalCount(res);
          }
        });
      });
    }
  }, [autoBillId, headerDs, lineDs]);

  /**
   * 获取明细信息数据
   */
  const getLineData = () => {
    lineDs.query().then(() => {
      getEcLines({ autoBillId, customizeUnitCode: lineCustomizeUnitCode }).then((res) => {
        if (getResponse(res)) {
          setLineTotalCount(res);
        }
      });
    });
  };

  /**
   * 获取权限集数据
   */
  const getPermissionList = async () => {
    const data = await getPermissions([
      'srm.settle-account.reconciliation-workbench.bill-platform.ps.return',
      'srm.settle-account.reconciliation-workbench.bill-platform.ps.confirm',
      'srm.settle-account.reconciliation-workbench.bill-platform.button.detail.button.billfail',
    ]);
    if (data) {
      setPermsMap(data);
    }
  };

  const isPoAllFlag = lineDs?.getState('isPoAllFlag');

  // customCode:个性化编码，如果有就是用
  const handleAction = async ({ opt, noBackFlag, customCode, action }) => {
    const headerFlag = await headerDs.validate();
    const lineFlag = await lineDs.validate();
    const headerData = headerDs.toData()[0];
    const ecBillLineList = lineDs.toData();

    const handleOpr = async () => {
      if (headerFlag && lineFlag) {
        setLoading(true);
        const res = getResponse(
          await opt({
            ...headerData,
            ecBillLineList,
            customizeUnitCode: customCode || lineCustomizeUnitCode,
          })
        );
        setLoading(false);
        if (res) {
          notification.success();
          if (noBackFlag) {
            headerDs.query();
            getLineData();
          } else {
            history.push({
              pathname: '/ssta/ec-auto-bill/list',
            });
          }
        }
      }
    };

    if (['billFail'].includes(action)) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            <p>
              {intl
                .get('ssta.ecAutoBill.view.Message.title.billFailFirstWarning')
                .d('您当前操作退回了该对账单，但由于第三方电商暂不支持线上退回；')}
            </p>
            <p>
              {intl
                .get('ssta.ecAutoBill.view.Message.title.billFailSecondWarning')
                .d(
                  '请您一定要在线下与电商方运维人员沟通确认后，再操作退回，否则您当月的对账单将无法线上处理！'
                )}
            </p>
          </div>
        ),
        onOk: handleOpr,
      });
    } else {
      return handleOpr();
    }
  };

  //  新建时保存
  const handleSave = async (opt) => {
    const headerFlag = await headerDs.validate();
    const headerData = headerDs.toData()[0];
    if (headerFlag) {
      setLoading(true);
      const res = getResponse(
        await opt({
          ...headerData,
        })
      );
      setLoading(false);

      if (res) {
        notification.success();
        const { billStatus } = res || {};
        if (['NEW', 'BILL_RETURN', 'AUTO_BILL_FAIL'].includes(billStatus)) {
          // 进入可编辑页
          history.push({
            pathname: `/ssta/ec-auto-bill/detail/${res.autoBillId}/update`,
          });
        } else {
          history.push({
            pathname: `/ssta/ec-auto-bill/detail/${res.autoBillId}/readOnly`,
          });
        }
        // headerDs.setQueryParameter('autoBillId', res.autoBillId);
        // headerDs.query();
        // getLineData()
      }
    }
  };

  const headerBtns = () => {
    const allBtns = [
      permsMap.get(`srm.settle-account.reconciliation-workbench.bill-platform.ps.confirm`) &&
        isShowEditBtnFlag && {
          name: 'check',
          child: intl.get('hzero.common.button.confirm').d('确认'),
          btnProps: {
            icon: 'check',
            onClick: () => handleAction({ opt: confirm }),
            loading,
            wait: 600,
          },
        },
      permsMap.get(`srm.settle-account.reconciliation-workbench.bill-platform.ps.return`) &&
        isShowEditBtnFlag &&
        !isPoAllFlag && {
          name: 'return',
          child: intl.get('hzero.common.button.return').d('退回'),
          btnProps: {
            icon: 'reply',
            onClick: () => handleAction({ opt: returnBack }),
            loading,
            wait: 600,
          },
        },

      permsMap.get(
        `srm.settle-account.reconciliation-workbench.bill-platform.button.detail.button.billfail`
      ) &&
        isShowEditBtnFlag &&
        isPoAllFlag && {
          name: 'billFail',
          child: intl.get('ssta.ecAutoBill.view.button.billFailed').d('对账失败'),
          btnProps: {
            icon: 'reply',
            onClick: () => handleAction({ opt: billFail, action: 'billFail' }),
            loading,
            wait: 600,
          },
        },
      action !== 'readOnly' && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          onClick: () =>
            autoBillId === 'create'
              ? handleSave(save)
              : handleAction({ opt: save, noBackFlag: true }),
          loading,
          wait: 600,
        },
      },
      isShowEditBtnFlag && {
        name: 'getApp',
        child: intl
          .get('ssta.ecAutoBill.view.button.matchEcBillOrUpdateBillResult')
          .d('获取电商账单/更新对账结果'),
        btnProps: {
          icon: 'get_app',
          onClick: () =>
            handleAction({ opt: match, noBackFlag: true, customCode: matchCustomizeUnitCode }),
          loading,
          wait: 600,
        },
      },
      autoBillId !== 'create' && {
        name: 'operation',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          color: 'default',
          onClick: () => openOprationModal(),
          loading,
        },
      },
    ];
    return formatDynamicBtns(allBtns);
  };
  /**
   * 操作记录
   * @param {记录} record
   */

  const openOprationModal = () => {
    operationDs.setQueryParameter('autoBillId', autoBillId);
    Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: {
        width: '742px',
      },
      className: 'ssta-medium-modal',
      children: <EcAutoRecord operationDs={operationDs} isFilter autoBillId={autoBillId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const title =
    action === 'update'
      ? intl.get(`ssta.ecAutoBill.view.title.updateEcBillOnline`).d('编辑电商线上对账')
      : autoBillId === 'create'
      ? intl.get(`ssta.ecAutoBill.view.title.createEcBillOnline`).d('新建电商线上对账')
      : intl.get(`ssta.ecAutoBill.view.title.ecBillOnline`).d('电商线上对账');

  const panelList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get('ssta.ecAutoBill.view.title.basicInfo').d('基本信息'),
        content: (
          <BasicInfo
            headerDs={headerDs}
            updateFlag={updateFlag}
            createFlag={createFlag}
            isPoAllFlag={isPoAllFlag}
            isShowEditBtnFlag={isShowEditBtnFlag}
          />
        ),
      },
      !createFlag && {
        key: 'line',
        header: intl.get('ssta.ecAutoBill.view.title.billDetailInfo').d('对账明细信息'),
        content: (
          <Line
            {...props}
            lineDs={lineDs}
            updateFlag={updateFlag}
            isPoAllFlag={isPoAllFlag}
            lineTotalCount={lineTotalCount}
            customizeTable={customizeTable}
          />
        ),
      },
    ].filter(Boolean);
  }, [
    lineDs,
    headerDs,
    updateFlag,
    createFlag,
    isPoAllFlag,
    lineTotalCount,
    customizeTable,
    props,
    isShowEditBtnFlag,
  ]);

  return (
    <Fragment>
      <Header title={title} backPath="/ssta/ec-auto-bill/list">
        <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={headerBtns()} />
      </Header>
      <Content
        className={Styles[`collapse-content`]}
        wrapperClassName={Styles[`collapse-content-wrap`]}
      >
        <Collapse
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          defaultActiveKey={defaultActiveKey}
        >
          {panelList.map((item) => {
            const { content, ...panelProps } = item;
            return (
              <Panel forceRender showArrow={false} {...panelProps}>
                {content}
              </Panel>
            );
          })}
        </Collapse>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['ssta.ecAutoBill', 'hzero.common', 'ssta.reconciliationWorkbenchSup'],
  }),
  withCustomize({
    unitCode: [
      'SSTA.ECAUTO_BILL_DETAIL.SETTLEMENTINFORMATION',
      'SSTA.ECAUTO_BILL_DETAIL.EC',
      'SSTA.ECAUTO_BILL_DETAIL.OPTION',
      'SSTA.ECAUTO_BILL_DETAIL.PRICE',
      'SSTA.ECAUTO_BILL_DETAIL.FILTER',
    ],
  }),
  observer
)(Detail);
