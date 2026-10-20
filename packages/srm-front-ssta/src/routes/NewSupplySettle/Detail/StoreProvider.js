/*
 * @Description: file content
 * @Date: 2022-02-08 20:27:58
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { parse } from 'querystring';
import React, { createContext, useMemo, useEffect, useState, useCallback } from 'react';
import { ModalProvider, useDataSet, Spin } from 'choerodon-ui/pro';
import { compose, isNil, isEmpty, isObject, isFunction } from 'lodash';
import { observer } from 'mobx-react';
import remote from 'hzero-front/lib/utils/remote';

import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
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
  PaymentStageDS,
} from '@/stores/NewSupplySettleDS';
import { getBankLovConfig, getCalculateConfig } from '@/utils/api';
import { settleActionFlagger, taxInvoiceCheckFlagger } from '@/utils/amountConfig';
import { tableDS as settleAffairDS } from '@/stores/SupplySettlePoolDS';
import {
  getSettleHeaderDataSup,
  invoiceCheck,
  userDefaultsConfig,
} from '@/services/settlePoolServices';
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
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_BASE', // 开票单-基本信息
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_PAY_INFO', // 开票单-付款信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_DIR_BILL_INFO.BASIC', // 开票单-直连开票信息-基本信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_DIR_BILL_INFO.BUYER', // 开票单-直连开票信息-购方信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_DIR_BILL_INFO.SELLER', // 开票单-直连开票信息-销方信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_DIR_BILL_INFO.TICKET', // 开票单-直连开票信息-纸票收件人信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_DIR_BILL_INFO.OTHER', // 开票单-直连开票信息-其他信息
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_OTHER', // 开票单-其他信息'
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_CONFIRM', // 开票单-确认弹窗
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_RETURN', // 开票单-退回弹窗
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_CANCEL', // 开票单-取消研创
    'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.TOP', // 开票单主策略信息-上半部分
    'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.BOTTOM', // 开票单主策略信息-下半部分
    'SSTA.SUPPLY_SETTLE_DETAIL.ENCLOSURE', // 开票单-附件
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_LOGISTICS', // 物流信息补充
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_BATCH_MODIFY_LINE', // 开票单-行批量修改弹窗
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_MULTI_DIMEN_ASSIGN_CARDS', // 开票单-多维度分配信息-抽屉卡片组
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_MULTI_DIMEN_PAY_DETAIL', // 开票单-多维度分配-付款明细信息表格
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_FLOW_BASIC_CARD',
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_FLOW_EXTRA_CARD',
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_MULTI_DIMEN_SPLITE', // 开票单-多维度分配-拆分规则
  ],
  PAYMENT: [
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_BASE', // 付款单-基本信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_PAY_INFO', // 付款单-付款信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_OTHER', // 付款单-其他信息
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_CONFIRM', // 付款单-确认弹窗
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_RETURN', // 付款单-退回研创
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_CANCEL', // 付款单-取消弹窗
    'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.PAY_TOP', // 付款单主策略信息-上半部分
    'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.PAY_BOTTOM', // 付款单主策略信息-下半部分
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_OTHER_ENCLOSURE', // 付款单-附件
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_MULTI_DIMEN_ASSIGN_CARDS', // 付款单-多维度分配信息-抽屉卡片组
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_MULTI_DIMEN_PAY_DETAIL', // 付款单-多维度分配-付款明细信息表格
    'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_BATCH_MODIFY_LINE', // 付款单-行批量修改弹窗
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_FLOW_BASIC_CARD',
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_FLOW_EXTRA_CARD',
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_MULTI_DIMEN_SPLITE', // 付款单-多维度分配-拆分规则
  ],
};
// 行关联个性化单元字段
export const lineUnitCodes = {
  INVOICE: [
    'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTIONDETAIL', // 开票单行-列表
    'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH', // 开票单行-筛选器
    'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTIONDETAIL_BTNS', // 开票单行-按钮
  ],
  PAYMENT: [
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL', // 付款单行-列表
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH', // 付款单行-筛选器
  ],
};
// 个性化预留行个性化单元
export const cuszLineUnitCodes = {
  INVOICE: [
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_CUSZ_LINE',
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_CUSZ_LINE_BAR',
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_CUSZ_LINE_BTNS',
  ],
  PAYMENT: [
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_CUSZ_LINE',
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_CUSZ_LINE_BAR',
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_CUSZ_LINE_BTNS',
  ],
};
// 新增行关联个性化单元字段
export const lineAddUnitCodes = {
  INVOICE: [
    'SSTA.SUPPLY_SETTLE_DETAIL.ADD.INVOICE', // 开票单行新增-列表
    'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_INV', // 开票单行新增-筛选器
  ],
  PAYMENT: [
    'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.ADD.LIST', // 付款单行新增-列表
    'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_PAY', // 付款单行新增-筛选器
  ],
};
export const quoteInvUnitCodes = [
  'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BASE_INV', // 基于开票结算单创建付款单-筛选器
  'SSTA.SUPPLY_SETTLE_LIST.BASE_INVOICE_CREATE', // 基于开票结算单创建付款单-列表
];
const affairUnitCodes = {
  INVOICE: [
    'SSTA.SUPPLY_POOL_LIST.INVOICE_GRID', // 可开票结算事务-列表
    'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_INVOICE', // 可开票结算事务-筛选器
  ],
  PAYMENT: [
    'SSTA.SUPPLY_POOL_LIST.PAYMENT_GRID', // 可付款结算事务-列表
    'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_PAYMENT', // 可付款结算事务-筛选器
  ],
};
export const taxInvGirdCode = 'SSTA.SUPPLY_SETTLE_DETAIL.TAXINVOICE'; // 税务发票列表
export const taxInvGirdBtnCode = 'SSTA.SUPPLY_SETTLE_DETAIL.TAXINVOICE_BTNS'; // 税务发票列表-按钮组

export const writeOffAddUnitCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_PRE_OFF_ADD', // 预付款核销新增-筛选器
  'SSTA.SUPPLY_SETTLE_DETAIL.BOX.ADD.LIST', // 预付款核销新增-列表
];
export const multiWriteOffAddUnitCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_MULTI_PRE_OFF_ADD', // 多维度预付款核销新增-筛选器
  'SSTA.SUPPLY_SETTLE_DETAIL.INVOICE_INFO_BOX_ADD.LIST', // 多维度预付款核销新增-列表
];

const drawerBtnCodes = [
  'SSTA.SUPPLY_SETTLE_LIST.INVOICE.DRAWER_BTNS',
  'SSTA.SUPPLY_SETTLE_LIST.PAYMENT.DRAWER_BTNS',
  'SSTA.SUPPLY_SETTLE_LIST.PAYINVOICE.DRAWER_BTNS',
  'SSTA.SUPPLY_SETTLE_LIST.INVOICE_PAYMENT.DRAWER_BTNS',
];

// 先开票后事务 录入发票池页面个性化
export const advanceInvListCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE',
  'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_SEARCH_BAR',
];

const advanceInvCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_ADD',
  'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_UPDATE',
  'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_BTNS',
];

const advancelineUnitCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_LINE_CREATE',
  'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_LINE_EDIT',
];

// 按阶段聚合展示
export const paymentStageCode = {
  LIST: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_STAGE_LIST',
  SEARCH: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_STAGE_SEARCH',
};
// 按阶段明细展示
export const paymentStageLineCode = {
  LIST: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_STAGE_LINE_LIST',
  SEARCH: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_STAGE_LINE_SEARCH',
};

// (ux)销售方结算单-收款申请（含发票）-基于事务-按钮组
const unitCodes = {
  INVOICE: [
    ...headUnitCodes.INVOICE,
    ...lineUnitCodes.INVOICE,
    ...lineAddUnitCodes.INVOICE,
    ...cuszLineUnitCodes.INVOICE,
    taxInvGirdCode,
    taxInvGirdBtnCode,
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_ADD', // 税务发票手工新建-表单
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_EDIT', // 税务发票行编辑-表单
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.HEAD_EDIT.LINE_CREATE', // 税务发票-编辑-发票行录入
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.LINE_CREATE', // 税务发票-手工新建-发票行录入
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_BASIC', // 销售方结算单详情-开票-税务发票-查看-基本信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_PURCHASE', // 销售方结算单详情-开票-税务发票-查看-购方信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_SUPPLY', // 销售方结算单详情-开票-税务发票-查看-销方信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_OTHER', // 销售方结算单详情-开票-税务发票-查看-其他信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_LINE', // 销售方结算单详情-开票-税务发票-查看-发票行
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_FILE', // 销售方结算单详情-开票-税务发票-查看-附件
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_TAX_POOL', // 税务发票选择发票池-筛选器
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.BASIC', // 销售方结算单详情-开票-税务发票-选择发票池-查看-基本信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.PURCHASE', // 销售方结算单详情-开票-税务发票-选择发票池-查看-购方信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.SUPPLY', // 销售方结算单详情-开票-税务发票-选择发票池-查看-销方信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.OTHER', // 销售方结算单详情-开票-税务发票-选择发票池-查看-其他信息
    'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.NEWLINE', // 销售方结算单详情-开票-税务发票-选择发票池-查看-发票行
    'SSTA.SUPPLY_SETTLE_DETAIL.INV_TAX_POOL_GRID', // 税务发票选择发票池-列表
    'SSTA.SUPPLY_SETTLE_LIST.PAY_APPLY_EXCUTE_LINE',
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
  'SSTA.SUPPLY_SETTLE_DETAIL.HEAD_BTNS', // 头按钮组
  'SSTA.SUPPLY_SETTLE_DETAIL.COLLAPSE', // 折叠面板
  'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX', // 预付款核销-列表
  ...Object.values(paymentStageCode),
  ...Object.values(paymentStageLineCode),
];

export const Store = createContext();

const tenantId = getCurrentOrganizationId();

const DetailStoreProvider = (props) => {
  const {
    modal,
    match,
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
  } = props;
  const { search, pathname, state } = location;
  const {
    params: {
      settleHeaderId: urlSettleHeaderId,
      docType = '',
      documentType: urlDocumentType = '', // 适配工作流接口传递的documentType
    },
  } = match;
  const { type, source, list, advanceInvFlag = '', flowPage } = parse(search.substring(1));
  const [activeKey, setActiveKey] = useState(urlSettleHeaderId);
  const [settleList, setSettleList] = useState([]);
  const [uxCssObj, setUxCssObj] = useState({});
  const [preferenceObj, setPreferenceObj] = useState({});
  const settleHeaderId = isNil(list) ? urlSettleHeaderId : activeKey;
  const documentType = (urlDocumentType || docType).toUpperCase();
  const notPub = pathname.split('/')[1] !== 'pub';
  const isNewPub = pathname.split('/')[1] === 'pub' && Boolean(flowPage);
  const isOverviewPub = isNewPub && flowPage === 'overview';
  const [allFlag, updateFlag, approveFlag, cancelFlag, readOnlyFlag] = [
    type === 'all',
    type === 'update',
    type === 'approve',
    type === 'cancel',
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
          'SSTA_SUPPLYSETTLE_DETAIL_PROCESS_SETTLE_HEADER_DS_CONFIG',
          sourceConfig,
          { settleHeaderId }
        )
      : sourceConfig;
  }, [settleHeaderId, documentType, settleLineDs, handleHeaderUpdate]);
  const taxInvoiceDs = useDataSet(() => taxInvoiceDS(settleHeaderId), [settleHeaderId]);
  const paymentStageDs = useDataSet(() => PaymentStageDS(settleHeaderId), [settleHeaderId]);
  const permissionMap = permissionDs.current;
  const settleHeader = settleHeaderDs.current;
  const loading = settleHeaderDs.status !== 'ready';
  const [updateBtn, approveBtn, cancelBtn] = settleActionFlagger(settleHeader, 'supplier', [
    'UPDATE',
    'APPROVE',
    'CANCEL',
  ]);
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
    HEAD_PREPAYMENT_VERIFICATION: headPrePaymentVer, // 头-预收款核销
    LINE_PREPAYMENT_VERIFICATION: linePrePaymentVer, // 行-预收款核销
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
    ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.TOLE_ADJUST_MANUAL_FLAG', true, {
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
      pathname,
      updateBtn,
      cancelBtn,
      modalFlag,
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
      settleList,
      directInvoicingType,
      enableChargeDebitFlag,
      uxCssObj,
      payAutoAssignPermission,
      remoteProps,
      isNewPub,
      isOverviewPub,
      paymentStageDs,
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
      pathname,
      updateBtn,
      cancelBtn,
      modalFlag,
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
      settleList,
      directInvoicingType,
      enableChargeDebitFlag,
      uxCssObj,
      payAutoAssignPermission,
      remoteProps,
      isNewPub,
      isOverviewPub,
      paymentStageDs,
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

  const onlyBackList = useCallback(() => {
    history.push('/ssta/new-supply-settle/list');
  }, [history]);

  const onHeaderLoad = useCallback(
    ({ dataSet }) => {
      const [updateBtn, approveBtn, cancelBtn] = settleActionFlagger(dataSet.current, 'supplier', [
        'UPDATE',
        'APPROVE',
        'CANCEL',
      ]);
      const typeExpiredFlag =
        (updateFlag && !updateBtn) || (approveFlag && !approveBtn) || (cancelFlag && !cancelBtn);
      if (typeExpiredFlag) openExpiredTipsModal(onlyBackList);
    },
    [onlyBackList, updateFlag, approveFlag, cancelFlag]
  );

  useEffect(() => {
    settleHeaderDs.addEventListener('load', onHeaderLoad);
    return () => {
      settleHeaderDs.removeEventListener('load', onHeaderLoad);
    };
  }, [settleHeaderDs, onHeaderLoad]);

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

  useEffect(() => {
    fetchBankLovConfig();
    fetchPriceCalculateConfig();
    settleHeaderDs.setState('updateFlag', updateFlag);
  }, [settleHeaderDs, updateFlag, fetchBankLovConfig, fetchPriceCalculateConfig]);

  useEffect(() => {
    if (!isNil(list)) {
      setActiveKey(urlSettleHeaderId);
      setSettleList(JSON.parse(list));
    } else {
      setSettleList([]);
    }
  }, [list, urlSettleHeaderId]);

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
              await getSettleHeaderDataSup({ documentType, settleHeaderId })
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
            await getSettleHeaderDataSup({ documentType, settleHeaderId })
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
    settleHeaderDs,
    updateFlag,
    approveFlag,
    readOnlyFlag,
    documentType,
    settleHeaderId,
    taxInvoiceDs,
    advanceInvFlag,
  ]);

  useEffect(() => {
    userDefaultsConfig().then((res) => {
      if (getResponse(res)) {
        setPreferenceObj(res);
      }
    });
  }, []);

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
      'hwfp.common',
      'hzero.c7nProUI',
      'hzero.common',
      'hzero.c7nProU',
      'ssta.supplySettle',
      'entity.attachment',
      'ssta.common',
      'ssta.purchaseSettle',
      'ssta.supplySettlePool',
      'ssta.invoiceSheet',
      'ssta.costSheet',
      'entity.attachment',
      'ssta.purchaseInvoicePool',
      'ssta.supplyInvoicePool',
      'ssta.directPoolSupply',
      'ssta.settlePool',
      'ssta.reconciliationWorkbench',
      'ssta.purchaseSettlePool',
    ],
  }),
  remote({
    code: 'SSTA_SUPPLYSETTLE_DETAIL',
    name: 'remote',
  }),
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
  const [preferenceObj, setPreferenceObj] = useState({});
  const documentType = settleType === 'INVOICE_PAYMENT' ? 'INVOICE' : settleType;
  const permissionDs = useDataSet(() => permissionDS(permissionCodeMap), []);
  const settleLineDs = useDataSet(() => settleLineDS(documentType, remoteProps), [
    documentType,
    remoteProps,
  ]);
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
  const multiDimensionPayDs = useDataSet(
    () =>
      multiDimensionPayDS(paymentDimension, true, {
        settleHeaderId,
        companyId,
        supplierId,
        currencyCode,
        supplierCompanyId,
      }),
    [paymentDimension, settleHeaderId]
  );
  const taxInvoiceDs = useDataSet(() => taxInvoiceDS(settleHeaderId), [settleHeaderId]);
  const taxInvoicePoolDs = useDataSet(() => taxInvoicePoolDS(), []);
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
    return [
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
    ].filter(Boolean);
  }, [
    settleType,
    branchFlag,
    baseInvFlag,
    baseAffairFlag,
    settleHeaderId,
    headMultiDimensionPayment,
  ]);
  const defaultIndex = stepNameList.findIndex((item) => item === defaultStep);
  const defaultCurrent = defaultIndex > -1 ? defaultIndex : 0;

  const storeValue = useMemo(() => {
    return {
      modal,
      history,
      tenantId,
      updateFlag: true,
      branchStep,
      onQueryList,
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
      customizeBtnGroup,
      loading,
      notPub: true,
      customizeCollapse,
      headerTitle,
      setHeaderTitle,
      advanceInvFlag,
      taxInvoicePoolDs,
      remoteProps,
      preferenceObj,
    };
  }, [
    modal,
    history,
    branchStep,
    onQueryList,
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
    customizeBtnGroup,
    loading,
    customizeCollapse,
    headerTitle,
    setHeaderTitle,
    advanceInvFlag,
    taxInvoicePoolDs,
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

  useEffect(() => {
    userDefaultsConfig().then((res) => {
      if (getResponse(res)) {
        setPreferenceObj(res);
      }
    });
  }, []);

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
      'hwfp.common',
      'hzero.c7nProUI',
      'hzero.common',
      'hzero.c7nProU',
      'ssta.supplySettle',
      'entity.attachment',
      'ssta.common',
      'ssta.purchaseSettle',
      'ssta.supplySettlePool',
      'ssta.invoiceSheet',
      'ssta.costSheet',
      'entity.attachment',
      'ssta.purchaseInvoicePool',
      'ssta.supplyInvoicePool',
      'ssta.directPoolSupply',
      'ssta.reconciliationWorkbench',
      'ssta.invoiceSheet',
      'ssta.purchaseSettlePool',
    ],
  }),
  remote({
    code: 'SSTA_SUPPLYSETTLE_DETAIL',
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
    ],
  }),
  observer
)(CreateStoreProvider);
