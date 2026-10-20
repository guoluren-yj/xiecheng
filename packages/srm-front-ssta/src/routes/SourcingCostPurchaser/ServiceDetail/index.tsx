import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';

import Summary from './Summary';
import CostRule from './CostRule';
import BasicInfo from './BasicInfo';
import PayRecord from './PayRecord';
import { formatNumber } from '../../../utils/utils';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import SyncRecord from '../components/SyncRecord';
import ServicePay from '../components/ServicePay';
import { formatDynamicBtns } from '../../../utils/utils';
import { serviceActionFlagger } from '../utils/utils';
import InvoiceRecord from '../components/InvoiceRecord';
import { ServiceDetailBtnsUnitCode } from '../utils/type';
import OperationRecord from '../components/OperationRecord';
import ServiceAmountChange from '../components/ServiceAmountChange';
import styles from '../index.less';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'pay',
  'invoicing',
  'sync',
];

const Detail = () => {

  const {
    remote,
    allFlag,
    pubFlag,
    loading,
    modalFlag,
    serverFeesId,
    serverFeesNum,
    permissionMap,
    serviceHeaderDs,
    customizeTable,
    customizeBtnGroup,
  } = useContext<StoreValueType>(Store);

  const {
    payConfirmFlag,
    invoiceEntryFlag,
    refundConfirmFlag,
    amountChangeFlag,
    revokeAmountChangeFlag,
  } = serviceActionFlagger(serviceHeaderDs.current);

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
        key: 'invoicing',
        header: intl.get(`ssta.sourcingCost.view.title.invocingRecord`).d('开票记录'),
        content: (
          <InvoiceRecord
            docType='service'
            allFlag={allFlag}
            feeDs={serviceHeaderDs}
            customizeTable={customizeTable}
            invoiceEntryFlag={invoiceEntryFlag}
          />
        ),
      },
      {
        key: 'sync',
        header: intl.get(`ssta.sourcingCost.view.title.syncRecord`).d('同步记录'),
        content: <SyncRecord feeDs={serviceHeaderDs} docType='service' okCallback={() => serviceHeaderDs.query()} />,
      },
    ].filter((item) => item);
  }, [allFlag, serviceHeaderDs, customizeTable, invoiceEntryFlag]);

  // 缴纳
  const handleConfirmPay = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + serviceHeaderDs.current?.get('serverFeesNum'),
      children: <ServicePay serviceRecord={serviceHeaderDs.current} okCallback={() => serviceHeaderDs.query()} remote={remote}/>,
    });
  }, [serviceHeaderDs]);

  // 退回
  const handleRefundConfirm = useCallback(() => {
    Modal.confirm({
      title: intl.get('ssta.sourcingCost.view.title.serviceFeeRefundConfirm').d('服务费退款确认'),
      children: intl.get(`ssta.sourcingCost.view.title.confirmReturnServiceFeeFlagBasePayRecord`, { serverFeesNum }).d('是否确定根据缴纳记录将服务费{serverFeesNum}退回至供应商/保证金？'),
      onOk: async () => {
        const res = await serviceHeaderDs.setState('submitType', 'return').submit();
        if (!res) return false;
        serviceHeaderDs.query();
      },
    });
  }, [serviceHeaderDs, serverFeesNum]);

  // 金额变更
  const handleAmountChange = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.amountChange').d('金额变更') + serviceHeaderDs.current?.get('serverFeesNum'),
      children: <ServiceAmountChange serviceRecord={serviceHeaderDs.current} okCallback={() => serviceHeaderDs.query()} />,
    });
  }, [serviceHeaderDs]);

  // 撤销金额变更
  const handleRevokeAmountChange = useCallback(() => {
    const { amountPrecision, amountBeforeChange } = serviceHeaderDs.current?.get(['amountPrecision', 'amountBeforeChange']) || {};
    const beforeChange = formatNumber(amountBeforeChange, amountPrecision);
    Modal.confirm({
      title: intl.get('ssta.sourcingCost.view.button.revokeAmountChange').d('撤销金额变更'),
      children: intl.get(`ssta.sourcingCost.view.title.confirmRevokeServiceFeeAmountChangeFlag`, { beforeChange }).d('是否确认撤销金额变更？撤销后，金额将恢复至最近一次有效状态时的金额{beforeChange}'),
      onOk: async () => {
        const res = await serviceHeaderDs.setState('submitType', 'revokeAmountChange').submit();
        if (!res) return false;
        serviceHeaderDs.query();
      },
    });
  }, [serviceHeaderDs]);

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
      children: <OperationRecord serverFeesId={serverFeesId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [serverFeesId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      allFlag && payConfirmFlag && {
        name: 'payConfirm',
        child: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
        btnProps: {
          loading,
          icon: 'auto_complete',
          onClick: handleConfirmPay,
        },
      },
      allFlag && refundConfirmFlag && {
        name: 'refundConfirm',
        child: intl.get('ssta.sourcingCost.view.button.refundConfirm').d('退款确认'),
        btnProps: {
          loading,
          icon: 'reply_all',
          onClick: handleRefundConfirm,
        },
      },
      allFlag && amountChangeFlag && permissionMap?.get('serviceAmountExchange') && {
        name: 'amountChange',
        child: intl.get('ssta.sourcingCost.view.button.amountChange').d('金额变更'),
        btnProps: {
          loading,
          icon: 'drive_file_rename_outline',
          onClick: handleAmountChange,
        },
      },
      allFlag && revokeAmountChangeFlag && permissionMap?.get('serviceAmountExchange') && {
        name: 'revokeAmountChange',
        child: intl.get('ssta.sourcingCost.view.button.revokeAmountChange').d('撤销金额变更'),
        btnProps: {
          loading,
          icon: 'edit_off',
          onClick: handleRevokeAmountChange,
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
    const otherProps = { allFlag, loading, serviceHeaderDs };
    const processBtns = remote
      ? remote.process('SSTA.SERVICE_DETAIL_PUR_CUX.HEAD_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    allFlag,
    loading,
    permissionMap,
    serviceHeaderDs,
    handleConfirmPay,
    payConfirmFlag,
    handleViewCostRule,
    handleViewOperation,
    handleRefundConfirm,
    refundConfirmFlag,
    amountChangeFlag,
    revokeAmountChangeFlag,
    handleAmountChange,
    handleRevokeAmountChange,
  ]);

  return (
    <Fragment>
      {!modalFlag && (
        <Header
          backPath={pubFlag ? undefined : "/ssta/purchaser-sourcing-cost/list"}
          title={intl.get('ssta.sourcingCost.view.title.serviceFeeDetail').d('服务费详情')}
        >
          {customizeBtnGroup(
            { code: ServiceDetailBtnsUnitCode.HEAD, pro: true },
            <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={buttons} />
          )}
        </Header>
      )}
      <Content className={`${modalFlag && styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-sourcingCost']}`}>
        <Spin spinning={loading}>
          <Summary />
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
        </Spin>
      </Content>
    </Fragment>
  );
};

const ServiceDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default ServiceDetail;