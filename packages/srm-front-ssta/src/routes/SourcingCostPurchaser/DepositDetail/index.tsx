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
import SyncRecord from '../components/SyncRecord';
import DepositPay from '../components/DepositPay';
import { formatDynamicBtns } from '../../../utils/utils';
import TransferOutRecord from './TransferOutRecord';
import { depositActionFlagger } from '../utils/utils';
import DepositReturn from '../components/DepositReturn';
import { DepositDetailBtnsUnitCode, DepositDetailCollapseUnitCode } from '../utils/type';
import OperationRecord from '../components/OperationRecord';
import styles from '../index.less';
// import DepositProgressCtrl from '../components/DepositProgressCtrl';

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
    onLoad,
    onFormLoaded,
  } = useContext<StoreValueType>(Store);

  const { payConfirmFlag, returnSupplierFlag, sourcingProgressCtrlFlag } = depositActionFlagger(depositHeaderDs.current);

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
        content: <SyncRecord feeDs={depositHeaderDs} docType="deposit" okCallback={() => depositHeaderDs.query()} />,
      },
    ].filter((item) => item);
  }, [depositHeaderDs]);

  useEffect(() => {
    if (remote?.event) {
      remote.event.fireEvent('onLoad', {
        depositHeaderDs,
        onLoad,
      });
    }
  }, []);

  useEffect(() => {
    if (onFormLoaded && depositHeaderDs?.current?.get('depositId')) {
      onFormLoaded(true);
    }
  }, [depositHeaderDs?.current, onFormLoaded])

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
  const handleReturnSupplier = useCallback(async () => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.returnSupplier').d('退回供应商') + depositHeaderDs.current?.get('depositNum'),
      children: <DepositReturn depositRecord={depositHeaderDs.current} okCallback={handleReturnSupplierCallback} remote={remote} options={{ processDSOptionDataCode: "SSTA.DEPOSIT_DETAIL_PUR_CUX.DEPOSITERETURNDS_OPTION_DATA", }} />,
    });
  }, [depositHeaderDs]);

  // // 寻源过程控制
  // const handleCtrlSourcingProgress = useCallback(() => {
  //   Modal.open({
  //     drawer: true,
  //     closable: true,
  //     key: Modal.key(),
  //     className: styles['ssta-small-modal'],
  //     title: intl.get('ssta.sourcingCost.view.button.sourcingProgressCtrl').d('寻源过程控制') + depositHeaderDs.current?.get('depositNum'),
  //     children: <DepositProgressCtrl depositRecord={depositHeaderDs.current} okCallback={() => depositHeaderDs.query()} />,
  //   });
  // }, [depositHeaderDs]);

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
      allFlag && payConfirmFlag && permissionMap?.get('depositPay') && {
        name: 'payConfirm',
        child: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
        btnProps: {
          loading,
          icon: 'auto_complete',
          onClick: handleConfirmPay,
        },
      },
      allFlag && returnSupplierFlag && permissionMap?.get('depositReturn') && {
        name: 'returnSupplier',
        child: intl.get('ssta.sourcingCost.view.button.returnSupplier').d('退回供应商'),
        btnProps: {
          loading,
          icon: 'reply_all',
          onClick: remote?.process('SSTA.DEPOSIT_DETAIL_PUR_CUX.RETURN_SUPPLIER_CLICK', handleReturnSupplier, { depositRecord: depositHeaderDs?.current }),
        },
      },
      // allFlag && sourcingProgressCtrlFlag && permissionMap?.get('depositProgressCtrl') && {
      //   name: 'sourcingProgressCtrl',
      //   child: intl.get('ssta.sourcingCost.view.button.sourcingProgressCtrl').d('寻源过程控制'),
      //   btnProps: {
      //     loading,
      //     icon: 'manage_project',
      //     onClick: handleCtrlSourcingProgress,
      //   },
      // },
      permissionMap?.get('depositPrint') && {
        name: 'print',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get('ssta.common.view.button.print').d('打印'),
          buttonProps: { funcType: 'flat', wait: 1000 },
          requestUrl: `${apiPrefix}/deposits/list-print-new`,
          method: 'PUT',
          data: { depositIdList: [depositId], menuCamp: 'PURCHASER' },
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
      ? remote.process('SSTA.DEPOSIT_DETAIL_PUR_CUX.HEAD_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    allFlag,
    loading,
    depositId,
    permissionMap,
    payConfirmFlag,
    depositHeaderDs,
    handleConfirmPay,
    returnSupplierFlag,
    handleViewCostRule,
    handleViewOperation,
    handleReturnSupplier,
    sourcingProgressCtrlFlag,
  ]);

  return (
    <Fragment>
      {!modalFlag && (
        <Header
          backPath={pubFlag ? undefined : "/ssta/purchaser-sourcing-cost/list"}
          title={intl.get('ssta.sourcingCost.view.title.securityDepositDetail').d('保证金详情')}
        >
          {customizeBtnGroup(
            { code: DepositDetailBtnsUnitCode.HEAD, pro: true },
            <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={buttons} />
          )}
        </Header>
      )}
      <Content className={`${modalFlag && styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-sourcingCost']}`}>
        <Spin spinning={loading}>
          {remote ? remote.render('SSTA.DEPOSIT_DETAIL_PUR_CUX.HEAD_SUMMARY', <Summary />) : <Summary />}
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
