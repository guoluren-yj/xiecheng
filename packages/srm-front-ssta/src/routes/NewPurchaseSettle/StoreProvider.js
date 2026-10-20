/*
 * @Description: 采购方结算单工作台列表——Context
 * @Date: 2022-01-25 16:12:54
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { parse, stringify } from 'querystring';
import React, { createContext, useMemo, useState, useEffect, useCallback } from 'react';
import { ModalProvider, DataSet, useDataSet } from 'choerodon-ui/pro';
import { compose, isArray } from 'lodash';
import { observer } from 'mobx-react';
import remote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  wholeTableDS,
  detailInvTableDS,
  detailPayTableDS,
  detailPreTableDS,
  detailDemTableDS,
  permissionDS,
} from '@/stores/NewPurchaseSettleDS';
import WorkflowCaller from '@/components/WorkflowCaller';
import { getLineStatement, getStatement } from '@/services/settlePoolServices';

const permissionPrefix = `srm.settle-account.jsd.ux-purchase.ps`;
const poolPermPrefix = `srm.settle-account.settle-pool.purchase.ps`;
const buttonPermPrefix = `srm.settle-account.jsd.ux-purchase.button`;
const wholeKeys = ['all', 'update', 'approve', 'cancel', 'sync'];
const detailKeys = ['invoice', 'payment', 'prepayment', 'demension'];
export const wholeTableUnitCodes = {
  all: 'SSTA.PURCHASE_SETTLE_LIST.GRID',
  update: 'SSTA.PURCHASE_SETTLE_LIST.MAINTAIN_GRID',
  approve: 'SSTA.PURCHASE_SETTLE_LIST.CHECK_GRID',
  cancel: 'SSTA.PURCHASE_SETTLE_LIST.CANCEL_GRID',
  sync: 'SSTA.PURCHASE_SETTLE_LIST.SYNC_GRID',
};
export const wholeSearchUnitCodes = {
  all: 'SSTA.PURCHASE_SETTLE_LIST.SEARCH_BAR_ALL',
  update: 'SSTA.PURCHASE_SETTLE_LIST.SEARCH_BAR_UPDATE',
  approve: 'SSTA.PURCHASE_SETTLE_LIST.SEARCH_BAR_APPROVE',
  cancel: 'SSTA.PURCHASE_SETTLE_LIST.SEARCH_BAR_CANCEL',
  sync: 'SSTA.PURCHASE_SETTLE_LIST.SEARCH_BAR_SYNC',
};
export const detailTableUnitCodes = {
  invoice: 'SSTA.PURCHASE_SETTLE_LIST.INVOICE_LINE_LIST',
  payment: 'SSTA.PURCHASE_SETTLE_LIST.PAYMENT_GRID',
  prepayment: 'SSTA.PURCHASE_SETTLE_LIST.PREPAYMENT_GRID',
  demension: 'SSTA.PURCHASE_SETTLE_LIST.DEMENSION_GRID',
};
export const detailSearchUnitCodes = {
  invoice: 'SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_INVOICE',
  payment: 'SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_PAYMENT',
  prepayment: 'SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_PREPAYMENT',
  demension: 'SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_DEMENSION',
};
export const permissionCodeMap = {
  invoice: `${permissionPrefix}.button.create.invoice`,
  payment: `${permissionPrefix}.button.create.payment`,
  payInvoice: `${permissionPrefix}.button.create.paymentinvoice`,
  prePayment: `${permissionPrefix}.button.create.prepayment`,
  updatePane: `${permissionPrefix}.radio.button.update`,
  auditPane: `${permissionPrefix}.radio.button.audit`,
  cancelPane: `${permissionPrefix}.radio.button.cancel`,
  syncPane: `${permissionPrefix}.radio.button.sync`,
  recallBtn: `${permissionPrefix}.radio.button.recall`,
  confirmBtn: `${permissionPrefix}.list.button.confirm`,
  returnBtn: `${permissionPrefix}.list.button.return`,
  exportBtn: `${permissionPrefix}.export`,
  newExportBtn: `${permissionPrefix}.newexport`,
  updateNewExport: `${permissionPrefix}.update.newexport`,
  printListBtn: `${buttonPermPrefix}.print-list`,
  printDetailBtn: `${buttonPermPrefix}.print-detail`,
  newPrintListBtn: `${buttonPermPrefix}.new-print-list`,
  newPrintDetailBtn: `${buttonPermPrefix}.new-print-detail`,
  invoiceNewImport: `${buttonPermPrefix}.invoice-new-import`,
  payNewImport: `${buttonPermPrefix}.payment-new-import`,
  preNewImport: `${buttonPermPrefix}.prepayment-new-import`,
  payRecordImport: `${buttonPermPrefix}.pay-record-import`,
  invoicePayment: `${permissionPrefix}.invoice.payment`,
  poolInvPane: `${poolPermPrefix}.radio.button.invoice`,
  poolpayPane: `${poolPermPrefix}.radio.button.payment`,
  poolImportBtn: `${poolPermPrefix}.batch.import`,
  poolNewImportBtn: `${poolPermPrefix}.newimport`,
  taxInvAddBtn: `${permissionPrefix}.deatil.taxline.button.add`,
  taxInvOrcBtn: `${permissionPrefix}.deatil.taxline.button.ocrread`,
  taxInvAiBtn: `${buttonPermPrefix}.taxline-ai-recognize`,
  taxInvAiRecordBtn: `${buttonPermPrefix}.taxline-ai-recognize-record`,
  taxInvPoolAiBtn: `srm.settle-account.invoice-pool.purchase.button.ai-recognize`,
  taxInvPoolAiRecordBtn: `srm.settle-account.invoice-pool.purchase.button.ai-recognize-record`,
  taxInvExcelBtn: `${permissionPrefix}.deatil.taxline.button.excel`,
  taxInvNewExcelBtn: `${permissionPrefix}.newexcel`,
  taxInvPoolBtn: `${permissionPrefix}.deatil.taxline.button.checkpool`,
  taxInvOfdBtn: `${permissionPrefix}.deatil.taxline.button.ofd`,
  taxInvImportLineBtn: `${buttonPermPrefix}.deatil.taxline.button.import-line`,
  taxInvNewImportLineBtn: `${buttonPermPrefix}.deatil.taxline.button.new-import-line`,
  taxInvNewExportLineBtn: `${buttonPermPrefix}.deatil.taxline.button.new-export`,
  taxInvAttachDownload: `${buttonPermPrefix}.detail.taxline.button.attach-download`,
  taxInvLogisticsView: `${buttonPermPrefix}.deatil.taxline.button.invoice-logistics-view`,
  taxInvColumnsEdit: `${buttonPermPrefix}.detail.taxline.column.edit`,
  lineImport: `${permissionPrefix}.lineimport`,
  lineExport: `${permissionPrefix}.lineexport`,
  newLineImport: `${permissionPrefix}.newlineimport`,
  newLineImportApprove: `${buttonPermPrefix}.new-line-import-approve`,
  newLineExport: `${permissionPrefix}.newlineexport`,
  allCreate: `${permissionPrefix}.allcreate`,
  syncPayPool: `${buttonPermPrefix}.sync-pay-pool`,
  logisticsInfoFill: `${buttonPermPrefix}.logistics-info-fill`,
  logisticsUpdate: `${buttonPermPrefix}.logistics-update`,
  invoiceAutoMatch: `${buttonPermPrefix}.invoiceautomatch`,
  toleranceAdjust: `${buttonPermPrefix}.toleranceadjust`,
  invLineAdd: `${buttonPermPrefix}.inv-line-add`,
  invLineDelete: `${buttonPermPrefix}.inv-line-delete`,
  payLineAdd: `${buttonPermPrefix}.pay-line-add`,
  payLineDelete: `${buttonPermPrefix}.pay-line-delete`,
  lineBatchModify: `${buttonPermPrefix}.line-batch-modify`,
  lineBatchModifyPub: `${buttonPermPrefix}.line-batch-modify-pub`,
  paymentInvLineBatchModify: `${buttonPermPrefix}.paymentinvoice-line-batch-modify`,
  paymentInvLineBatchModifyPub: `${buttonPermPrefix}.paymentinvoice-line-batch-modify-pub`,
  paymentLineBatchModify: `${buttonPermPrefix}.payment-line-batch-modify`,
  paymentLineBatchModifyPub: `${buttonPermPrefix}.payment-line-batch-modify-pub`,
  invoiceAdvance: `${buttonPermPrefix}.invoiceAdvance`,
  invoicePoolImportLine: 'srm.settle-account.invoice-pool.purchase.button.import-line',
  invoicePoolImportLineNew: 'srm.settle-account.invoice-pool.purchase.button.new-import-line',
  updateExpectedPayDate: `${buttonPermPrefix}.update-expected-paydate`,
  custLineExport: `${buttonPermPrefix}.cust-line-export`,
  prePaymentQuote: `${buttonPermPrefix}.prepayment-quote`,
  prePaymentManual: `${buttonPermPrefix}.prepayment-manual`,
  recallExtSysBtn: `${buttonPermPrefix}.recall-ext-sys`,
  payHeadBatchEdit: `${buttonPermPrefix}.pay-head-batch-edit`,
  preHeadBatchEdit: `${buttonPermPrefix}.pre-head-batch-edit`,
  invBudgetWriteOffRepair: `${buttonPermPrefix}.inv-budget-writeoff-repair`,
  payApplyExeQuery: `${buttonPermPrefix}.pay-apply-exe-query`,
  invoiceProgressQueryBtn: `${buttonPermPrefix}.invoice-progress-query`,
  clickDefaultPlanAmount: `${buttonPermPrefix}.click-default-plan-amount`,
  clickPrepayAutoWriteOff: `${buttonPermPrefix}.click-prepay-auto-write-off`,
  clickPrepaymentRefund: `${buttonPermPrefix}.prePaymentRefund`,
  preSourceHold: `${buttonPermPrefix}.pre-source-hold`,
  preSourceUnhold: `${buttonPermPrefix}.pre-source-unhold`,
  cancelRefundTicket: `${buttonPermPrefix}.cancel-refund-ticket`,
  quoteInvoiceExport: `${buttonPermPrefix}.quote-invoice-export`,
  deleteSettle: `${buttonPermPrefix}.delete`,
  removeOrAdd: `${buttonPermPrefix}.removeOrAdd`,
  submitBatch: `${buttonPermPrefix}.submitBatch`,
  redConfirm: `${buttonPermPrefix}.redConfirm`,
  taskProgress: `${buttonPermPrefix}.taskProgress`,
};

export const Store = createContext();

const ListStore = (props) => {
  const {
    dsMap,
    history,
    location,
    children,
    cacheState = new Map(),
    custConfig,
    customizeForm,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    remote: remoteProps,
  } = props;
  const {
    type: urlWholeType,
    dateRange: defaultDateRange,
    settleNums: defaultSettleNums,
    settleType: defaultSettleType,
    settleStatus: defaultSettleStatus,
  } = parse(location.search.substring(1));

  const urlActiveKey = urlWholeType && urlWholeType.toLowerCase();
  const { fields = [] } = custConfig?.['SSTA.PURCHASE_SETTLE_LIST.TAB'] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const defaultActiveKey = urlActiveKey || cacheState?.get('activeKey') || fieldCode || 'all';

  //  记录是否开启清理缓存记录标识
  const [isOpenClearCashed, setIsOpenClearCashed] = useState(true);
  const permissionDs = useDataSet(() => {
    const processPermCodeMap = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_LIST.PERMISSION_MAP', {})
      : {};
    return permissionDS({ ...processPermCodeMap, ...permissionCodeMap });
  }, [remoteProps]);
  const permissionMap = permissionDs.current;
  const createTitleMap = useMemo(
    () => ({
      INVOICE: intl.get(`ssta.purchaseSettle.view.title.invoiceApplyCreate`).d('发票申请新建'),
      PAYMENT: intl.get(`ssta.purchaseSettle.view.title.paymentApplyCreate`).d('付款申请新建'),
      INVOICE_PAYMENT: intl
        .get(`ssta.purchaseSettle.view.title.payApplyIncludeInvCreate`)
        .d('付款申请（含发票）新建'),
    }),
    []
  );

  const fetchTabKeysCount = useCallback(
    async (countTabKeys) => {
      if (!isArray(countTabKeys)) return;
      const resMap = await Promise.all(
        countTabKeys.map((item) => {
          const requestFunc = detailKeys.includes(item) ? getLineStatement : getStatement;
          return requestFunc({ action: item.toUpperCase(), type: 'purchaser' });
        })
      );
      if (resMap.some((res) => !getResponse(res))) return;
      resMap.forEach(({ totalElements = 0 }, index) => {
        dsMap[countTabKeys[index]].setState('totalCount', totalElements);
      });
    },
    [dsMap]
  );

  const handleToDetail = useCallback(
    (record, action) => {
      const { settleHeaderId, documentType, batchApproveId } = record.get([
        'settleHeaderId',
        'documentType',
        'batchApproveId',
      ]);
      if (documentType === 'PREPAYMENT') {
        history.push({
          pathname: '/ssta/new-purchase-settle/pre-payment',
          search: stringify({
            source: 'detail',
            documentType: 'PREPAYMENT',
            settleHeaderId,
            type: action.toUpperCase(),
          }),
        });
      } else {
        history.push({
          pathname: `/ssta/new-purchase-settle/${documentType.toLowerCase()}/${settleHeaderId}`,
          search: stringify(
            filterNullValueObject({
              source: 'list',
              type: action,
              batchApproveId:
                action === 'update' && documentType === 'PAYMENT' && !!batchApproveId
                  ? batchApproveId
                  : undefined,
            })
          ),
        });
      }
    },
    [history]
  );

  const storeValue = useMemo(
    () => ({
      dsMap,
      history,
      location,
      cacheState,
      createTitleMap,
      wholeTableUnitCodes,
      wholeSearchUnitCodes,
      detailTableUnitCodes,
      detailSearchUnitCodes,
      permissionMap,
      custConfig,
      customizeForm,
      customizeTable,
      customizeTabPane,
      customizeBtnGroup,
      detailKeys,
      urlActiveKey,
      handleToDetail,
      defaultActiveKey,
      fetchTabKeysCount,
      isOpenClearCashed,
      setIsOpenClearCashed,
      defaultDateRange,
      defaultSettleNums,
      defaultSettleType,
      defaultSettleStatus,
      remoteProps,
    }),
    [
      dsMap,
      history,
      location,
      cacheState,
      createTitleMap,
      permissionMap,
      custConfig,
      customizeForm,
      customizeTable,
      customizeTabPane,
      customizeBtnGroup,
      urlActiveKey,
      handleToDetail,
      defaultActiveKey,
      fetchTabKeysCount,
      isOpenClearCashed,
      setIsOpenClearCashed,
      defaultDateRange,
      defaultSettleNums,
      defaultSettleType,
      defaultSettleStatus,
      remoteProps,
    ]
  );

  useEffect(() => {
    fetchTabKeysCount([...wholeKeys, ...detailKeys]);
  }, [fetchTabKeysCount]);

  useEffect(() => {
    // 埋点
    if (remoteProps && remoteProps.event) {
      remoteProps.event.fireEvent('onLoadCux', { dsMap });
    }
  }, [dsMap, remoteProps]);

  useEffect(() => {
    dsMap.all.setState('workflowCaller', new WorkflowCaller(dsMap.all));
    dsMap.approve.setState('workflowCaller', new WorkflowCaller(dsMap.approve));
    return () => {
      dsMap.all.getState('workflowCaller').destroy();
      dsMap.approve.getState('workflowCaller').destroy();
    };
  }, [dsMap]);

  return (
    <Store.Provider value={storeValue}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export const ListStoreProvider = compose(
  formatterCollections({
    code: [
      'ssta.supplySettle',
      'ssta.purchaseSettle',
      'ssta.purchaseSettlePool',
      'ssta.common',
      'hzero.c7nProUI',
      'hzero.c7nProU',
      'entity.attachment',
      'hwfp.common',
      'ssta.costSheet',
      'ssta.purchasetSettle',
      'ssta.supplySettlePool',
      'hzero.common',
    ],
  }),
  remote({
    code: 'SSTA_PURCHASESETTLE_LIST',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      ...Object.values(wholeSearchUnitCodes),
      ...Object.values(wholeTableUnitCodes),
      ...Object.values(detailSearchUnitCodes),
      ...Object.values(detailTableUnitCodes),
      'SSTA.PURCHASE_SETTLE_LIST.TAB',
      'SSTA.PURCHASE_SETTLE_LIST.WHOLE_BTNS',
      'SSTA.PURCHASE_SETTLE_LIST.DETAIL_BTNS',
      'SSTA.PURCHASE_SETTLE_LIST.INV_CONFIRM',
      'SSTA.PURCHASE_SETTLE_LIST.INV_RETURN',
      'SSTA.PURCHASE_SETTLE_LIST.PAY_CONFIRM',
      'SSTA.PURCHASE_SETTLE_LIST.PAY_RETURN',
      'SSTA.PURCHASE_SETTLE_LIST.PRE_CONFIRM',
      'SSTA.PURCHASE_SETTLE_LIST.PRE_RETURN',
      'SSTA.PURCHASE_SETTLE_LIST.INV_CANCEL',
      'SSTA.PURCHASE_SETTLE_LIST.PAY_CANCEL',
      'SSTA.PURCHASE_SETTLE_LIST.PRE_CANCEL',
      'SSTA.PURCHASE_SETTLE_LIST.PAY_APPLY_EXCUTE_LINE',
    ],
  }),
  withProps(
    () => {
      const wholeAllDs = new DataSet(wholeTableDS('all'));
      const wholeUpdateDs = new DataSet(wholeTableDS('update'));
      const wholeApproveDs = new DataSet(wholeTableDS('approve'));
      const wholeCancelDs = new DataSet(wholeTableDS('cancel'));
      const wholeSyncDs = new DataSet(wholeTableDS('sync'));
      const detailInvTableDs = new DataSet(detailInvTableDS());
      const detailPayTableDs = new DataSet(detailPayTableDS());
      const detailPreTableDs = new DataSet(detailPreTableDS());
      const detailDemTableDs = new DataSet(detailDemTableDS());
      const cacheState = new Map();
      return {
        dsMap: {
          all: wholeAllDs,
          update: wholeUpdateDs,
          approve: wholeApproveDs,
          cancel: wholeCancelDs,
          sync: wholeSyncDs,
          invoice: detailInvTableDs,
          payment: detailPayTableDs,
          prepayment: detailPreTableDs,
          demension: detailDemTableDs,
        },
        cacheState,
      };
    },
    { cacheState: true }
  ),
  observer
)(ListStore);
