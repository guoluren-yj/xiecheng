/*
 * @Description: file content
 * @Date: 2022-02-15 22:48:13
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
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  wholeTableDS,
  detailInvTableDS,
  detailPayTableDS,
  detailPreTableDS,
  detailDemTableDS,
  permissionDS,
} from '@/stores/NewSupplySettleDS';
import { getLineStatement, getStatement } from '@/services/settlePoolServices';

const permissionPrefix = `srm.settle-account.jsd.ux-supply.ps`;
const poolPermPrefix = `srm.settle-account.settle-pool.supply.ps`;
const buttonPermPrefix = `srm.settle-account.jsd.ux-supply.button`;
const wholeKeys = ['all', 'update', 'approve', 'cancel', 'sync'];
const detailKeys = ['invoice', 'payment', 'prepayment', 'demension'];
export const wholeTableUnitCodes = {
  all: 'SSTA.SUPPLY_SETTLE_LIST.GRID',
  update: 'SSTA.SUPPLY_SETTLE_LIST.MAINTAIN_GRID',
  approve: 'SSTA.SUPPLY_SETTLE_LIST.CHECK_GRID',
  cancel: 'SSTA.SUPPLY_SETTLE_LIST.CANCEL_GRID',
};
export const wholeSearchUnitCodes = {
  all: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_ALL',
  update: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_UPDATE',
  approve: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_APPROVE',
  cancel: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_CANCEL',
};
export const detailTableUnitCodes = {
  invoice: 'SSTA.SUPPLY_SETTLE_LIST.INVOICE_LINE_GRID',
  payment: 'SSTA.SUPPLY_SETTLE_LIST.PAYMENT_GRID',
  prepayment: 'SSTA.SUPPLY_SETTLE_LIST.PREPAYMENT_GRID',
  demension: 'SSTA.SUPPLY_SETTLE_LIST.DEMENSION_GRID',
};
export const detailSearchUnitCodes = {
  invoice: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_INVOICE',
  payment: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_PAYMENT',
  prepayment: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_PREPAYMENT',
  demension: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_DEMENSION',
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
  printListBtn: `${buttonPermPrefix}.print-list`,
  printDetailBtn: `${buttonPermPrefix}.print-detail`,
  newPrintListBtn: `${buttonPermPrefix}.new-print-list`,
  newPrintDetailBtn: `${buttonPermPrefix}.new-print-detail`,
  poolInvPane: `${poolPermPrefix}.radio.button.invoice`,
  poolpayPane: `${poolPermPrefix}.radio.button.payment`,
  poolImportBtn: `${poolPermPrefix}.batch.import`,
  poolNewImportBtn: `${poolPermPrefix}.newimport`,
  taxInvAddBtn: `${permissionPrefix}.deatil.taxline.button.add`,
  taxInvOrcBtn: `${permissionPrefix}.deatil.taxline.button.ocrread`,
  taxInvAiBtn: `${buttonPermPrefix}.taxline-ai-recognize`,
  taxInvAiRecordBtn: `${buttonPermPrefix}.taxline-ai-recognize-record`,
  taxInvPoolAiBtn: `srm.settle-account.invoice-pool.supply.button.ai-recognize`,
  taxInvPoolAiRecordBtn: `srm.settle-account.invoice-pool.supply.button.ai-recognize-record`,
  taxInvExcelBtn: `${permissionPrefix}.deatil.taxline.button.excel`,
  taxInvNewExcelBtn: `${permissionPrefix}.newexcel`,
  taxInvPoolBtn: `${permissionPrefix}.deatil.taxline.button.chosepool`,
  taxInvOfdBtn: `${permissionPrefix}.deatil.taxline.button.ofd`,
  taxInvImportLineBtn: `${buttonPermPrefix}.deatil.taxline.button.import-line`,
  taxInvNewImportLineBtn: `${buttonPermPrefix}.deatil.taxline.button.new-import-line`,
  taxInvNewExportLineBtn: `${buttonPermPrefix}.deatil.taxline.button.new-export`,
  taxInvAttachDownload: `${buttonPermPrefix}.detail.taxline.button.attach-download`,
  taxInvColumnsEdit: `${buttonPermPrefix}.detail.taxline.column.edit`,
  lineImport: `${permissionPrefix}.lineimport`,
  lineExport: `${permissionPrefix}.lineexport`,
  newLineImport: `${permissionPrefix}.newlineimport`,
  newLineImportApprove: `${buttonPermPrefix}.new-line-import-approve`,
  newLineExport: `${permissionPrefix}.newlineexport`,
  invoicePayment: `${permissionPrefix}.invoice.payment`,
  updateNewExport: `${permissionPrefix}.update.new.export`,
  allCreate: `${permissionPrefix}.allcreate`,
  logisticsInfoFill: `${buttonPermPrefix}.logistics-info-fill`,
  logisticsUpdate: `${buttonPermPrefix}.logistics-update`,
  invoiceAutoMatch: `${buttonPermPrefix}.invoiceautomatch`,
  toleranceAdjust: `${buttonPermPrefix}.toleranceadjust`,
  invLineAdd: `${buttonPermPrefix}.inv-line-add`,
  invLineDelete: `${buttonPermPrefix}.inv-line-delete`,
  payLineAdd: `${buttonPermPrefix}.pay-line-add`,
  payLineDelete: `${buttonPermPrefix}.pay-line-delete`,
  lineBatchModify: `${buttonPermPrefix}.line-batch-modify`,
  paymentLineBatchModify: `${buttonPermPrefix}.payment-line-batch-modify`,
  paymentInvLineBatchModify: `${buttonPermPrefix}.paymentinvoice-line-batch-modify`,
  invoiceAdvance: `${buttonPermPrefix}.invoiceAdvance`,
  invoicePoolImportLine: 'srm.settle-account.invoice-pool.supply.button.import-line',
  invoicePoolImportLineNew: 'srm.settle-account.invoice-pool.supply.button.new-import-line',
  custLineExport: `${buttonPermPrefix}.cust-line-export`,
  prePaymentQuote: `${buttonPermPrefix}.prepayment-quote`,
  prePaymentManual: `${buttonPermPrefix}.prepayment-manual`,
  recallExtSysBtn: `${buttonPermPrefix}.recall-ext-sys`,
  recallWorkflowBtn: `${buttonPermPrefix}.recall-workflow`,
  payHeadBatchEdit: `${buttonPermPrefix}.pay-head-batch-edit`,
  preHeadBatchEdit: `${buttonPermPrefix}.pre-head-batch-edit`,
  payApplyExeQuery: `${buttonPermPrefix}.pay-apply-exe-query`,
  clickDefaultPlanAmount: `${buttonPermPrefix}.click-default-plan-amount`,
  clickPrepayAutoWriteOff: `${buttonPermPrefix}.click-prepay-auto-write-off`,
  preSourceHold: `${buttonPermPrefix}.pre-source-hold`,
  preSourceUnhold: `${buttonPermPrefix}.pre-source-unhold`,
  quoteInvoiceExport: `${buttonPermPrefix}.quote-invoice-export`,
  deleteSettle: `${buttonPermPrefix}.delete`,
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
  const { fields = [] } = custConfig?.['SSTA.SUPPLY_SETTLE_LIST.TAB'] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const defaultActiveKey = fieldCode || cacheState?.get('activeKey') || 'all';

  //  记录是否开启清理缓存记录标识
  const [isOpenClearCashed, setIsOpenClearCashed] = useState(true);
  const permissionDs = useDataSet(() => permissionDS(permissionCodeMap), []);
  const permissionMap = permissionDs.current;

  const createTitleMap = useMemo(
    () => ({
      INVOICE: intl.get(`ssta.supplySettle.view.title.invoiceApplyCreate`).d('发票申请新建'),
      PAYMENT: intl.get(`ssta.supplySettle.view.title.collectionApplyCreate`).d('收款申请新建'),
      INVOICE_PAYMENT: intl
        .get(`ssta.supplySettle.view.title.colApplyIncludeInvCreate`)
        .d('收款申请（含发票）新建'),
    }),
    []
  );

  const fetchTabKeysCount = useCallback(
    async (countTabKeys) => {
      if (!isArray(countTabKeys)) return;
      const resMap = await Promise.all(
        countTabKeys.map((item) => {
          const requestFunc = detailKeys.includes(item) ? getLineStatement : getStatement;
          return requestFunc({ action: item.toUpperCase(), type: 'supplier' });
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
      const { settleHeaderId, documentType } = record.get(['settleHeaderId', 'documentType']);
      if (documentType === 'PREPAYMENT') {
        history.push({
          pathname: '/ssta/new-supply-settle/pre-payment',
          search: stringify({
            source: 'detail',
            documentType: 'PREPAYMENT',
            settleHeaderId,
            type: action.toUpperCase(),
          }),
        });
      } else {
        history.push({
          pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${settleHeaderId}`,
          search: stringify({
            source: 'list',
            type: action,
          }),
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
      'ssta.supplySettlePool',
      'ssta.common',
      'hzero.c7nProUI',
      'hzero.c7nProU',
      'entity.attachment',
      'hwfp.common',
      'ssta.costSheet',
      'ssta.purchaseSettle',
      'ssta.directPoolSupply',
      'ssta.purchaseSettlePool',
      'ssta.settlePool',
      'hzero.common',
    ],
  }),
  remote({
    code: 'SSTA_SUPPLYSETTLE_LIST',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      ...Object.values(wholeSearchUnitCodes),
      ...Object.values(wholeTableUnitCodes),
      ...Object.values(detailSearchUnitCodes),
      ...Object.values(detailTableUnitCodes),
      'SSTA.SUPPLY_SETTLE_LIST.TAB',
      'SSTA.SUPPLY_SETTLE_LIST.WHOLE_BTNS',
      'SSTA.SUPPLY_SETTLE_LIST.DETAIL_BTNS',
      'SSTA.SUPPLY_SETTLE_LIST.INV_CONFIRM',
      'SSTA.SUPPLY_SETTLE_LIST.INV_RETURN',
      'SSTA.SUPPLY_SETTLE_LIST.PAY_CONFIRM',
      'SSTA.SUPPLY_SETTLE_LIST.PAY_RETURN',
      'SSTA.SUPPLY_SETTLE_LIST.PRE_CONFIRM',
      'SSTA.SUPPLY_SETTLE_LIST.PRE_RETURN',
      'SSTA.SUPPLY_SETTLE_LIST.INV_CANCEL',
      'SSTA.SUPPLY_SETTLE_LIST.PAY_CANCEL',
      'SSTA.SUPPLY_SETTLE_LIST.PRE_CANCEL',
      'SSTA.SUPPLY_SETTLE_LIST.PAY_APPLY_EXCUTE_LINE',
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
