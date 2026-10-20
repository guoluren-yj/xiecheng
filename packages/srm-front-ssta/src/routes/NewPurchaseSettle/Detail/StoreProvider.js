/*
 * @Description: file content
 * @Date: 2022-02-08 20:27:58
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { parse } from 'querystring';
import React, { createContext, useMemo, useEffect, useCallback, useState } from 'react';
import { ModalProvider, useDataSet, Spin, Modal } from 'choerodon-ui/pro';
import { compose, isNil, isEmpty, isObject, isFunction } from 'lodash';
import { observer } from 'mobx-react';
import remote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  permissionDS,
  quoteInvoiceDS,
  settleHeaderDS,
  settleLineDS,
  taxInvoiceDS,
  multiDimensionPayDS,
  taxInvoicePoolDS,
  numLovDS,
  PaymentStageDS,
} from '@/stores/NewPurchaseSettleDS';
import { getBankLovConfig, getCalculateConfig } from '@/utils/api';
import { settleActionFlagger, taxInvoiceCheckFlagger } from '@/utils/amountConfig';
import { tableDS as settleAffairDS } from '@/stores/PurchaseSettlePoolDS';
import {
  getSettleHeaderData,
  invoiceCheck,
  returnWorkflowValidate,
  // taxSureValidate,
  updatePurchaseSettle,
  updateWorkFlow,
  workflowValidate,
  getBatchSettleList,
  userDefaultsConfig,
} from '@/services/settlePoolServices';
import WorkflowCaller from '@/components/WorkflowCaller';
import { getUxTitleCss } from '@/services/settleStrategyServices';
import {
  recordPickValues,
  handleParseErrorInfo,
  parseJson,
  openExpiredTipsModal,
} from '@/utils/utils';
import { permissionCodeMap } from '../StoreProvider';

// 头关联个性化单元字段
export const headUnitCodes = {
  INVOICE: [
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_BASE', // 开票单-基本信息
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_PAY_INFO', // 开票单-付款信息
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.BASIC', // 开票单-直连开票信息-基本信息
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.BUYER', // 开票单-直连开票信息-购方信息
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.SELLER', // 开票单-直连开票信息-销方信息
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.TICKET', // 开票单-直连开票信息-纸票收件人信息
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.OTHER', // 开票单-直连开票信息-其他信息
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_OTHER', // 开票单-其他信息
    'SSTA.PURCHASE_SETTLE_DETAIL.OTHER_WORKFLOW', // 工作流预留（开票付款共用）
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_CONFIRM', // 开票单-确认弹窗
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_RETURN', // 开票单-退回弹窗
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_CANCEL', // 开票单-取消研创
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_SYNC', // 开票单-同步弹窗
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.TOP', // 开票单主策略信息-上半部分
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.BOTTOM', // 开票单主策略信息-下半部分
    'SSTA.PURCHASE_SETTLE_DETAIL.ENCLOSURE', // 开票单-附件
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_LOGISTICS', // 开票单-物流信息补充
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_BATCH_MODIFY_LINE', // 开票单-行批量修改弹窗
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_MULTI_DIMEN_ASSIGN_CARDS', // 开票单-多维度分配信息-抽屉卡片组
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_MULTI_DIMEN_PAY_DETAIL', // 开票单-多维度分配-付款明细信息表格
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_FLOW_BASIC_CARD',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_FLOW_EXTRA_CARD',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_MULTI_DIMEN_SPLITE', // 开票单-多维度分配-拆分规则
  ],
  PAYMENT: [
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_BASE', // 付款单-基本信息
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_PAY_INFO', // 付款单-付款信息
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER', // 付款单-其他信息
    'SSTA.PURCHASE_SETTLE_DETAIL.OTHER_WORKFLOW', // 工作流预留（开票付款共用）
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CONFIRM', // 付款单-确认弹窗
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_RETURN', // 付款单-退回研创
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CANCEL', // 付款单-取消弹窗
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_TOP', // 付款单主策略信息-上半部分
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_BOTTOM', // 付款单主策略信息-下半部分
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_ENCLOSURE', // 付款单-附件
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MULTI_DIMEN_ASSIGN_CARDS', // 付款单-多维度分配信息-抽屉卡片组
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MULTI_DIMEN_PAY_DETAIL', // 付款单-多维度分配-付款明细信息表格
    'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_BATCH_MODIFY_LINE', // 付款单-行批量修改弹窗
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_FLOW_BASIC_CARD',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_FLOW_EXTRA_CARD',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MULTI_DIMEN_SPLITE', // 付款单-多维度分配-拆分规则
    'SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE_BATCH_MODIFY_LINE', // 税务发票行 批量修改
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_SYNC', // 付款单-同步弹窗
  ],
};
// 行关联个性化单元字段
export const lineUnitCodes = {
  INVOICE: [
    'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL', // 开票单行-列表
    'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH', // 开票单行-筛选器
  ],
  PAYMENT: [
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL', // 付款单行-列表
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH', // 付款单行-筛选器
  ],
};
// 个性化预留行个性化单元
export const cuszLineUnitCodes = {
  INVOICE: [
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_CUSZ_LINE',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_CUSZ_LINE_BAR',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_CUSZ_LINE_BTNS',
  ],
  PAYMENT: [
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CUSZ_LINE',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CUSZ_LINE_BAR',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CUSZ_LINE_BTNS',
  ],
};
// 新增行关联个性化单元字段
export const lineAddUnitCodes = {
  INVOICE: [
    'SSTA.PURCHASE_SETTLE_DETAIL.ADD.INVOICE', // 开票单行新增-列表
    'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_INV', // 开票单行新增-筛选器
  ],
  PAYMENT: [
    'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.ADD.LIST', // 付款单行新增-列表
    'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PAY', // 付款单行新增-筛选器
  ],
  INV_AFFAIR: ['SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_BAR_INV_AFFAIR'], // 采购方结算单-先发票后事务-step2引用结算事务新建-筛选器
};
export const quoteInvUnitCodes = [
  'SSTA.PURCHASE_SETTLE_LIST.SEARCH_BASE_INV', // 基于开票结算单创建付款单-筛选器
  'SSTA.PURCHASE_SETTLE_LIST.BASE_INVOICE_CREATE', // 基于开票结算单创建付款单-列表
];
const affairUnitCodes = {
  INVOICE: [
    'SSTA.PURCHASE_POOL_LIST.INVOICE_GRID', // 可开票结算事务-列表
    'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_INVOICE', // 可开票结算事务-筛选器
  ],
  PAYMENT: [
    'SSTA.PURCHASE_POOL_LIST.PAYMENT_GRID', // 可付款结算事务-列表
    'SSTA.PURCHASE_POOL_LIST.SAERCH_BAR_PAYMENT', // 可付款结算事务-筛选器
  ],
};
export const taxInvGirdCode = 'SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE'; // 税务发票列表
export const taxInvGirdBtnCode = 'SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE_BTNS'; // 税务发票列表-按钮组
export const writeOffAddUnitCodes = [
  'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_PRE_OFF_ADD', // 预付款核销新增-筛选器
  'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX.ADD.LIST', // 预付款核销新增-列表
];
export const multiWriteOffAddUnitCodes = [
  'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_MULTI_PRE_OFF_ADD', // 多维度预付款核销新增-筛选器
  'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.MULT.PEYPAYMENT.ADD.LIST', // 多维度预付款核销新增-列表
];
// 按阶段聚合展示
export const paymentStageCode = {
  LIST: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_STAGE_LIST',
  SEARCH: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_STAGE_SEARCH',
};
// 按阶段明细展示
export const paymentStageLineCode = {
  LIST: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_STAGE_LINE_LIST',
  SEARCH: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_STAGE_LINE_SEARCH',
};
const unitCodes = {
  INVOICE: [
    ...headUnitCodes.INVOICE,
    ...lineUnitCodes.INVOICE,
    ...lineAddUnitCodes.INVOICE,
    ...cuszLineUnitCodes.INVOICE,
    taxInvGirdCode,
    taxInvGirdBtnCode,
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_ADD', // 税务发票手工新建-表单
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_EDIT', // 税务发票行编辑-表单
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.LINE_CREATE', // 税务发票-手工新建-发票行录入
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.HEAD_EDIT.LINE_CREATE', // 税务发票-编辑-发票行录入
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.VIEW_BASIC', // 采购方结算单详情-开票-税务发票-查看-基本信息
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.VIEW_PURCHASE', // 采购方结算单详情-开票-税务发票-查看-购方信息
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.VIEW_SUPPLY', // 采购方结算单详情-开票-税务发票-查看-销方信息
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.VIEW_OTHER', // 采购方结算单详情-开票-税务发票-查看-其他信息
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.VIEW_LINE', // 采购方结算单详情-开票-税务发票-查看-发票行
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.VIEW_FILE', // 销售方结算单详情-开票-税务发票-查看-附件
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_TAX_POOL', // 税务发票选择发票池-筛选器
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.BASIC', // 采购方结算单详情-开票-税务发票-选择发票池-查看-基本信息
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.PURCHASE', // 采购方结算单详情-开票-税务发票-选择发票池-查看-购方信息
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.SUPPLY', // 采购方结算单详情-开票-税务发票-选择发票池-查看-销方信息
    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.OTHER', // 采购方结算单详情-开票-税务发票-选择发票池-查看-其他信息

    'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.NEWLINE', // 采购方结算单详情-开票-税务发票-选择发票池-查看-发票行
    'SSTA.PURCHASE_SETTLE_DETAIL.COLLAPSE', // 折叠面板
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_TAX_POOL_GRID', // 税务发票选择发票池-列表,
    'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL_BTNS', // 结算明细信息-按钮组
    'SSTA.PURCHASE_SETTLE_LIST.PAY_APPLY_EXCUTE_LINE', // 付款申请执行查询弹窗-付款行信息
  ],
  PAYMENT: [
    ...headUnitCodes.PAYMENT,
    ...lineUnitCodes.PAYMENT,
    ...lineAddUnitCodes.PAYMENT,
    ...cuszLineUnitCodes.PAYMENT,
  ],
};
const commonUnitCodes = [
  // 附件也没拆分，在headUnitCodes里面
  ...writeOffAddUnitCodes,
  ...multiWriteOffAddUnitCodes,
  'SSTA.PURCHASE_SETTLE_DETAIL.HEAD_BTNS', // 头按钮组
  'SSTA.PURCHASE_SETTLE_DETAIL.COLLAPSE', // 折叠面板
  'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX', // 预付款核销-列表
  ...Object.values(paymentStageCode),
  ...Object.values(paymentStageLineCode),
];

const drawerBtnCodes = [
  'SSTA.PURCHASE_SETTLE_LIST.INVOICE.DRAWER_BTNS',
  'SSTA.PURCHASE_SETTLE_LIST.PAYMENT.DRAWER_BTNS',
  'SSTA.PURCHASE_SETTLE_LIST.PAYINVOICE.DRAWER_BTNS',
  'SSTA.PURCHASE_SETTLE_LIST.INVOICE_PAYMENT.DRAWER_BTNS',
  'SSTA.PURCHASE_SETTLE_LIST.INV_AFFAIR.DRAWER_BTNS', // 先开票后事务
];

// 先开票后事务 录入发票池页面个性化
export const advanceInvListCodes = [
  'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE',
  'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_SEARCH_BAR',
];

const advanceInvCodes = [
  'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_ADD',
  'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_UPDATE',
  'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_BTNS',
];

const advancelineUnitCodes = [
  'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_LINE_CREATE',
  'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_LINE_EDIT',
];

export const Store = createContext();

// 开票结算单可编辑工作流路由
const { id: approverId } = getCurrentUser();
const tenantId = getCurrentOrganizationId();

const DetailStoreProvider = (props) => {
  const {
    modal,
    match,
    onLoad,
    history,
    location,
    children,
    custConfig,
    customizeForm,
    customizeTable,
    customizeCommon,
    customizeBtnGroup,
    customizeCollapse,
    remote: remoteProps,
    onFormLoaded,
    headerHideFlag,
    workProcessInfo,
  } = props;
  const { search, pathname, state } = location;
  const {
    params: {
      settleHeaderId: urlSettleHeaderId = '',
      docType = '',
      documentType: urlDocumentType = '', // 适配工作流接口传递的documentType
    },
  } = match;
  const {
    type,
    source,
    erpRead = 0,
    isReadOnly = 0,
    list,
    flowPage,
    advanceInvFlag = '',
    docLinkFlag = 0, // 单据查询只读页面，没有返回按钮，头按钮只有操作记录，行上没有单据流按钮
    batchApproveId,
  } = parse(search.substring(1)); // 创建跳到详情加个参数 如果有这个参数需要调一下尾差接口
  const [activeKey, setActiveKey] = useState(urlSettleHeaderId);
  const [settleList, setSettleList] = useState([]);
  const [uxCssObj, setUxCssObj] = useState({});
  const [preferenceObj, setPreferenceObj] = useState({});
  const settleHeaderId = isNil(list) && !batchApproveId ? urlSettleHeaderId : activeKey;
  const documentType = (urlDocumentType || docType).toUpperCase();
  // 非工作流，功能页面
  const notPub = pathname?.split('/')[1] !== 'pub';
  // 可编辑工作流
  const isEditPub = !notPub && pathname?.includes('detail-date');
  // 导出 erp工作流（有编辑和只读页面）
  const isExport = !notPub && pathname?.includes('export-erp');
  // 新审批工作量表单（有概览和明细页面）
  const isNewPub = !notPub && Boolean(flowPage);
  // 概览工作量表单
  const isOverviewPub = isNewPub && flowPage === 'overview';
  // 展示编辑框个性化字段的页面
  const editableFlowFlag = isEditPub || (isExport && erpRead !== '1');
  const [allFlag, updateFlag, approveFlag, cancelFlag, syncFlag, readOnlyFlag] = [
    type === 'all',
    type === 'update',
    type === 'approve',
    type === 'cancel',
    type === 'sync',
    ['all', 'view'].includes(type),
  ];
  const modalFlag = !isNil(modal);

  const handleHeaderUpdate = useCallback(
    (params) => {
      const { record, name, value, dataSet } = params;
      // 拼接地址
      if (name === 'regionLov' && value && isObject(value)) {
        const { regionNameList } = value;
        const regionName = (regionNameList || []).join('/');
        record.set('regionName', regionName);
        record.set({
          regionName: regionNameList.join(),
          regionLov: { ...value, regionName },
        });
      }
      if (remoteProps?.event) {
        // 增加埋点 处理二开值发生变化时的情况
        remoteProps.event.fireEvent('handleHeaderUpdateCux', {
          ...params,
          settleHeaderDs: dataSet, // 兼容下历史数据吧
        });
      }
    },
    [remoteProps]
  );
  const permissionDs = useDataSet(
    () => permissionDS(permissionCodeMap, notPub ? [] : ['lineExport', 'newLineExport']),
    [notPub]
  );
  const settleLineDs = useDataSet(() => settleLineDS(documentType, remoteProps), [
    documentType,
    remoteProps,
  ]);
  const settleHeaderDs = useDataSet(() => {
    const sourceConfig = {
      ...settleHeaderDS(settleHeaderId, documentType, { remoteProps }),
      children: { settleLineList: settleLineDs },
      events: {
        update: handleHeaderUpdate,
      },
    };
    return remoteProps
      ? remoteProps.process(
          'SSTA_PURCHASESETTLE_DETAIL_PROCESS_SETTLE_HEADER_DS_CONFIG',
          sourceConfig,
          { settleHeaderId }
        )
      : sourceConfig;
  }, [settleHeaderId, documentType, settleLineDs, handleHeaderUpdate, remoteProps]);
  const workflowCaller = useMemo(() => new WorkflowCaller(settleHeaderDs), [settleHeaderDs]);
  const taxInvoiceDs = useDataSet(() => taxInvoiceDS(settleHeaderId), [settleHeaderId]);
  const numLovDs = useDataSet(() => numLovDS(settleHeaderId), [settleHeaderId]);
  const paymentStageDs = useDataSet(() => PaymentStageDS(settleHeaderId), [settleHeaderId]);
  const permissionMap = permissionDs.current;
  const settleHeader = settleHeaderDs.current;
  const loading = settleHeaderDs.status !== 'ready';
  const [updateBtn, approveBtn, cancelBtn, syncBtn] = settleActionFlagger(
    settleHeader,
    'purchaser',
    ['UPDATE', 'APPROVE', 'CANCEL', 'SYNC'],
    { workflowCaller }
  );
  const {
    settleType,
    settleStatus,
    invoiceMethod,
    checkPointCode,
    enableCheckFlag,
    amountAdjustFlag,
    optPermissionList = [],
    invoiceMatchRuleCode,
    directInvoicingType,
    sdimApplyStatus,
    enableChargeDebitFlag,
  } =
    settleHeaderDs.current?.get([
      'settleType',
      'settleStatus',
      'invoiceMethod',
      'checkPointCode',
      'enableCheckFlag',
      'amountAdjustFlag',
      'optPermissionList',
      'invoiceMatchRuleCode',
      'directInvoicingType',
      'sdimApplyStatus',
      'enableChargeDebitFlag',
    ]) || {};
  const optPermissionObj = Object.fromEntries(
    (optPermissionList || [])
      .map(({ permissionType, operationType = '' } = {}) =>
        operationType.split(',').map((i) => [i, permissionType])
      )
      .flat()
  );
  const {
    HEAD_PAYMENT: headPayment, // 头-付款
    LINE_PAYMENT: linePayment, // 行-付款
    HEAD_PREPAYMENT_VERIFICATION: headPrePaymentVer, // 头-预付款核销
    LINE_PREPAYMENT_VERIFICATION: linePrePaymentVer, // 行-预付款核销
    HEAD_MULDIMENSION_PAYMENT: headMultiDimensionPayment, // 头-多维度付款
  } = optPermissionObj;

  const payAreaShow = !(
    documentType === 'INVOICE' &&
    (optPermissionList || []).every((item) => item?.permissionType === 'HIDE')
  );

  // 当配置中，行-付款、行-核销均不存在，且头-付款、头-核销存在任意一个时&付款申请结算单&付款申请（含发票）结算单
  // 点【保存】【提交】时，先调用原【付款自动分配】按钮逻辑，而后再执行【保存】【提交】原逻辑
  const payAutoAssignPermission =
    [linePayment, linePrePaymentVer].includes('EDIT') ||
    ![headPayment, headPrePaymentVer].includes('EDIT');

  const toleAdjustManualCuxFlag = remoteProps
    ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.TOLE_ADJUST_MANUAL_FLAG', true, {
        settleHeaderDs,
      })
    : true;

  const storeValue = useMemo(
    () => ({
      type,
      state,
      search,
      notPub,
      source,
      history,
      loading,
      syncBtn,
      erpRead,
      pathname,
      isExport,
      syncFlag,
      modalFlag,
      isEditPub,
      updateBtn,
      cancelBtn,
      settleType,
      approveBtn,
      allFlag,
      updateFlag,
      cancelFlag,
      payAreaShow,
      approveFlag,
      headPayment,
      linePayment,
      settleHeader,
      settleLineDs,
      taxInvoiceDs,
      settleStatus,
      documentType,
      readOnlyFlag,
      permissionMap,
      custConfig,
      customizeForm,
      invoiceMethod,
      workflowCaller,
      settleHeaderId,
      settleHeaderDs,
      checkPointCode,
      customizeTable,
      customizeCommon,
      enableCheckFlag,
      amountAdjustFlag,
      headPrePaymentVer,
      linePrePaymentVer,
      customizeBtnGroup,
      invoiceMatchRuleCode,
      toleAdjustManualCuxFlag,
      headMultiDimensionPayment,
      customizeCollapse,
      activeKey,
      setActiveKey,
      setSettleList,
      settleList,
      directInvoicingType,
      sdimApplyStatus,
      enableChargeDebitFlag,
      uxCssObj,
      payAutoAssignPermission,
      remoteProps,
      isReadOnly,
      docLinkFlag,
      numLovDs,
      isNewPub,
      isOverviewPub,
      headerHideFlag,
      editableFlowFlag,
      paymentStageDs,
      batchApproveId,
      preferenceObj,
    }),
    [
      type,
      state,
      search,
      notPub,
      source,
      history,
      loading,
      syncBtn,
      erpRead,
      pathname,
      isExport,
      syncFlag,
      modalFlag,
      isEditPub,
      updateBtn,
      cancelBtn,
      settleType,
      approveBtn,
      allFlag,
      updateFlag,
      cancelFlag,
      payAreaShow,
      approveFlag,
      headPayment,
      linePayment,
      settleHeader,
      settleLineDs,
      taxInvoiceDs,
      settleStatus,
      documentType,
      readOnlyFlag,
      permissionMap,
      invoiceMethod,
      custConfig,
      customizeForm,
      workflowCaller,
      settleHeaderId,
      settleHeaderDs,
      checkPointCode,
      customizeTable,
      customizeCommon,
      enableCheckFlag,
      amountAdjustFlag,
      headPrePaymentVer,
      linePrePaymentVer,
      customizeBtnGroup,
      invoiceMatchRuleCode,
      toleAdjustManualCuxFlag,
      headMultiDimensionPayment,
      customizeCollapse,
      activeKey,
      setActiveKey,
      setSettleList,
      settleList,
      directInvoicingType,
      sdimApplyStatus,
      enableChargeDebitFlag,
      uxCssObj,
      payAutoAssignPermission,
      remoteProps,
      isReadOnly,
      docLinkFlag,
      numLovDs,
      isNewPub,
      isOverviewPub,
      headerHideFlag,
      editableFlowFlag,
      paymentStageDs,
      batchApproveId,
      preferenceObj,
    ]
  );

  const fetchBankLovConfig = useCallback(async () => {
    const res = getResponse(await getBankLovConfig());
    if (isEmpty(res)) {
      settleHeaderDs.setState('supBankFlag', true);
    }
  }, [settleHeaderDs]);

  const fetchPriceCalculateConfig = useCallback(async () => {
    const res = getResponse(await getCalculateConfig());
    if (res) {
      const flag = res?.some((v) => v.algorithm === 'CURRENCY_PRECISION');
      settleHeaderDs.setState('priceCalPrecisionFlag', flag);
    }
  }, [settleHeaderDs]);

  const handleBeforeHeaderLoad = useCallback(
    ({ dataSet, data }) => {
      if (remoteProps) {
        remoteProps.event.fireEvent('beforeHeaderLoad', {
          data,
          dataSet,
          workProcessInfo,
        });
      }
    },
    [remoteProps, workProcessInfo]
  );

  // const handleHeaderUpdate = useCallback(({ record, name }) => {
  //   if (name === 'sdimPurCompanyLov') {
  //     // 【直连开票】的【购方名称】
  //     // 动态修改【购方地址、电话】
  //     const { sdimPurAddress, sdimPurTelephone } = record.get([
  //       'sdimPurAddress',
  //       'sdimPurTelephone',
  //     ]);
  //     record.set({ sdimPurAddrAndPhone: sdimPurAddress + sdimPurTelephone });
  //   }
  // }, []);

  const onLoadWorkflowCaller = useCallback(
    (e) => {
      const { dataSet, workflowCaller } = e.detail || {};
      if (!dataSet || !workflowCaller) return;
      const [updateBtn, approveBtn, cancelBtn, syncBtn] = settleActionFlagger(
        dataSet.current,
        'purchaser',
        ['UPDATE', 'APPROVE', 'CANCEL', 'SYNC_MODAL'],
        { workflowCaller }
      );
      const typeExpiredFlag =
        (updateFlag && !updateBtn) ||
        (approveFlag && !approveBtn) ||
        (cancelFlag && !cancelBtn) ||
        (syncFlag && !syncBtn);
      const newTypeExpiredFlag = remoteProps
        ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.TYPE_EXPIRED_TIP_FLAG', typeExpiredFlag, {
            dataSet,
          })
        : typeExpiredFlag;
      if (newTypeExpiredFlag) openExpiredTipsModal(onlyBackList);
    },
    [onlyBackList, updateFlag, approveFlag, cancelFlag, syncFlag, remoteProps]
  );

  useEffect(() => {
    workflowCaller.addEventListener('load', onLoadWorkflowCaller);
    return () => {
      workflowCaller.destroy();
      workflowCaller.removeEventListener('load', onLoadWorkflowCaller);
    };
  }, [workflowCaller, onLoadWorkflowCaller]);

  useEffect(() => {
    fetchBankLovConfig();
    fetchPriceCalculateConfig();
    settleHeaderDs.setState('updateFlag', updateFlag);
    settleHeaderDs.addEventListener('beforeLoad', handleBeforeHeaderLoad);
    // 埋点
    if (remoteProps && remoteProps.event) {
      remoteProps.event.fireEvent('onLoadCux', {
        settleHeaderDs,
      });
    }
  }, [
    settleHeaderDs,
    updateFlag,
    fetchBankLovConfig,
    handleBeforeHeaderLoad,
    remoteProps,
    fetchPriceCalculateConfig,
  ]);

  useEffect(() => {
    if (!isNil(list)) {
      setActiveKey(urlSettleHeaderId);
      setSettleList(JSON.parse(list));
    } else {
      setSettleList([]);
    }
  }, [list, urlSettleHeaderId, batchApproveId]);

  useEffect(() => {
    if (batchApproveId && documentType === 'PAYMENT') {
      getBatchSettleList(batchApproveId).then((res) => {
        if (getResponse(res)) {
          setActiveKey(urlSettleHeaderId);
          setSettleList(res);
        }
      });
    }
  }, [batchApproveId, documentType, urlSettleHeaderId]);

  useEffect(() => {
    userDefaultsConfig().then((res) => {
      if (getResponse(res)) {
        setPreferenceObj(res);
      }
    });
  }, []);

  useEffect(() => {
    settleHeaderDs.query().then(async (res) => {
      if (!res) return;
      // 查询ux标题字体加粗接口
      const { settleConfigId, settleType: headerSettleType, amountAdjustFlag, stepAdjustFlag } =
        res || {};
      if (settleConfigId && headerSettleType) {
        try {
          settleHeaderDs.status = 'loading';
          const uxCssRes = await getUxTitleCss(settleConfigId, headerSettleType);
          if (getResponse(uxCssRes)) {
            const { cssJson, displayArea } = uxCssRes?.[0] || {};
            const cssJsons = parseJson(cssJson);
            const displayAreas = parseJson(displayArea);

            setUxCssObj({
              uxTitleCss: { uxFontWeigthFields: cssJsons },
              uxDisplayAreas: displayAreas,
            });
          }
        } finally {
          settleHeaderDs.status = 'ready';
        }
      }
      if (advanceInvFlag && !(amountAdjustFlag === 0 || stepAdjustFlag !== 1)) {
        try {
          settleHeaderDs.status = 'loading';
          const result = await settleHeaderDs
            .setState('submitType', 'toleranceAdjust')
            .forceSubmit();
          if (result) {
            const newHeaderData = getResponse(
              await getSettleHeaderData({ documentType, settleHeaderId })
            );
            if (!newHeaderData) return;
            recordPickValues(settleHeaderDs.current, newHeaderData, [
              'netAmount',
              'taxAmount',
              'taxIncludedAmount',
              'invoiceSpliteRule',
              'diffNetAmount',
              'diffTaxAmount',
              'invoiceDifferenceAmount',
            ]);
          }
        } finally {
          settleHeaderDs.status = 'ready';
        }
      }
      if (
        // 功能审批和工作流审批自动查验
        taxInvoiceCheckFlagger({
          notPub,
          approveFlag,
          autoFlag: true,
          headerInfo: res,
        })
      ) {
        try {
          settleHeaderDs.status = 'loading';
          const checkRes = getResponse(await invoiceCheck(settleHeaderId, 'AUTO'));
          // 自动查验失败也需更新税务发票明细，未更新的话在手工查验时会版本号过时
          taxInvoiceDs.query();
          if (!checkRes) return;
          const { errorMessageMap = {}, validatedResultDTO = {} } = checkRes;
          if (!isEmpty(errorMessageMap)) {
            const errorMsg = Object.values(errorMessageMap).map((item) => item?.desc);
            notification.error({ message: errorMsg });
          }
          if (!isEmpty(validatedResultDTO) && validatedResultDTO.validatedCode !== 'SUCCESS') {
            handleParseErrorInfo(validatedResultDTO);
          }
          const newHeaderData = getResponse(
            await getSettleHeaderData({ documentType, settleHeaderId })
          );
          if (!newHeaderData) return;
          recordPickValues(settleHeaderDs.current, newHeaderData, [
            'invoiceNetAmount',
            'invoiceTaxAmount',
            'invoiceTaxIncludedAmount',
            'diffNetAmount',
            'diffTaxAmount',
            'invoiceDifferenceAmount',
          ]);
        } finally {
          settleHeaderDs.status = 'ready';
        }
      }
    });
  }, [
    notPub,
    taxInvoiceDs,
    settleHeaderDs,
    updateFlag,
    approveFlag,
    readOnlyFlag,
    documentType,
    isEditPub,
    settleHeaderId,
    advanceInvFlag,
  ]);

  // 工作流的提交方法（可编辑、导出ERP可编辑、导出ERP只读）
  const workFlowSubmit = useCallback(
    (param) => {
      return new Promise(async (resolve, reject) => {
        if (param === 'Approved') {
          const { workProcessInfo: { processCode } = {} } = props;
          const headerFlag = await settleHeaderDs.validate();
          if (!headerFlag) return reject();
          if (!settleHeaderDs.current) return reject();
          const headerData = settleHeaderDs.current.toJSONData();
          const validateOk = async () => {
            const res = isExport
              ? await updateWorkFlow({
                  ...headerData,
                  workflowFlag: 1,
                  approverId,
                  customizeUnitCode: unitCodes[documentType].join(),
                })
              : await updatePurchaseSettle({
                  ...headerData,
                  workflowFlag: 1,
                  customizeUnitCode: unitCodes[documentType].join(),
                });
            return getResponse(res) ? resolve() : reject();
          };
          const validateAmount = async () => {
            const valiRes = getResponse(await workflowValidate(headerData));
            if (!valiRes) return reject();
            const { validatedCode, msg } = valiRes || {};
            if (validatedCode === 'WARNING') {
              Modal.confirm({
                title: intl.get('ssta.common.view.message.tip').d('提示'),
                children: msg,
                autoCenter: true,
                onOk: validateOk,
                onCancel: () => reject(),
              });
            } else if (validatedCode === 'ERROR') {
              notification.error({
                message: intl.get('hzero.common.notification.error').d('操作失败'),
                description: msg,
              });
              return reject();
            } else {
              return validateOk();
            }
          };

          if (processCode !== 'SSTA.SETTLE_HEADER_CANCEL') {
            if (remoteProps) {
              // 颐海二开埋点
              const cuxResponse = await remoteProps.process(
                'SSTA_PURCHASESETTLE_DETAIL_EDIT_WORKFLOW_SUBMIT',
                true,
                { settleType, taxInvoiceDs, settleHeaderDs }
              );
              if (cuxResponse) return validateAmount();
              else return reject();
            } else {
              // 标准
              return validateAmount();
            }
            // taxSureValidate(settleHeaderId).then((res) => {
            //   if (getResponse(res)) {
            //     validateAmount();
            //   } else {
            //     reject();
            //   }
            // });
          } else {
            return validateOk();
          }
        } else {
          if (!settleHeaderDs.current) return reject();
          const headerData = settleHeaderDs.current.toJSONData();
          const res = await returnWorkflowValidate(headerData);
          if (!res) return reject();
          if (res.validatedCode === 'WARNING') {
            Modal.confirm({
              title: intl.get('ssta.common.view.message.tip').d('提示'),
              children: res.msg,
              autoCenter: true,
              onOk: () => resolve(),
              onCancel: () => reject(),
            });
          } else if (res.validatedCode === 'ERROR') {
            notification.error({
              message: intl.get('hzero.common.notification.error').d('操作失败'),
              description: res.msg,
            });
            return reject();
          } else {
            return resolve();
          }
        }
      });
    },
    [documentType, isExport, props, settleType, settleHeaderDs, remoteProps]
  );

  // 只读工作流提交
  const readOnlyWorkFlowSubmit = useCallback(
    (param) => {
      return new Promise(async (resolve, reject) => {
        if (param !== 'Approved') return resolve();
        const { processCode } = workProcessInfo || {};
        // 结算单取消审批不校验
        if (processCode === 'SSTA.SETTLE_HEADER_CANCEL') {
          return resolve();
        }
        const headerData = settleHeaderDs.current.toJSONData();
        const valiRes = getResponse(await workflowValidate(headerData));
        if (!valiRes) return reject();
        const { validatedCode, msg } = valiRes || {};
        if (validatedCode === 'WARNING') {
          Modal.confirm({
            title: intl.get('ssta.common.view.message.tip').d('提示'),
            children: msg,
            autoCenter: true,
            onOk: () => resolve(),
            onCancel: () => reject(),
          });
        } else if (validatedCode === 'ERROR') {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: msg,
          });
          return reject();
        } else {
          return resolve();
        }
      });
    },
    [settleHeaderDs, workProcessInfo]
  );

  const onlyBackList = useCallback(() => {
    history.push('/ssta/new-purchase-settle/list');
  }, [history]);

  useEffect(() => {
    const workFlowSubmitFunc = Number(isReadOnly) !== 1 ? workFlowSubmit : readOnlyWorkFlowSubmit;
    if (onLoad) onLoad({ submit: workFlowSubmitFunc });
  }, [onLoad, isReadOnly, workFlowSubmit, readOnlyWorkFlowSubmit]);

  useEffect(() => {
    // 注册了submit回调函数，需传onFormLoaded
    if (onFormLoaded && settleHeader) onFormLoaded(true);
  }, [onFormLoaded, settleHeader]);

  useEffect(() => {
    if (remoteProps && remoteProps.event) {
      const cleanupFunc = remoteProps.event.fireEvent('onEffect', {
        updateFlag,
        documentType,
        settleLineDs,
        settleHeaderDs,
      });
      if (isFunction(cleanupFunc)) return cleanupFunc;
    }
  }, [updateFlag, remoteProps, documentType, settleLineDs, settleHeaderDs]);

  if (settleHeaderId && !settleHeader) return <Spin />;

  return (
    <Store.Provider value={storeValue}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export const DetailStore = compose(
  formatterCollections({
    code: [
      'ssta.common',
      'hzero.common',
      'hwfp.common',
      'ssta.purchaseSettle',
      'entity.attachment',
      'ssta.purchaseSettlePool',
      'ssta.invoiceSheet',
      'ssta.costSheet',
      'entity.attachment',
      'ssta.purchaseInvoicePool',
      'ssta.supplyInvoicePool',
      'ssta.directPoolSupply',
      'ssta.reconciliationWorkbench',
      'ssta.supplySettlePool',
    ],
  }),
  remote(
    {
      code: 'SSTA_PURCHASESETTLE_DETAIL',
      name: 'remote',
    },
    {
      events: {
        handleRemoteBeforeSubmitValidate: (eventProps) => {
          const { standardSubmitValidate = () => {} } = eventProps || {};
          return standardSubmitValidate();
        },
      },
    }
  ),
  withCustomize({
    unitCode: [...commonUnitCodes, ...Object.values(unitCodes).flat()],
  }),
  observer
)(DetailStoreProvider);

const CreateStoreProvider = (props) => {
  const {
    modal,
    history,
    children,
    branchStep,
    onQueryList,
    step: defaultStep,
    settleType = '',
    baseInvFlag,
    baseAffairFlag,
    customizeForm,
    customizeTable,
    settleHeaderIds = '',
    settleHeaderId: propHeaderId,
    extraParams,
    customizeBtnGroup,
    customizeCollapse,
    headerTitle,
    setHeaderTitle,
    advanceInvFlag,
    remote: remoteProps,
  } = props;
  const documentType = settleType === 'INVOICE_PAYMENT' ? 'INVOICE' : settleType;
  const permissionDs = useDataSet(() => permissionDS(permissionCodeMap), []);
  const settleLineDs = useDataSet(() => settleLineDS(documentType, remoteProps), [
    documentType,
    remoteProps,
  ]);
  const [preferenceObj, setPreferenceObj] = useState({});
  const handleHeaderUpdate = useCallback(
    (params) => {
      if (remoteProps?.event) {
        // 增加埋点 处理二开值发生变化时的情况
        remoteProps.event.fireEvent('handleHeaderUpdateCux', {
          ...params,
          settleHeaderDs: params.dataSet, // 兼容下历史数据吧
        });
      }
    },
    [remoteProps]
  );
  const settleHeaderDs = useDataSet(
    () => ({
      ...settleHeaderDS(propHeaderId, documentType),
      children: {
        settleLineList: settleLineDs,
        settleLineAdd: settleLineAddDs,
        taxInvoice: taxInvoiceDs,
      },
      events: {
        update: handleHeaderUpdate,
      },
    }),
    [handleHeaderUpdate]
  );
  const {
    settleStatus,
    invoiceMethod,
    settleHeaderId = propHeaderId || settleHeaderIds.split(',')[0],
    checkPointCode,
    enableCheckFlag,
    optPermissionList = [],
    invoiceMatchRuleCode,
    paymentDimension,
    companyId,
    supplierId,
    currencyCode,
    supplierCompanyId,
  } =
    settleHeaderDs.current?.get([
      'settleStatus',
      'invoiceMethod',
      'settleHeaderId',
      'checkPointCode',
      'enableCheckFlag',
      'optPermissionList',
      'invoiceMatchRuleCode',
      'paymentDimension',
      'companyId',
      'supplierId',
      'currencyCode',
      'supplierCompanyId',
    ]) || {};
  const quoteInvoiceDs = useDataSet(() => quoteInvoiceDS(), []);
  const settleAffairDs = useDataSet(() => settleAffairDS(documentType, extraParams), [
    documentType,
    extraParams,
  ]);
  const settleLineAddDs = useDataSet(() => settleAffairDS(documentType), [documentType]);
  const multiDimensionPayDs = useDataSet(() => {
    const normalDS = multiDimensionPayDS(paymentDimension, true, {
      settleHeaderId,
      companyId,
      supplierId,
      currencyCode,
      supplierCompanyId,
    });
    const processDS = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.MULTI_DIMENSION_PAY_DSPROPS', normalDS, {})
      : normalDS;
    return processDS;
  }, [
    paymentDimension,
    settleHeaderId,
    companyId,
    supplierId,
    currencyCode,
    supplierCompanyId,
    settleHeaderDs,
    remoteProps,
  ]);
  const taxInvoiceDs = useDataSet(() => taxInvoiceDS(settleHeaderId), [settleHeaderId]);
  const taxInvoicePoolDs = useDataSet(() => taxInvoicePoolDS(), []);
  const numLovDs = useDataSet(() => numLovDS(settleHeaderId), [settleHeaderId]);
  const permissionMap = permissionDs.current;
  const settleHeader = settleHeaderDs.current;
  const loading = settleHeaderDs.status !== 'ready';
  const optPermissionObj = Object.fromEntries(
    (optPermissionList || [])
      .map(({ permissionType, operationType = '' } = {}) =>
        operationType.split(',').map((i) => [i, permissionType])
      )
      .flat()
  );
  const {
    HEAD_PAYMENT: headPayment, // 头-付款
    LINE_PAYMENT: linePayment, // 行-付款
    HEAD_PREPAYMENT_VERIFICATION: headPrePaymentVer, // 头-预付款核销
    LINE_PREPAYMENT_VERIFICATION: linePrePaymentVer, // 行-预付款核销
    HEAD_MULDIMENSION_PAYMENT: headMultiDimensionPayment, // 头-多维度付款
  } = optPermissionObj;

  const payAreaShow = !(
    documentType === 'INVOICE' &&
    (optPermissionList || []).every((item) => item?.permissionType === 'HIDE')
  );
  const branchFlag = [branchStep, settleHeaderDs.current?.get('branchStep')].includes(
    'SETTLE_LINE'
  );

  const stepNameList = useMemo(() => {
    const normalStepNameList = [
      (baseAffairFlag || settleHeaderId) && 'AFFAIR',
      baseInvFlag && !settleHeaderId && 'QUOTEINVOICE',
      branchFlag && 'SETTLE_LINE',
      settleType.includes('INVOICE') && 'TAX_INVOICE',
      settleType.includes('PAYMENT') && 'PAYMENT_INFO',
      settleHeaderId &&
        settleType.includes('PAYMENT') &&
        headMultiDimensionPayment === 'EDIT' &&
        'MULTI_DIMENSION',
      'END',
    ];
    const processStepNameList = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.STEP_NAME_LIST_CUX', normalStepNameList, {
          settleHeaderDs,
        })
      : normalStepNameList;
    return processStepNameList.filter(Boolean);
  }, [
    settleType,
    branchFlag,
    baseInvFlag,
    remoteProps,
    settleHeaderDs,
    baseAffairFlag,
    settleHeaderId,
    headMultiDimensionPayment,
  ]);
  const defaultIndex = stepNameList.findIndex((item) => item === defaultStep);
  const defaultCurrent = defaultIndex > -1 ? defaultIndex : 0;

  useEffect(() => {
    userDefaultsConfig().then((res) => {
      if (getResponse(res)) {
        setPreferenceObj(res);
      }
    });
  }, []);

  const storeValue = useMemo(() => {
    return {
      modal,
      history,
      tenantId,
      updateFlag: true,
      branchStep,
      branchFlag,
      defaultCurrent,
      headPayment,
      linePayment,
      payAreaShow,
      settleLineDs,
      settleStatus,
      documentType,
      settleHeader,
      permissionMap,
      invoiceMethod,
      customizeForm,
      settleHeaderDs,
      settleHeaderId,
      customizeTable,
      checkPointCode,
      enableCheckFlag,
      headPrePaymentVer,
      linePrePaymentVer,
      invoiceMatchRuleCode,
      headMultiDimensionPayment,
      settleAffairDs,
      quoteInvoiceDs,
      settleLineAddDs,
      multiDimensionPayDs,
      taxInvoiceDs,
      settleType,
      baseInvFlag,
      baseAffairFlag,
      stepNameList,
      onQueryList,
      customizeBtnGroup,
      loading,
      notPub: true,
      customizeCollapse,
      headerTitle,
      setHeaderTitle,
      advanceInvFlag,
      taxInvoicePoolDs,
      numLovDs,
      remoteProps,
      preferenceObj,
    };
  }, [
    modal,
    history,
    branchStep,
    branchFlag,
    defaultCurrent,
    headPayment,
    payAreaShow,
    linePayment,
    settleLineDs,
    settleStatus,
    documentType,
    settleHeader,
    permissionMap,
    invoiceMethod,
    customizeForm,
    settleHeaderDs,
    settleHeaderId,
    customizeTable,
    checkPointCode,
    enableCheckFlag,
    headPrePaymentVer,
    linePrePaymentVer,
    invoiceMatchRuleCode,
    headMultiDimensionPayment,
    settleAffairDs,
    quoteInvoiceDs,
    settleLineAddDs,
    multiDimensionPayDs,
    taxInvoiceDs,
    settleType,
    baseInvFlag,
    baseAffairFlag,
    stepNameList,
    onQueryList,
    customizeBtnGroup,
    loading,
    customizeCollapse,
    headerTitle,
    setHeaderTitle,
    advanceInvFlag,
    taxInvoicePoolDs,
    numLovDs,
    remoteProps,
    preferenceObj,
  ]);

  const fetchBankLovConfig = useCallback(async () => {
    const res = getResponse(await getBankLovConfig());
    if (isEmpty(res)) {
      settleHeaderDs.setState('supBankFlag', true);
    }
  }, [settleHeaderDs]);

  const fetchPriceCalculateConfig = useCallback(async () => {
    const res = getResponse(await getCalculateConfig());
    if (res) {
      const flag = res?.some((v) => v.algorithm === 'CURRENCY_PRECISION');
      settleHeaderDs.setState('priceCalPrecisionFlag', flag);
    }
  }, [settleHeaderDs]);

  useEffect(() => {
    fetchBankLovConfig();
    fetchPriceCalculateConfig();
    if (propHeaderId) {
      settleHeaderDs.query();
    } else if (settleHeaderIds) {
      // 结算池创建拆单时会有多笔单据查询
      settleHeaderDs.setQueryParameter('settleHeaderIds', settleHeaderIds);
      settleHeaderDs.query();
    }
    if (advanceInvFlag) {
      // 如果是先发票后事务，赋值，显示税务发票上的操作按钮
      settleHeaderDs.create({ invoiceMatchRuleCode: 'OFFLINE_INVOICE' });
    }
    settleLineDs.setState('stepFlag', 1);
    settleAffairDs.setState('stepFlag', 1);
    quoteInvoiceDs.setState('stepFlag', 1);
    settleHeaderDs.setState('stepFlag', 1);
    settleLineAddDs.setState('stepFlag', 1);
    settleHeaderDs.setState('updateFlag', true);
  }, [
    propHeaderId,
    settleHeaderIds,
    settleHeaderDs,
    settleLineDs,
    settleAffairDs,
    quoteInvoiceDs,
    settleLineAddDs,
    advanceInvFlag,
    fetchBankLovConfig,
    fetchPriceCalculateConfig,
  ]);

  if (settleHeaderId && !settleHeader) return <Spin />;

  return (
    <Store.Provider value={storeValue}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export const CreateStore = compose(
  formatterCollections({
    code: [
      'ssta.common',
      'hzero.common',
      'hwfp.common',
      'ssta.purchaseSettle',
      'entity.attachment',
      'ssta.purchaseSettlePool',
      'ssta.invoiceSheet',
      'ssta.costSheet',
      'entity.attachment',
      'ssta.purchaseInvoicePool',
      'ssta.supplyInvoicePool',
      'ssta.directPoolSupply',
      'ssta.reconciliationWorkbench',
      'ssta.invoiceSheet',
      'ssta.supplySettlePool',
    ],
  }),
  remote({
    code: 'SSTA_PURCHASESETTLE_DETAIL',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      ...commonUnitCodes,
      ...quoteInvUnitCodes,
      ...Object.values(unitCodes).flat(),
      ...Object.values(affairUnitCodes).flat(),
      ...drawerBtnCodes,
      ...advanceInvCodes,
      ...advanceInvListCodes,
      ...advancelineUnitCodes,
      ...lineAddUnitCodes.INV_AFFAIR,
    ],
  }),
  observer
)(CreateStoreProvider);
