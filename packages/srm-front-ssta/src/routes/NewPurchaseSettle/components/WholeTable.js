/*
 * @Description: 采购方结算单——整单筛选器
 * @Date: 2022-01-27 22:11:23
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useCallback, useContext, memo, useRef, useEffect } from 'react';
import { Modal, Select, Button, useDataSet, Tooltip } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { stringify } from 'querystring';
import IMChatDraggable from '_components/IMChatDraggable';

import styles from '@/routes/common.less';
import { dateRangeTransform, lovOptionDS } from '@/utils/utils';
import StatusTag, { statusTagRender, aiPreReviewRenderer } from '@/routes/Components/StatusTag';
import { formatColumnCommand } from '@/routes/Components/ColumnBtnGroup';
import { getSettleHeaderData, prePaymentRefund } from '@/services/settlePoolServices';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import { SettleApprove } from '@/routes/Components';
import Create from '../Create';
import PayRecord from './PayRecord';
import RelatedPayPool from './RelatedPayPool';
import SyncStatusOperation from './SyncStatusOperation';
import InvoiceProgressQuery from './InvoiceProgressQuery';
import { Store, wholeTableUnitCodes, wholeSearchUnitCodes } from '../StoreProvider';
import { settleActionFlagger } from '../../../utils/amountConfig';
import PayApplyExcuteQuery from './PayApplyExcuteQuery';
import { handleViewBatchNum } from '../BatchSubmit/modal';
import RedInvConfirm from './RedConfirm';

const tenantId = getCurrentOrganizationId();

export default memo(({ type, modalOpen, onRecordInit }) => {
  const {
    dsMap,
    history,
    location,
    permissionMap,
    createTitleMap,
    handleToDetail,
    customizeTable,
    fetchTabKeysCount,
    isOpenClearCashed,
    setIsOpenClearCashed,
    defaultDateRange,
    defaultSettleNums,
    defaultSettleType,
    defaultSettleStatus,
    remoteProps,
  } = useContext(Store);
  const tableDs = dsMap[type];
  const searchBarRef = useRef({});

  useEffect(() => {
    if (onRecordInit) onRecordInit(type);
  }, [onRecordInit, type]);

  const settleTypeOptionDs = useDataSet(
    () => lovOptionDS({ lovCode: 'SSTA.SETTLE_DOCUMENT_TYPE' }),
    []
  );

  /**
   * 筛选器查询回调
   */
  const handleQuery = useCallback(
    ({ params }) => {
      tableDs.queryDataSet.loadData([params]);
      const { _back } = location.state || {};
      if (_back && isOpenClearCashed) {
        if (_back !== -1) tableDs.batchUnSelect(tableDs.selected);
        setIsOpenClearCashed(false);
        tableDs.query(tableDs.currentPage);
      } else {
        tableDs.query();
      }
    },
    [location, tableDs, isOpenClearCashed, setIsOpenClearCashed]
  );

  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  }, []);

  const handleBeforeToDetail = useCallback(
    async (record, action = '') => {
      const { settleStatus, settleHeaderId, documentType } = record.get([
        'settleStatus',
        'settleHeaderId',
        'documentType',
      ]);
      const workflowApproveFlag =
        action === 'approve' && ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(settleStatus);
      if (documentType === 'PREPAYMENT') {
        handleToDetail(
          record,
          action === 'all' || workflowApproveFlag ? 'NUM' : action.toUpperCase()
        );
      } else if (action !== 'update') {
        handleToDetail(record, workflowApproveFlag ? 'all' : action);
      } else if (action === 'update') {
        tableDs.status = 'loading';
        const res = getResponse(await getSettleHeaderData({ settleHeaderId, documentType }));
        tableDs.status = 'ready';
        if (!res) return;
        const { step } = res;
        if (step && step === 'END') {
          handleToDetail(record, action);
        } else {
          handleContinueCreate(res);
        }
      }
    },
    [handleToDetail, handleContinueCreate, tableDs]
  );

  const handleApprove = useCallback(
    (record) => {
      const settleStatus = record.get('settleStatus');
      const workflowApproveFlag = ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(settleStatus);
      if (workflowApproveFlag) {
        tableDs.getState('workflowCaller').goApprove({
          record,
          onSuccess: () => {
            notification.success();
            tableDs.query();
            fetchTabKeysCount([type]);
          },
        });
      } else {
        handleToDetail(record, 'approve');
      }
    },
    [type, tableDs, fetchTabKeysCount, handleToDetail]
  );

  const handleContinueCreate = useCallback(
    (settleDetail) => {
      const {
        step,
        settleType,
        branchStep,
        settleHeaderId,
        settleNum = '',
        currencyCode = '',
        taxIncludedAmount = '',
      } = settleDetail;
      const baseTitle = `${createTitleMap[settleType]}-${settleNum} `;
      const filledTitle = `${taxIncludedAmount} ${currencyCode}`;
      const createProps = {
        step,
        history,
        settleType,
        branchStep,
        settleHeaderId,
        onQueryList: async (clearCache) => {
          await tableDs.query();
          if (clearCache) tableDs.clearCachedSelected();
        },
      };
      Modal.open({
        drawer: true,
        closable: true,
        title: settleType === 'PAYMENT' ? baseTitle : baseTitle + filledTitle,
        className: styles['ssta-large-modal'],
        bodyStyle: { paddingTop: 0, paddingBottom: 0 },
        children: <Create {...createProps} />,
        footer: null,
      });
    },
    [history, createTitleMap, tableDs]
  );

  const handleWithdraw = useCallback(
    (record) => {
      const batchApproveId = record?.get('batchApproveId');
      Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: batchApproveId
          ? intl
              .get('ssta.common.view.message.confirmRevokeApprovalTipBatch')
              .d(
                '当前结算单为批次审批，是否确认撤销审批（批次下所有结算单会一并撤销审批）?撒销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
              )
          : intl
              .get('ssta.common.view.message.confirmRevokeApprovalTip')
              .d(
                '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
              ),
        onOk: async () => {
          tableDs.dataToJSON = 'dirty';
          Object.assign(record, { status: 'update' });
          const res = await tableDs
            .setState('submitType', batchApproveId ? 'withdrawBatch' : 'withdraw')
            .submit()
            .finally(() => {
              tableDs.dataToJSON = 'selected';
            });
          if (!res) return;
          tableDs.query();
          fetchTabKeysCount([type]);
        },
      });
    },
    [type, tableDs, fetchTabKeysCount]
  );

  const handleViewPayRecord = useCallback(
    (settleHeaderId) => {
      Modal.open({
        drawer: true,
        title: intl.get('ssta.common.view.button.viewPaymentDetail').d('查看付款记录'),
        closable: true,
        key: Modal.key(),
        className: styles['ssta-medium-modal'],
        children: <PayRecord remoteProps={remoteProps} settleHeaderId={settleHeaderId} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [remoteProps]
  );

  const handleSyncModal = useCallback((settleHeaderId) => {
    Modal.open({
      drawer: true,
      title: (
        <span>{intl.get('ssta.common.message.title.viewERPStatusInfo').d('查看ERP状态详情')}</span>
      ),
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      children: <SyncStatusOperation settleHeaderId={settleHeaderId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);
  const handleApproveModal = useCallback((settleHeaderId) => {
    Modal.open({
      drawer: true,
      title: intl.get('ssta.purchaseSettle.model.purchaseSettle.approveSchedule').d('审批进度'),
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      children: <SettleApprove settleHeaderId={settleHeaderId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const handlePayApplyQuery = useCallback(
    (record) => {
      modalOpen({
        title: intl.get('hzero.common.button.viewDetails').d('查看详情'),
        size: 'large',
        editFlag: false,
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        className: styles['ssta-detailDrawer-modal'],
        children: (
          <PayApplyExcuteQuery record={record} history={history} customizeTable={customizeTable} />
        ),
      });
    },
    [history, modalOpen, customizeTable]
  );

  const handleInvoiceProgressQuery = useCallback((record) => {
    Modal.open({
      drawer: true,
      title: intl.get('ssta.costSheet.model.costSheet.invoiceProgressQuery').d('开票进度查询'),
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      children: <InvoiceProgressQuery settleHeaderId={record.get('settleHeaderId')} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const handlePrepaymentRefund = useCallback(
    async (record) => {
      const parmas = record?.toData();
      const { settleNum } = parmas || {};
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl
          .get('ssta.common.view.help.refundApply', { settleNum })
          .d('是否确认对预付款申请{settleNum}发起退款申请？'),
      });
      if (confirmRes !== 'ok') return;
      const res = getResponse(await prePaymentRefund([parmas]));
      if (!res) return;
      const { settleHeader } = res[0] || {};
      const { settleHeaderId } = settleHeader || {};
      if (!settleHeaderId) return;
      history.push({
        pathname: '/ssta/new-purchase-settle/pre-payment',
        search: stringify({
          source: 'detail',
          documentType: 'PREPAYMENT',
          settleHeaderId,
          type: 'UPDATE',
        }),
      });
    },
    [history]
  );

  const handleCancelRefundTicket = useCallback(
    async (record) => {
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl
          .get('ssta.common.view.message.cancelRefundTicketConfirm')
          .d('您当前正在取消税务发票红冲，请确认是否进行执行'),
      });
      if (confirmRes !== 'ok') return;
      tableDs.dataToJSON = 'dirty';
      Object.assign(record, { status: 'update' });
      const res = await tableDs
        .setState('submitType', 'cancelRefundTicket')
        .submit()
        .finally(() => {
          tableDs.dataToJSON = 'selected';
        });
      if (!res) return;
      tableDs.query();
      fetchTabKeysCount([type]);
    },
    [type, tableDs, fetchTabKeysCount]
  );

  const handleDeleteSettle = useCallback(
    async (record) => {
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl
          .get('ssta.common.view.message.deleteSettleConfirm')
          .d('删除后将无法恢复，确认要删除当前单据吗?'),
      });
      if (confirmRes !== 'ok') return;
      tableDs.dataToJSON = 'dirty';
      Object.assign(record, { status: 'update' });
      const res = await tableDs
        .setState('submitType', 'deleteSettle')
        .submit()
        .finally(() => {
          tableDs.dataToJSON = 'selected';
        });
      if (!res) return;
      tableDs.query();
      fetchTabKeysCount([type]);
    },
    [type, tableDs, fetchTabKeysCount]
  );

  const handleViewRelatedPayPool = useCallback(
    (record) => {
      const settleNum = record.get('settleNum');
      modalOpen({
        size: 'large',
        editFlag: false,
        title: intl.get('ssta.common.view.button.payPoolPayRecordQuery').d('支付池支付记录查询'),
        children: <RelatedPayPool settleNum={settleNum} remoteProps={remoteProps} />,
      });
    },
    [modalOpen, remoteProps]
  );

  const handleViewInvoiceRedConfirm = useCallback(
    async (record) => {
      modalOpen({
        editFlag: true,
        size: 'medium',
        title: intl.get('ssta.common.view.button.operateRedConfirm').d('操作红字确认单'),
        children: (
          <RedInvConfirm record={record} type="settle" okCallback={() => tableDs.query()} />
        ),
      });
    },
    [modalOpen, tableDs]
  );

  const handleSyncPayPool = useCallback(
    async (record) => {
      tableDs.dataToJSON = 'dirty';
      Object.assign(record, { status: 'update' });
      const res = await tableDs
        .setState('submitType', 'syncPayPool')
        .forceSubmit()
        .finally(() => {
          tableDs.dataToJSON = 'selected';
        });
      if (!res) return;
      tableDs.query();
    },
    [tableDs]
  );

  const getOperationCommand = useCallback(
    ({ record, dataSet }) => {
      const {
        camp,
        settleStatus,
        showFlag = false,
        settleType,
        invoiceMatchRuleCode,
        directInvoicingType,
        refundStatus,
        prepaymentAmount,
        applyAmount,
        prePaymentPlanFlag,
        importPayPlatformFlag,
        enableRedConfirmFlag,
      } = record.get([
        'camp',
        'settleStatus',
        'showFlag',
        'invoiceMatchRuleCode',
        'directInvoicingType',
        'settleType',
        'refundStatus',
        'prepaymentAmount',
        'applyAmount',
        'prePaymentPlanFlag',
        'importPayPlatformFlag',
        'enableRedConfirmFlag',
      ]);
      const [updateBtn, approveBtn, cancelBtn, syncBtn] = settleActionFlagger(
        record,
        'purchaser',
        ['UPDATE', 'APPROVE', 'CANCEL', 'SYNC'],
        { workflowCaller: dataSet.getState('workflowCaller') }
      );
      let showRefundFlag = false;
      if (settleType === 'PREPAYMENT') {
        showRefundFlag = math.gt(math.minus(prepaymentAmount || 0, applyAmount || 0), 0);
      }
      const normalBtns = [
        {
          name: 'update',
          text: intl.get('hzero.common.button.edit').d('编辑'),
          onClick: () => handleBeforeToDetail(record, 'update'),
          showFlag: type === 'all' && updateBtn && permissionMap.get('updatePane'),
          wait: 1000,
        },
        {
          name: 'approve',
          text: intl.get('ssta.common.button.approve').d('审核'),
          onClick: () => handleApprove(record),
          showFlag: approveBtn && permissionMap.get('auditPane'),
        },
        {
          name: 'cancel',
          text: intl.get('hzero.common.button.cancel').d('取消'),
          onClick: () => handleToDetail(record, 'cancel'),
          showFlag: type === 'all' && cancelBtn && permissionMap.get('cancelPane'),
        },
        {
          name: 'sync',
          text: intl.get('hzero.common.button.sync').d('同步'),
          onClick: () => handleToDetail(record, 'sync'),
          showFlag: type === 'all' && syncBtn && permissionMap.get('syncPane'),
        },
        {
          name: 'show',
          text: intl.get('hzero.common.button.viewPaymentDetail').d('查看付款记录'),
          onClick: () => handleViewPayRecord(record.get('settleHeaderId')),
          showFlag: type === 'all' && showFlag,
        },
        {
          name: 'withdraw', // 功能/工作流/外部系统审批撤回
          text: intl.get('ssta.costSheet.model.costSheet.withdraw').d('撤回'),
          onClick: () => handleWithdraw(record),
          showFlag:
            type === 'all' &&
            camp === 'PURCHASER' &&
            (settleStatus === 'SUBMITED' ||
              (['SUBMITED_APPROVING'].includes(settleStatus) &&
                dataSet.getState('workflowCaller')?.getRevokeFlag(record) &&
                permissionMap.get('recallBtn')) ||
              (['ES_SUBMITED_APPROVING'].includes(settleStatus) &&
                permissionMap.get('recallExtSysBtn'))),
        },
        {
          name: 'payApplyQuery',
          text: intl.get('ssta.common.button.payApplyQuery').d('付款申请执行查询'),
          onClick: () => handlePayApplyQuery(record),
          showFlag:
            type === 'all' &&
            record.get('settleType') === 'INVOICE' &&
            permissionMap?.get('payApplyExeQuery'),
        },
        {
          name: 'invoiceProgressQuery',
          text: intl.get('ssta.costSheet.model.costSheet.invoiceProgressQuery').d('开票进度查询'),
          onClick: () => handleInvoiceProgressQuery(record),
          showFlag:
            type === 'all' &&
            settleType === 'INVOICE' &&
            ['DIRECT_INVOICING'].includes(settleStatus) &&
            invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
            directInvoicingType === 'EC' &&
            permissionMap.get('invoiceProgressQueryBtn'),
        },
        {
          name: 'refund',
          text: intl.get('ssta.common.model.button.refund').d('退款'),
          onClick: () => handlePrepaymentRefund(record),
          showFlag:
            type === 'all' &&
            showRefundFlag &&
            Number(prePaymentPlanFlag) === 0 &&
            ['CONFIRM'].includes(settleStatus) &&
            !['REFUND'].includes(refundStatus) &&
            permissionMap.get('clickPrepaymentRefund'),
        },
        {
          name: 'cancelRefundTicket',
          text: intl.get('ssta.common.view.button.cancelRefundTicket').d('撤销退票'),
          onClick: () => handleCancelRefundTicket(record),
          showFlag:
            type === 'all' &&
            permissionMap.get(`cancelRefundTicket`) &&
            settleStatus === 'INVOICE_REFUNDING',
        },
        {
          name: 'deleteSettle',
          text: intl.get('hzero.common.button.detele').d('删除'),
          onClick: () => handleDeleteSettle(record),
          showFlag: type === 'all' && settleStatus === 'NEW' && permissionMap.get('deleteSettle'),
          wait: 1000,
        },
        {
          name: 'syncPayPool',
          text: intl.get('ssta.common.view.button.syncPayPool').d('同步支付池'),
          onClick: () => handleSyncPayPool(record),
          showFlag:
            type === 'all' &&
            ['PAYMENT', 'PREPAYMENT'].includes(settleType) &&
            settleStatus === 'CONFIRM' &&
            permissionMap.get('syncPayPool'),
          wait: 1000,
        },
        {
          name: 'payPoolPayRecordQuery',
          text: intl.get('ssta.common.view.button.payPoolPayRecordQuery').d('支付池支付记录查询'),
          onClick: () => handleViewRelatedPayPool(record),
          showFlag:
            type === 'all' &&
            ['PAYMENT', 'PREPAYMENT'].includes(settleType) &&
            Number(importPayPlatformFlag) === 1,
        },
        {
          name: 'invRedConfirm',
          text: intl.get('ssta.common.view.button.operateRedConfirm').d('操作红字确认单'),
          onClick: () => handleViewInvoiceRedConfirm(record),
          showFlag:
            type === 'all' &&
            ['INVOICE'].includes(settleType) &&
            Number(enableRedConfirmFlag) === 1 &&
            permissionMap.get('redConfirm'),
        },
      ];
      const otherProps = { type, record, tableDs, permissionMap };
      const buttons = remoteProps
        ? remoteProps.process('SSTA_PURCHASESETTLE_LIST.WHOLE_OPR_BTNS', normalBtns, otherProps)
        : normalBtns;
      return formatColumnCommand({ buttons });
    },
    [
      type,
      tableDs,
      remoteProps,
      permissionMap,
      handleApprove,
      handleBeforeToDetail,
      handleWithdraw,
      handleViewPayRecord,
      handleToDetail,
      handleSyncPayPool,
      handlePayApplyQuery,
      handleViewRelatedPayPool,
      handleInvoiceProgressQuery,
      handlePrepaymentRefund,
      handleCancelRefundTicket,
      handleDeleteSettle,
      handleViewInvoiceRedConfirm,
    ]
  );

  const columns = useMemo(() => {
    const standardColumns = [
      type === 'all' && {
        name: 'drag',
        width: 40,
        renderer: ({ value, record }) => {
          const {
            settleNum,
            settleHeaderId,
            documentType,
            companyName,
            companyId,
            supplierCompanyName,
            supplierCompanyId,
            supplierCompanyNum,
            settleTypeMeaning,
          } =
            record?.get([
              'settleNum',
              'settleHeaderId',
              'documentType',
              'companyName',
              'companyId',
              'supplierCompanyName',
              'supplierCompanyId',
              'supplierCompanyNum',
              'settleTypeMeaning',
            ]) || {};
          const code = {
            INVOICE: 'SSTA_SETTLE_INVOICE',
            PAYMENT: 'SSTA_SETTLE_PAYMENT',
            PREPAYMENT: 'SSTA_SETTLE_PRE_PAYMENT',
          };
          const cardCode = code[documentType];
          if (!cardCode) return null;
          return (
            <div>
              <IMChatDraggable
                cardCode={cardCode}
                icon="baseline-drag_indicator"
                tooltip=""
                requestBody={{
                  settleHeaderId,
                  settleNum,
                  companyName,
                  companyId,
                  supplierCompanyName,
                  supplierCompanyId,
                  supplierCompanyNum,
                  settleTypeMeaning,
                }}
                dragText={`${intl
                  .get('ssta.common.view.title.settleNum')
                  .d('结算单编号')}${settleNum}`}
              >
                {value}
              </IMChatDraggable>
            </div>
          );
        },
      },
      {
        name: 'settleStatusMeaning',
        width: 120,
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'settleStatus' }),
      },
      ['update', 'approve'].includes(type) && {
        name: 'aiApproveStatus',
        width: 150,
        renderer: aiPreReviewRenderer,
      },
      ['all', 'approve'].includes(type) && {
        name: 'operation',
        title: intl.get('hzero.common.button.operator').d('操作'),
        width: 160,
        align: 'left',
        command: getOperationCommand,
      },
      {
        name: 'settleNum',
        width: 220,
        renderer: ({ record, value }) => {
          return (
            <Button
              wait={1000}
              funcType="link"
              color="primary"
              style={{ userSelect: 'text' }}
              onClick={() => handleBeforeToDetail(record, type)}
            >
              {value}
            </Button>
          );
        },
      },
      {
        width: 170,
        name: 'settleTypeMeaning',
      },
      {
        width: 150,
        name: 'invOrganizationName',
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'netAmount',
        width: 160,
      },
      {
        name: 'taxAmount',
        width: 120,
      },
      {
        name: 'taxIncludedAmount',
        width: 150,
      },
      {
        name: 'paymentAmount',
        width: 120,
      },
      {
        name: 'applyAmount',
        width: 120,
      },
      {
        name: 'prepaymentAmount',
        width: 120,
      },
      {
        name: 'syncStatusMeaning',
        width: 120,
        header: ({ title }) => (
          <Tooltip
            title={intl
              .get('ssta.purchaseSettle.view.message.tooltip.syncStatusMeaningInfo')
              .d('若导入ERP为单系统，ERP导入结果查看列表页面的“同步ERP状态”即可')}
          >
            <span>{title}</span>
          </Tooltip>
        ),
        renderer: ({ value, record }) =>
          value ? (
            <a onClick={() => handleSyncModal(record?.get('settleHeaderId'))}>{value}</a>
          ) : null,
      },
      {
        name: 'syncResponseMsg',
        width: 150,
      },
      {
        name: 'creationDate',
        type: 'date',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
      },
      {
        width: 150,
        name: 'isPrint',
        renderer: ({ value, text }) => (
          <StatusTag text={text} color={Number(value) === 1 ? 'green' : 'gray'} />
        ),
      },
      {
        name: 'sourceSupplierCompanyName',
        width: 150,
      },
      {
        name: 'sourceSupplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
      },
      !['sync', 'cancel'].includes(type) && {
        name: 'confirmCollaborativeMode',
        width: 150,
      },
      type === 'all' && {
        name: 'currentApprover',
        width: 160,
        hidden: true, // 平台默认隐藏
        renderer: ({ value, record }) => {
          const { settleStatus, settleHeaderId, currentTaskName } =
            record?.get(['settleStatus', 'settleHeaderId', 'currentTaskName']) || {};
          return ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(settleStatus) && value ? (
            <StatusTag
              color="warn"
              icon="alt_route-o"
              text={`(${currentTaskName || '-'})${value}`}
              onClick={() => handleApproveModal(settleHeaderId)}
            />
          ) : null;
        },
      },
      {
        name: 'refundStatus',
        width: 120,
      },
      {
        name: 'prepaymentRefundAmount',
        width: 120,
      },
      ['all', 'approve'].includes(type) && {
        name: 'miniApproveProcess',
        header: intl.get('hzero.common.button.approve.process').d('审批进度'),
        width: 200,
        renderer: ({ dataSet, record }) => {
          const settleStatus = record.get('settleStatus');
          return ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(settleStatus)
            ? dataSet.getState('workflowCaller')?.renderProcess(record)
            : null;
        },
      },
      ['all', 'approve', 'update'].includes(type) && {
        name: 'batchApproveNum',
        width: 220,
        renderer: ({ record, value }) => {
          return (
            <Button
              funcType="link"
              color="primary"
              style={{ userSelect: 'text' }}
              onClick={() => handleViewBatchNum({ batchApproveId: record?.get('batchApproveId') })}
            >
              {value}
            </Button>
          );
        },
      },
    ];

    const otherProps = {
      handleBeforeToDetail,
      type,
      tableDs,
    };

    return remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_LIST_COLUMNS', standardColumns, otherProps)
      : standardColumns;
  }, [
    type,
    handleBeforeToDetail,
    handleSyncModal,
    remoteProps,
    getOperationCommand,
    handleApproveModal,
    tableDs,
  ]);

  // 后续路由字段默认值更改同步更新字段值
  useEffect(() => {
    const { customizeDs, setFields, handleQuery } = searchBarRef.current;
    const customizeDsCurrent = customizeDs?.current;
    // 自定义的查询条件更新
    if (customizeDsCurrent) {
      customizeDsCurrent.init({
        settleType: defaultSettleType,
        settleNums: defaultSettleNums?.split(','),
      });
    }
    // 个性化配置的查询条件更新
    if (setFields) {
      setFields(
        {
          dateRange: defaultDateRange,
          settleStatus: defaultSettleStatus,
          creationDate: dateRangeTransform(defaultDateRange, true),
        },
        'init'
      );
    }
    if (handleQuery) handleQuery();
  }, [defaultDateRange, defaultSettleNums, defaultSettleType, defaultSettleStatus]);

  // 初始化页面时添加customizeDs默认值
  const handleBindSeachBarRef = useCallback(
    (ref) => {
      searchBarRef.current = ref;
      const { customizeDs } = ref;
      if (!customizeDs.current) customizeDs.create({});
      customizeDs.current.init({
        settleType: defaultSettleType,
        settleNums: defaultSettleNums?.split(','),
      });
    },
    [defaultSettleType, defaultSettleNums]
  );

  return (
    <div className="ssta-search-left-more-fields" style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        {
          code: wholeTableUnitCodes[type],
        },
        <SearchBarTable
          virtual
          virtualCell
          cacheState
          columns={columns}
          dataSet={tableDs}
          searchCode={wholeSearchUnitCodes[type]}
          searchBarRef={handleBindSeachBarRef}
          searchBarConfig={{
            onQuery: handleQuery,
            onFieldChange: handleFieldChange,
            fieldProps: {
              companyId: { lovPara: { tenantId } },
              supplierCompanyId: { lovPara: { tenantId } },
              settleConfigNum: { lovPara: { tenantId } },
              sourceSupplierCompanyId: { lovPara: { tenantId } },
              currencyCode: { lovPara: { tenantId } },
              settleStatus: {
                // defaultValue为假值时个性化配置才会生效
                defaultValue: defaultSettleStatus && (() => defaultSettleStatus),
              },
              dateRange: {
                // defaultValue为假值时个性化配置才会生效
                defaultValue: defaultDateRange && (() => defaultDateRange),
              },
              supplierSiteId: {
                dynamicProps: {
                  // 适配多选和供应商值集编码 SSLM.SUPPLIER_CHOOSE
                  disabled: ({ record }) => {
                    const supplierLovData = record.get('supplierCompanyId');
                    if (supplierLovData?.length) {
                      return supplierLovData.length > 1
                        ? true
                        : !supplierLovData[0]?.extSupplierIds;
                    }
                    return !supplierLovData?.extSupplierIds;
                  },
                  lovPara: ({ record }) => {
                    const supplierLovData = record.get('supplierCompanyId');
                    const { extSupplierIds: supplierId } =
                      (supplierLovData?.length ? supplierLovData[0] : supplierLovData) || {};
                    return {
                      supplierId,
                      tenantId,
                    };
                  },
                },
              },
              creationDate: {
                defaultValue: ({ record }) =>
                  dateRangeTransform(defaultDateRange || record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) => {
                    const dateRange = defaultDateRange || record.get('dateRange');
                    return dateRange && dateRange !== 'ALL TIME';
                  },
                },
              },
              settleType: { disabled: true },
            },
            left: {
              render: (_, customizeDs) => (
                <div>
                  <Select
                    name="settleType"
                    dataSet={customizeDs}
                    options={settleTypeOptionDs}
                    placeholder={intl
                      .get('ssta.common.view.message.settleTypeForSearch')
                      .d('请选择结算单类型查询')}
                  />
                  <Divider type="vertical" />
                  <MultiTextFilter
                    name="settleNums"
                    dataSet={customizeDs}
                    placeholder={intl
                      .get('ssta.supplySettle.modal.settleNum')
                      .d('请输入结算单编号查询')}
                  />
                </div>
              ),
            },
          }}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
});
