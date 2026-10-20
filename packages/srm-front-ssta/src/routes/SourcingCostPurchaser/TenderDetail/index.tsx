import { stringify } from 'querystring';
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';

import Summary from './Summary';
import CostRule from './CostRule';
import BasicInfo from './BasicInfo';
import PayRecord from './PayRecord';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import SyncRecord from '../components/SyncRecord';
import { tenderActionFlagger } from '../utils/utils';
import InvoiceRecord from '../components/InvoiceRecord';
import { TenderDetailBtnsUnitCode } from '../utils/type';
import OperationRecord from '../components/OperationRecord';
import TenderPayConfirm from '../components/TenderPayConfirm';
import SelectInvoiceType from '../components/SelectInvoiceType';
import { TooltipButtonPro } from '../../Components/TooltipButton';
import { formatDynamicBtns } from '../../../utils/utils';
import TenderOnlineRefund from '../components/TenderOnlineRefund';
import TenderProgressCtrl from '../components/TenderProgressCtrl';
import TenderRefundConfirm from '../components/TenderRefundConfirm';
import { previewInvoicingApply, queryInvoicingApplyList } from '../utils/api';
import styles from '../index.less';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'pay',
  'invoicing',
  'sync',
];

const Detail = observer(() => {

  const {
    remote,
    allFlag,
    pubFlag,
    loading,
    modalFlag,
    tenderFeesId,
    permissionMap,
    tenderHeaderDs,
    customizeTable,
    customizeBtnGroup,
    history,
  } = useContext<StoreValueType>(Store);

  const { event } = remote || {};

  const {
    invoicingFlag,
    payConfirmFlag,
    invoiceEntryFlag,
    refundConfirmFlag,
    onlineRefundFlag,
    invCancelConfirmFlag,
    sourcingProgressCtrlFlag,
  } = tenderActionFlagger(tenderHeaderDs.current);

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
            docType='tender'
            allFlag={allFlag}
            feeDs={tenderHeaderDs}
            customizeTable={customizeTable}
            invoiceEntryFlag={invoiceEntryFlag}
            invCancelConfirmFlag={invCancelConfirmFlag}
          />
        ),
      },
      {
        key: 'sync',
        header: intl.get(`ssta.sourcingCost.view.title.syncRecord`).d('同步记录'),
        content: <SyncRecord feeDs={tenderHeaderDs} docType='tender' />,
      },
    ].filter((item) => item);
  }, [allFlag, tenderHeaderDs, customizeTable, invoiceEntryFlag,

  ]);

  // 缴纳确认
  const handleConfirmPay = useCallback(() => {
    const openConfirmModal = () => {
      Modal.open({
        drawer: true,
        closable: true,
        key: Modal.key(),
        className: styles['ssta-small-modal'],
        title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + tenderHeaderDs.current?.get('tenderFeesNum'),
        children: <TenderPayConfirm tenderRecord={tenderHeaderDs.current} okCallback={() => tenderHeaderDs.query()} />,
      });
    };

    const handleProps = {
      openConfirmModal,
      record: tenderHeaderDs.current,
    };

    if (event) {
      event.fireEvent('tenderConfirmPay', handleProps);
    } else {
      openConfirmModal();
    }
  }, [tenderHeaderDs, event, tenderHeaderDs.current]);

  // 开票
  const handleInvoicing = useCallback(async (invoiceType) => {
    tenderHeaderDs.status = DataSetStatus.loading;
    const previewRes = getResponse(await previewInvoicingApply({ tenderFeesId, invoiceType }));
    tenderHeaderDs.status = DataSetStatus.ready;
    if (!previewRes) return false;
    tenderHeaderDs.query();
    tenderHeaderDs.status = DataSetStatus.loading;
    const applyListRes = getResponse(await queryInvoicingApplyList(tenderFeesId));
    tenderHeaderDs.status = DataSetStatus.ready;
    if (!applyListRes || isEmpty(applyListRes)) return false;
    const applyList = applyListRes.map(({ applyNum, applyHeaderId }) => ({ applyNum, applyHeaderId }));
    const { applyHeaderId, billingType } = applyList[0];
    const tenderFeesNum = tenderHeaderDs.current?.get('tenderFeesNum');
    const baseSearch: Record<string, any> = { dataSource: 'SRM_TENDER_FEES', applyHeaderId, sourceDocId: tenderFeesId, sourceDocNum: tenderFeesNum, docSearchFlag: applyList.length > 1, tenderFeesId, type: 'edit', source: 'tenderPurDetail', apiType: 'normal', billingType };
    history.push({
      pathname: `/ssta/direct-pool-supply/apply/detail`,
      search: stringify(baseSearch),
    });
  }, [tenderFeesId, tenderHeaderDs, history]);

  const handleSelectInvoiceType = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.title.selectInvoiceType').d('请选择发票类型'),
      children: <SelectInvoiceType okCallback={handleInvoicing} />,
      className: styles['ssta-small-modal'],
    });
  }, [handleInvoicing]);

  // 退款确认
  const handleConfirmRefund = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.refundConfirm').d('退款确认') + tenderHeaderDs.current?.get('tenderFeesNum'),
      children: <TenderRefundConfirm tenderRecord={tenderHeaderDs.current} okCallback={() => tenderHeaderDs.query()} />,
    });
  }, [tenderHeaderDs]);

  const handleOnlineRefund = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.title.onlineRefund').d('在线退款') + tenderHeaderDs.current?.get('tenderFeesNum'),
      children: <TenderOnlineRefund tenderRecord={tenderHeaderDs.current} okCallback={() => tenderHeaderDs.query()} />,
    });
  }, [tenderHeaderDs]);

  // 发票取消确认
  const handleConfirmCancelInv = useCallback(() => {
    Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl.get(`ssta.sourcingCost.view.message.confirmCancelInvFlag`).d('发票取消确认，仅将「招标文件费开票状态」置为已退票，请线下处理税务发票作废红冲'),
      onOk: async () => {
        const res = await tenderHeaderDs.setState('submitType', 'confirmCancelInv').submit();
        if (!res) return false;
        tenderHeaderDs.query();
      },
    });
  }, [tenderHeaderDs]);

  // 寻源过程控制
  const handleCtrlSourcingProgress = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.sourcingProgressCtrl').d('寻源过程控制') + tenderHeaderDs.current?.get('tenderFeesNum'),
      children: <TenderProgressCtrl tenderRecord={tenderHeaderDs.current} okCallback={() => tenderHeaderDs.query()} />,
    });
  }, [tenderHeaderDs]);

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
      children: <OperationRecord tenderFeesId={tenderFeesId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [tenderFeesId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      allFlag && payConfirmFlag && {
        name: 'payConfirm',
        child: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
        btnProps: {
          loading,
          wait: 1500,
          icon: 'auto_complete',
          onClick: handleConfirmPay,
        },
      },
      allFlag && invoicingFlag && permissionMap?.get('tenderInvoicing') && {
        name: 'invoicing',
        btnComp: TooltipButtonPro,
        child: intl.get('ssta.sourcingCost.view.button.invoicing').d('开票'),
        btnProps: {
          loading,
          icon: 'payments-o',
          onClick: handleSelectInvoiceType,
          disabled: !tenderHeaderDs.current?.get('supplierTenantId'),
          tooltip: !tenderHeaderDs.current?.get('supplierTenantId') && intl.get('ssta.sourcingCost.view.button.invoiceEntry.help').d('供应商未关联平台供应商，暂不支持开票。'),
        },
      },
      allFlag && refundConfirmFlag && {
        name: 'refundConfirm',
        child: intl.get('ssta.sourcingCost.view.button.refundConfirm').d('退款确认'),
        btnProps: {
          loading,
          icon: 'reply_all',
          onClick: handleConfirmRefund,
        },
      },
      allFlag && onlineRefundFlag && {
        name: 'onlineRefund',
        child: intl.get('ssta.sourcingCost.view.button.refund').d('退款'),
        btnProps: {
          loading,
          icon: 'reply_all',
          onClick: handleOnlineRefund,
        },
      },
      allFlag && invCancelConfirmFlag && {
        name: 'invCancelConfirm',
        child: intl.get('ssta.sourcingCost.view.button.invCancelConfirm').d('发票取消确认'),
        btnProps: {
          loading,
          icon: 'cancel',
          onClick: handleConfirmCancelInv,
        },
      },
      allFlag && sourcingProgressCtrlFlag && permissionMap?.get('tenderProgressCtrl') && {
        name: 'sourcingProgressCtrl',
        child: intl.get('ssta.sourcingCost.view.button.sourcingProgressCtrl').d('寻源过程控制'),
        btnProps: {
          loading,
          icon: 'manage_project',
          onClick: handleCtrlSourcingProgress,
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
    const otherProps = { allFlag, loading, tenderHeaderDs };
    const processBtns = remote
      ? remote.process('SSTA.TENDER_DETAIL_PUR_CUX.HEAD_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    allFlag,
    loading,
    invoicingFlag,
    permissionMap,
    tenderHeaderDs,
    payConfirmFlag,
    refundConfirmFlag,
    onlineRefundFlag,
    handleConfirmPay,
    handleConfirmRefund,
    handleOnlineRefund,
    handleViewCostRule,
    handleViewOperation,
    invCancelConfirmFlag,
    handleConfirmCancelInv,
    handleSelectInvoiceType,
    sourcingProgressCtrlFlag,
    handleCtrlSourcingProgress,
  ]);

  return (
    <Fragment>
      {!modalFlag && (
        <Header
          backPath={pubFlag ? undefined : "/ssta/purchaser-sourcing-cost/list"}
          title={intl.get('ssta.sourcingCost.view.title.tenderFileFeeDetail').d('招标文件费详情')}
        >
          {customizeBtnGroup(
            { code: TenderDetailBtnsUnitCode.HEAD, pro: true },
            <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={buttons} />
          )}
        </Header>
      )}
      <Content className={`${modalFlag && styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-sourcingCost']}`}>
        <Spin spinning={loading}>
          {remote ? remote.render('SSTA.TENDER_DETAIL_PUR_CUX.HEAD_SUMMARY', <Summary />) : <Summary />}
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
});

const TenderDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default TenderDetail;
