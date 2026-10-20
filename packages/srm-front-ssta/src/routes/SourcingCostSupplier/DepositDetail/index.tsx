import React, { Fragment, useMemo, useContext, useCallback, useEffect } from 'react';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';

import Summary from './Summary';
import CostRule from './CostRule';
import BasicInfo from './BasicInfo';
import PayRecord from './PayRecord';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import { formatDynamicBtns } from '../../../utils/utils';
import DepositPay from '../components/DepositPay';
import SyncRecord from '../components/SyncRecord';
import TransferOutRecord from './TransferOutRecord';
import { depositActionFlagger } from '../utils/utils';
import DepositReturn from '../components/DepositReturn';
import { DepositDetailBtnsUnitCode, DepositDetailCollapseUnitCode } from '../utils/type';
import OperationRecord from '../components/OperationRecord';
import styles from '../index.less';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'pay',
  'transfer',
  'sync',
];

const Detail = () => {

  const {
    remote,
    allFlag,
    pubFlag,
    loading,
    depositId,
    modalFlag,
    permissionMap,
    depositHeaderDs,
    customizeCollapse,
    customizeBtnGroup,
  } = useContext<StoreValueType>(Store);

  const { payConfirmFlag, returnSupplierFlag } = depositActionFlagger(depositHeaderDs.current);

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`ssta.sourcingCost.view.title.basicInfo`).d('基本信息'),
        content: <BasicInfo />,
      },
      {
        key: 'pay',
        header: intl.get(`ssta.sourcingCost.view.title.payRecord`).d('缴纳记录'),
        content: <PayRecord />,
      },
      {
        key: 'transfer',
        header: intl.get(`ssta.sourcingCost.view.title.transferOutRecord`).d('转出记录'),
        content: <TransferOutRecord />,
      },
      {
        key: 'sync',
        header: intl.get(`ssta.sourcingCost.view.title.syncRecord`).d('同步记录'),
        content: <SyncRecord feeDs={depositHeaderDs} docType='deposit' />,
      },
    ].filter((item) => item);
  }, [depositHeaderDs]);

  useEffect(() => {
    if (remote?.event) {
      remote.event.fireEvent('onLoad', {
        depositHeaderDs,
      });
    }
  }, [depositHeaderDs]);

  const handleConfirmPayCallback = async () => {
    await depositHeaderDs.query();
    if (remote?.event) {
      await remote.event.fireEvent('handleConfirmPayCallback', { depositHeaderDs });
    }
  };

  const handleReturnSupplierCallback = async () => {
    await depositHeaderDs.query()
    if (remote?.event) {
      await remote.event.fireEvent('handleReturnSupplierCallback', { depositHeaderDs });
    }
  };

  // 保证金缴纳
  const handleConfirmPay = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + depositHeaderDs.current?.get('depositNum'),
      children: <DepositPay depositRecord={depositHeaderDs.current} okCallback={handleConfirmPayCallback} remote={remote} />,
    });
  }, [depositHeaderDs]);

  // 保证金退回
  const handleReturnSupplier = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.returnSupplier').d('退回供应商') + depositHeaderDs.current?.get('depositNum'),
      children: <DepositReturn depositRecord={depositHeaderDs.current} okCallback={handleReturnSupplierCallback} remote={remote}/>,
    });
  }, [depositHeaderDs]);

  const handleViewCostRule = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.sourcingCostRule').d('寻源费用规则'),
      className: styles['ssta-small-modal'],
      children: <CostRule />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const handleViewOperation = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      className: styles['ssta-medium-modal'],
      children: <OperationRecord depositId={depositId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [depositId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      allFlag && payConfirmFlag && permissionMap?.get('depositPayConfirm') && {
        name: 'payConfirm',
        child: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
        btnProps: {
          loading,
          wait: 1500,
          icon: 'auto_complete',
          onClick: handleConfirmPay,
        },
      },
      allFlag && returnSupplierFlag && permissionMap?.get('depositReturnSupplier') && {
        name: 'returnSupplier',
        child: intl.get('ssta.sourcingCost.view.button.returnSupplier').d('退回供应商'),
        btnProps: {
          loading,
          icon: 'reply_all',
          onClick: handleReturnSupplier,
        },
      },
      permissionMap?.get('depositPrint') && {
        name: 'print',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get('ssta.common.view.button.print').d('打印'),
          buttonProps: { funcType: 'flat', wait: 1000 },
          requestUrl: `${apiPrefix}/deposits/list-print-new`,
          method: 'PUT',
          data: { depositIdList: [depositId], menuCamp: 'SUPPLIER' },
          successCallBack: () => depositHeaderDs.query(),
          loading,
        },
      },
      {
        name: 'costRule',
        child: intl.get('ssta.sourcingCost.view.button.sourcingCostRule').d('寻源费用规则'),
        btnProps: {
          loading,
          icon: 'ballot',
          funcType: FuncType.flat,
          color: ButtonColor.default,
          onClick: handleViewCostRule,
        },
      },
      {
        name: 'operationRecord',
        child: intl.get('hzero.common.button.operation').d('操作记录'),
        btnProps: {
          loading,
          icon: 'assignment',
          funcType: FuncType.flat,
          color: ButtonColor.default,
          onClick: handleViewOperation,
        },
      },
    ];
    const otherProps = { allFlag, loading, depositHeaderDs };
    const processBtns = remote
      ? remote.process('SSTA.DEPOSIT_DETAIL_SUP_CUX.HEAD_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    loading,
    allFlag,
    depositId,
    permissionMap,
    payConfirmFlag,
    depositHeaderDs,
    handleConfirmPay,
    returnSupplierFlag,
    handleViewCostRule,
    handleViewOperation,
    handleReturnSupplier,
  ]);

  return (
    <Fragment>
      {!modalFlag && (
        <Header
          backPath={pubFlag ? undefined : "/ssta/supplier-sourcing-cost/list"}
          title={intl.get('ssta.sourcingCost.view.title.securityDepositDetail').d('供应商保证金详情')}
        >
          {customizeBtnGroup(
            { code: DepositDetailBtnsUnitCode.HEAD, pro: true },
            <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={buttons} />
          )}
        </Header>
      )}
      <Content className={`${modalFlag && styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-sourcingCost']}`}>
        <Spin spinning={loading}>
          {remote ? remote.render('SSTA.DEPOSIT_DETAIL_SUP_CUX.HEAD_SUMMARY', <Summary />) : <Summary />}
          {
            customizeCollapse({
              code: DepositDetailCollapseUnitCode.COLLAPSE,
            },
              <Collapse
                ghost
                trigger="icon"
                expandIconPosition="text-right"
                defaultActiveKey={defaultActiveKey}
              >
                {paneList.map((item) => {
                  const { content, ...panelProps } = item;
                  return (
                    <Panel {...panelProps}>
                      {content}
                    </Panel>
                  );
                })}
              </Collapse>
              )
            }
        </Spin>
      </Content>
    </Fragment>
  );
};

const DepositDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default DepositDetail;