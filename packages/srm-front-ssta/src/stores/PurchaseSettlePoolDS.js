import { getCurrentOrganizationId, isTenantRoleLevel, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import moment from 'moment';
import { isObject } from 'lodash';
import { dateRender } from 'utils/renderer';
import {
  findMenuName,
  transformSupplierData,
  amountFormatterOptions,
  transformQselectDate,
} from '@/utils/utils';
import { headUnitCodes } from '@/routes/NewPurchaseSettle/Detail/StoreProvider';

const organizationId = getCurrentOrganizationId();

const tableUnitCodes = {
  A: 'SSTA.PURCHASE_POOL_LIST.GRID',
  B: 'SSTA.PURCHASE_POOL_LIST.BILL_GRID',
  C: 'SSTA.PURCHASE_POOL_LIST.INVOICE_GRID',
  D: 'SSTA.PURCHASE_POOL_LIST.PAYMENT_GRID',
  E: 'SSTA.PURCHASE_POOL_LIST.TRASH_GRID',
};

const filterUnitCodes = {
  A: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_ALL',
  B: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_BILL',
  C: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_INVOICE',
  D: 'SSTA.PURCHASE_POOL_LIST.SAERCH_BAR_PAYMENT',
  E: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_TRASH',
};

const addSettleLineTableCodes = {
  C: 'SSTA.PURCHASE_SETTLE_DETAIL.ADD.INVOICE',
  D: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.ADD.LIST',
};

const addSettleLineSearchCode = {
  C: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_INV',
  D: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PAY',
};

// 结算池详情个性化编码
const customizeUnitCode = [
  'SSTA.PURCHASE_POOL_DETAIL.TRADINGPARTY',
  'SSTA.PURCHASE_POOL_DETAIL.TRANSACTIONAMOUNT',
  'SSTA.PURCHASE_POOL_DETAIL.TRANSACTIONMATTER',
  'SSTA.PURCHASE_POOL_DETAIL.BILL',
  'SSTA.PURCHASE_POOL_DETAIL.INVOICE',
  'SSTA.PURCHASE_POOL_DETAIL.PAYMENT',
  'SSTA.PURCHASE_POOL_DETAIL.DATARULES',
  'SSTA.PURCHASE_POOL_DETAIL.BILLRULES',
  'SSTA.PURCHASE_POOL_DETAIL.SETTLERULES',
  'SSTA.PURCHASE_SETTLE_DETAIL.TRADING.AFFAIRSINFO',
  'SSTA.PURCHASE_SETTLE_DETAIL.TRADING_PARTY',
  'SSTA.PURCHASE_SETTLE_DETAIL.MASTER_INFO_DETAIL',
  'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MASTER_INFO_DETAIL',
].join();

const tableDS = (documentType, extraParams) => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'settleId',
    validateBeforeQuery: false,
    dataToJSON: 'selected',
    pageSize: 20,
    queryFields: [],
    fields: [
      {
        name: 'settleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum')
          .d('结算事务编号'),
      },
      {
        name: 'errorSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.errorSettleNum')
          .d('结算事务编号'),
      },
      {
        name: 'souceSettleAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.souceSettleAndLineNum')
          .d('结算事务来源编号-行号'),
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.company`).d('公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationName`)
          .d('库存组织'),
        type: 'string',
        name: 'invOrganizationName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyName`)
          .d('供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`).d('币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.itemName`)
          .d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        type: 'number',
        name: 'quantity',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleableQuantity`)
          .d('可结算数量'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedssAmounts`)
          .d('可对账金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        type: 'string',
        name: 'billStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billStatusMeaning`)
          .d('对账状态'),
        help: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.Tooltip.billStatusMeaning`)
          .d('未对账：未发起对账流程；对账中：发起对账流程但未结束；已对账：对账流程完成'),
      },
      {
        type: 'string',
        name: 'invoiceStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceApplicationStatus`)
          .d('发票申请状态'),
      },
      {
        type: 'string',
        name: 'paymentStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentPpplicationStatus`)
          .d('付款申请状态'),
        help: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.Tooltip.paymentStatusMeaning`)
          .d('该状态仅表示付款申请流程的状态，并不表示为实际支付'),
      },
      {
        type: 'string',
        name: 'collaborativeModeCode',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.collaborativeModeCode`)
          .d('协同模式'),
      },
      {
        type: 'string',
        name: 'ouName',
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ouName`).d('业务实体'),
      },
      {
        type: 'string',
        name: 'multiDealTrxNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxNum`)
          .d('三方交易关联事务来源编号'),
      },
      {
        type: 'string',
        name: 'multiDealPoNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoNum`)
          .d('三方交易关联订单编号'),
      },
      {
        type: 'string',
        name: 'multiDealTrxLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxLineNum`)
          .d('三方交易关联事务来源行'),
      },
      {
        type: 'string',
        name: 'multiDealPoLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoLineNum`)
          .d('三方交易关联订单行号'),
      },
      {
        type: 'string',
        name: 'ecBillNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.orBillNum`)
          .d('电商账单编号'),
      },
      {
        type: 'string',
        name: 'trxYear',
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxYear`).d('事务年度'),
      },
      {
        type: 'string',
        name: 'remark',
      },

      /**
       * 可对账
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrice`)
          .d('单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl.get(`hzero.common.view.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netAmount')
          .d('金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.taxCode').d('税码'),
        name: 'taxCode',
        type: 'string',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRate`).d('税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrice`)
          .d('单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxDate`)
          .d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      /**
       * 可开票
       */
      /**
       * 可付款
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedAmounts`)
          .d('已开票金额(含税)'),
        type: 'number',
        name: 'invoiceCompletedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentOccupiedAmount`)
          .d('已付款发起金额'),
        type: 'number',
        name: 'paymentOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ablePayAmount`)
          .d('可付款金额'),
        type: 'number',
        name: 'ablePayAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.asyncCreateStatusMeaning`)
          .d('处理状态'),
        type: 'string',
        name: 'asyncCreateStatusMeaning',
      },

      /**
       * 垃圾箱
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorType`)
          .d('导入失败类型'),
        type: 'string',
        name: 'errorTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorMsg`)
          .d('导入失败原因'),
        type: 'string',
        name: 'errorMsg',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceSource`)
          .d('取价来源'),
        type: 'string',
        name: 'priceSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceSourceMeaning`)
          .d('取价来源'),
        type: 'string',
        name: 'priceSourceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.libPrice`)
          .d('价格库价格'),
        type: 'number',
        name: 'libPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceAction`)
          .d('取价时点'),
        type: 'string',
        name: 'priceAction',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceActionMeaning`)
          .d('取价时点'),
        type: 'string',
        name: 'priceActionMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceTime`).d('取价时间'),
        type: 'dateTime',
        name: 'priceTime',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceNetPrice`)
          .d('数据源单价(不含税)'),
        type: 'number',
        name: 'sourceNetPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceTaxIncludedPrice`)
          .d('数据源单价(含税)'),
        type: 'number',
        name: 'sourceTaxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.libPriceFlag`)
          .d('是否本次已取价'),
        type: 'number',
        name: 'libPriceFlag',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceUnitPriceBatch`)
          .d('数据源每'),
        type: 'number',
        name: 'sourceUnitPriceBatch',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.libUnitPriceBatch`)
          .d('价格库每'),
        type: 'number',
        name: 'libUnitPriceBatch',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.takePriceStatusMeaning`)
          .d('取价状态'),
        type: 'string',
        name: 'takePriceStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierSiteCode`)
          .d('供应商地点'),
        type: 'string',
        name: 'sourceSupplierSiteCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierSiteCode`)
          .d('供应商地点'),
        type: 'string',
        name: 'supplierSiteCode',
      },
      {
        name: 'predictExpectPaymentDate',
        type: 'date',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDate')
          .d('预计期望付款日期'),
      },
      {
        name: 'predictExpectPaymentDateCalculateStatus',
        type: 'string',
        lookupCode: 'SSTA.PREDICT_EXPECT_PAYMENT_DATE.CALCULATE_STATUS',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateCalcStatus')
          .d('预计期望付款日期计算状态'),
      },
      {
        name: 'predictExpectPaymentDateTriggerAction',
        type: 'string',
        lookupCode: 'SSTA.PREDICT_EXPECT_PAYMENT_DATE.TRIGGER_ACTION',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateTriggerAction')
          .d('预计期望付款日期触发动作'),
      },
      {
        name: 'predictExpectPaymentDateCalculateTime',
        type: 'dateTime',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateCalcTime')
          .d('预计期望付款日期计算时间'),
      },
      {
        name: 'predictExpectPaymentDateCalculateErrorMsg',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateCalcErrorMsg')
          .d('预计期望付款日期计算错误信息'),
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { data, params, dataSet } = config;
        const type = dataSet.getQueryParameter('type') || (documentType === 'INVOICE' ? 'C' : 'D');
        const settleHeaderId = dataSet.getQueryParameter('settleHeaderId');
        const advanceInvFlag = dataSet.getQueryParameter('advanceInvFlag');
        let uxParams = {};
        if (['C', 'D'].includes(dataSet.getQueryParameter('type'))) {
          const uxFlag = findMenuName('srm.settle-account.jsd.ux-purchase');
          uxParams = uxFlag ? { invoiceWithPaymentFlag: 0, stepFlag: 1 } : {};
        }
        const partParams = ['C', 'D'].includes(dataSet.getQueryParameter('type')) ? uxParams : {};
        if (extraParams && isObject(extraParams)) {
          const { customizeFilterComparison = '' } = data;
          const extraParamNameList = Object.keys(extraParams).map((name) => `${name}:=`);
          Object.assign(data, {
            ...extraParams,
            customizeFilterComparison: customizeFilterComparison
              .split(',')
              .concat(extraParamNameList)
              .join(),
          });
        }
        let url = '';
        switch (type) {
          case 'A':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-all`
              : `/ssta/v1/settles/purchaser/page-all`;
            break;
          case 'B':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-bill-able`
              : `/ssta/v1/settles/purchaser/page-bill-able`;
            break;
          case 'C':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-invoice-able`
              : `/ssta/v1/settles/purchaser/page-invoice-able`;
            break;
          case 'D':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-payment-able`
              : `/ssta/v1/settles/purchaser/page-payment-able`;
            break;
          case 'E':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/ssta-settle-errors/purchaser/page-all`
              : `/ssta/v1/ssta-settle-errors/purchaser/page-all`;
            break;
          default:
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-all`
              : `/ssta/v1/settles/purchaser/page-all`;
            break;
        }
        const { companyId_range: companyIdRange } = data || {};
        const supplierObj = settleHeaderId ? {} : transformSupplierData(data.supplierCompanyId);
        return {
          url,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            type,
            ...partParams,
            customizeUnitCode:
              settleHeaderId || advanceInvFlag
                ? [addSettleLineSearchCode[type], addSettleLineTableCodes[type]].join()
                : [filterUnitCodes[type], tableUnitCodes[type]].join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...supplierObj,
            ...transformQselectDate(data, { dateRange: 'trxDate' }),
            companyIdsStr: companyIdRange,
          }),
        };
      },
      submit: ({ dataSet, data }) => {
        const type = dataSet.getQueryParameter('type') || (documentType === 'INVOICE' ? 'C' : 'D');
        const submitType = dataSet.getState('submitType');
        const docType = (documentType || '').toLowerCase();
        const invoiceWithPaymentFlag = dataSet.getQueryParameter('invoiceWithPaymentFlag');
        const settleHeaderId = dataSet.getQueryParameter('settleHeaderId');
        const stepFlag = dataSet.getQueryParameter('stepFlag');
        const advanceInvFlag = dataSet.getQueryParameter('advanceInvFlag');
        const { companyId_range: companyIdRange } =
          dataSet.queryDataSet?.current.get(['companyId_range']) || {};
        const companyIdsStr = companyIdRange;
        const supplierObj = settleHeaderId
          ? {}
          : transformSupplierData(dataSet.queryDataSet?.current.get('supplierCompanyId'));
        const createSelectedPartConfig = {
          method: 'POST',
          params: {
            customizeUnitCode: [filterUnitCodes[type], tableUnitCodes[type]].join(),
          },
          data: data.map((item) => ({ ...item, invoiceWithPaymentFlag, stepFlag })),
        };
        const addSettleLinePartConfig = {
          method: 'POST',
          data: data.map((item) => ({
            ...item,
            stepFlag,
            invoiceWithPaymentFlag,
            camp: 'PURCHASER',
          })),
          params: {
            customizeUnitCode: [
              addSettleLineSearchCode[type],
              addSettleLineTableCodes[type],
              headUnitCodes[documentType],
            ].join(),
          },
        };
        switch (submitType) {
          case 'createSelectedValidate':
            return {
              ...createSelectedPartConfig,
              url: `/ssta/v1/${organizationId}/settle-headers/purchaser/validate/payment`,
            };
          case 'createSelected':
            return {
              ...createSelectedPartConfig,
              url: `/ssta/v1/${organizationId}/settle-headers/purchaser/${docType}`,
            };
          case 'createAll': {
            const queryData = dataSet.queryDataSet.current.toData();
            return {
              url: `/ssta/v1/${organizationId}/settle-headers/purchaser/${docType}/batch`,
              method: 'GET',
              data: null,
              params: filterNullValueObject({
                stepFlag,
                invoiceWithPaymentFlag,
                ...queryData,
                ...transformQselectDate(queryData, { dateRange: 'trxDate' }),
                ...supplierObj,
                companyIdsStr,
                customizeUnitCode: [filterUnitCodes[type], tableUnitCodes[type]].join(),
              }),
            };
          }
          case 'addSettleLineValidate':
            return {
              ...addSettleLinePartConfig,
              url: `/ssta/v1/${organizationId}/settle-lines/validate/payment/${settleHeaderId}`,
            };
          case 'addSettleLine':
            return {
              ...addSettleLinePartConfig,
              url: `/ssta/v1/${organizationId}/settle-lines/${docType}/${settleHeaderId}`,
            };
          case 'createInvSelected':
            return {
              url: `/ssta/v1/${organizationId}/settle-headers/purchaser/invoice-before-settle`,
              method: 'POST',
              params: {
                customizeUnitCode: [
                  addSettleLineSearchCode[type],
                  addSettleLineTableCodes[type],
                ].join(),
              },
              data: {
                settleList: data,
                invoiceHeaderList: dataSet?.getState('invoiceHeaderList'),
              },
            };
          case 'createInvAll': {
            const queryData = dataSet.queryDataSet.current.toData();
            return {
              url: `/ssta/v1/${organizationId}/settle-headers/purchaser/${docType}/batch`,
              method: 'GET',
              data: {
                invoiceHeaderIds: dataSet.getState('invoiceHeaderIds'),
              },
              params: filterNullValueObject({
                stepFlag,
                invoiceWithPaymentFlag,
                ...queryData,
                ...transformQselectDate(queryData, { dateRange: 'trxDate' }),
                ...supplierObj,
                companyIdsStr,
                customizeUnitCode: [
                  addSettleLineSearchCode[type],
                  addSettleLineTableCodes[type],
                ].join(),
              }),
            };
          }
          case 'updateExpectedPayDate':
            return {
              url: `/ssta/v1/${organizationId}/payment-control-config/predict-expect-payment-date/async-update`,
              method: 'POST',
              params: null,
              data: {
                // 计算对象类型 —— 事务
                settleList: data.map((i) => ({ settleId: i.settleId })),
                calculateObjectType: 'SETTLE',
                predictExpectPaymentDateTriggerAction: 'MANUAL_UPDATE',
              },
            };
          case 'updateExpectedPayDateBatch': {
            const queryData = dataSet.queryDataSet.current.toData();
            return {
              url: `/ssta/v1/${organizationId}/payment-control-config/predict-expect-payment-date/settle/batch`,
              method: 'GET',
              data: null,
              params: filterNullValueObject({
                stepFlag,
                invoiceWithPaymentFlag,
                ...queryData,
                ...transformQselectDate(queryData, { dateRange: 'trxDate' }),
                ...supplierObj,
                companyIdsStr,
                calculateObjectType: 'SETTLE',
                predictExpectPaymentDateTriggerAction: 'MANUAL_UPDATE',
                customizeUnitCode:
                  settleHeaderId || advanceInvFlag
                    ? [addSettleLineSearchCode[type], addSettleLineTableCodes[type]].join()
                    : [filterUnitCodes[type], tableUnitCodes[type]].join(),
              }),
            };
          }
          case 'createSelectedSync': {
            const queryData = dataSet.queryDataSet.current.toData();
            return {
              url: `/ssta/v1/${organizationId}/settle-headers/purchaser/${docType}/batch`,
              method: 'POST',
              data: filterNullValueObject({
                stepFlag,
                invoiceWithPaymentFlag,
                ...queryData,
                ...transformQselectDate(queryData, { dateRange: 'trxDate' }),
                ...supplierObj,
                companyIdsStr,
                customizeUnitCode: [filterUnitCodes[type], tableUnitCodes[type]].join(),
                settleList: data,
              }),
            };
          }
          default:
        }
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};

const errorTableDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'settleErrorId',
    validateBeforeQuery: false,
    dataToJSON: 'selected',
    pageSize: 20,
    queryFields: [],
    fields: [
      {
        name: 'settleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum')
          .d('结算事务编号'),
      },
      {
        name: 'errorSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.errorSettleNum')
          .d('结算事务编号'),
      },
      {
        name: 'souceSettleAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.souceSettleAndLineNum')
          .d('结算事务来源编号-行号'),
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companyName`).d('公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationName`)
          .d('库存组织'),
        type: 'string',
        name: 'invOrganizationName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyName`)
          .d('供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`).d('币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.itemName`)
          .d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        type: 'number',
        name: 'quantity',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleableQuantity`)
          .d('可结算数量'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedAmounts`)
          .d('可对账金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        type: 'string',
        name: 'billStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billStatusMeaning`)
          .d('对账状态'),
      },
      {
        type: 'string',
        name: 'invoiceStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceStatusMeanings`)
          .d('开票状态'),
      },
      {
        type: 'string',
        name: 'paymentStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentStatusMeaning`)
          .d('付款状态'),
      },
      {
        type: 'string',
        name: 'multiDealTrxNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxNum`)
          .d('三方交易关联事务来源编号'),
      },
      {
        type: 'string',
        name: 'multiDealTrxLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxLineNum`)
          .d('三方交易关联事务来源行'),
      },
      {
        type: 'string',
        name: 'multiDealPoNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoNum`)
          .d('三方交易关联订单编号'),
      },
      {
        type: 'string',
        name: 'multiDealPoLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoLineNum`)
          .d('三方交易关联订单行号'),
      },
      {
        type: 'string',
        name: 'trxYear',
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxYear`).d('事务年度'),
      },
      {
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.pushedFlagSuccess`)
          .d('是否已重推成功'),
        name: 'pushedFlag',
      },

      /**
       * 可对账
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrice`)
          .d('单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netAmount')
          .d('金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRate`).d('税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrice`)
          .d('单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedsAmounts`)
          .d('可结算金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },

      /**
       * 可开票
       */

      /**
       * 可付款
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentOccupiedAmount`)
          .d('已付款发起金额'),
        type: 'number',
        name: 'paymentOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ablePayAmount`)
          .d('可付款金额'),
        type: 'number',
        name: 'ablePayAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },

      /**
       * 垃圾箱
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorType`)
          .d('导入失败类型'),
        type: 'string',
        name: 'errorTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorMsg`)
          .d('导入失败原因'),
        type: 'string',
        name: 'errorMsg',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierSiteCode`)
          .d('供应商地点'),
        type: 'string',
        name: 'sourceSupplierSiteCode',
      },

      // {
      //   label: intl
      //     .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.createdByName`)
      //     .d('退回人'),
      //   type: 'string',
      //   name: 'createdByName',
      // },
      // {
      //   label: intl
      //     .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.creationDate`)
      //     .d('退回时间'),
      //   type: 'string',
      //   name: 'creationDate',
      // },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { params, data } = config;
        const url = isTenantRoleLevel()
          ? `/ssta/v1/${organizationId}/ssta-settle-errors/purchaser/page-all`
          : `/ssta/v1/ssta-settle-errors/purchaser/page-all`;
        return {
          url,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            ...transformSupplierData(data?.supplierCompanyId),
            customizeUnitCode: [filterUnitCodes.E, tableUnitCodes.E].join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { dateRange: 'trxDate' }),
            ...transformSupplierData(data?.supplierCompanyId),
          }),
        };
      },
    },
  };
};

const queryDS = () => {
  return {
    fields: [
      {
        name: 'dataSource',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.dataSource')
          .d('数据来源'),
        lookupCode: 'SSTA.DATA_SOURCE',
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum')
          .d('结算事务编号'),
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.dateRange')
          .d('结算事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
      {
        name: 'trxDateFrom',
        type: 'date',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxDateFrom')
          .d('事务日期从'),
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: moment().subtract(6, 'month'),
        transformRequest: (value) => dateRender(value),
      },
      {
        name: 'trxDateTo',
        type: 'date',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxDateTo')
          .d('事务日期至'),
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: moment(),
        transformRequest: (value) => dateRender(value),
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyId')
          .d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },

      {
        name: 'supplierId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierNum',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.companyId').d('结算公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigNum')
          .d('结算策略'),
        lovCode: 'SSTA.SETTLE_CONFIG',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'settleConfigNum',
        bind: 'settleConfigNumLov.settleConfigNum',
      },
      {
        name: 'trxTypeCodeLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCode')
          .d('事务类型'),
        lovCode: 'SSTA.SETTLE_TRX_TYPE',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'trxTypeCode',
        bind: 'trxTypeCodeLov.trxTypeCode',
      },
      // {
      //   name: 'trxTypeName',
      //   bind: 'trxTypeCodeLov.trxTypeName',
      // },
    ],
  };
};

const invoiceDS = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settlementNumAndLines`)
          .d('结算单编号-行号'),
        type: 'string',
        name: 'documentNumAndLine',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.quantitys`).d('开票数量'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrices`)
          .d('开票单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netAmounts')
          .d('开票金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRates`).d('开票税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmounts`)
          .d('开票税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrices`)
          .d('开票单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxHavaMoney`)
          .d('开票金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordStatuss`)
          .d('开票状态'),
        type: 'string',
        name: 'recordStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordDates`)
          .d('开票日期'),
        type: 'date',
        name: 'recordDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordSources`)
          .d('开票来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companynames`)
          .d('执行公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanysNames`)
          .d('执行供应商'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.camp_range`)
          .d('创建方阵营'),
        type: 'string',
        name: 'campMeaning',
      },
      {
        label: intl.get(`ssta.common.model.common.processUser`).d('操作人'),
        type: 'string',
        name: 'createdUserName',
      },
      {
        label: intl.get(`ssta.common.model.common.processTime`).d('操作时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.processRemarks`)
          .d('操作备注'),
        type: 'string',
        name: 'remark',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.operation').d('操作'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleId, documentType },
          filter,
        } = dataSet;
        if (!settleId) return; // 无 settleId 的不执行查询
        const { recordSource = [], paymentType = [], recordStatus = [], ...rest } = filter;
        const paramsData = filterNullValueObject({
          recordSource: recordSource.join(','),
          recordStatus: recordStatus.join(','),
          paymentType: paymentType.join(','),
          ...rest,
          ...params,
        });
        const url = isTenantRoleLevel()
          ? `/ssta/v1/${organizationId}/settle-records/record/${settleId}/${documentType}`
          : `/ssta/v1/settle-records/record/${settleId}/${documentType}`;
        return {
          url,
          method: 'GET',
          params: paramsData,
        };
      },
    },
  };
};

const reconDS = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.status`).d('状态'),
        type: 'string',
        name: 'recordStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.statementNumAndLines`)
          .d('对账单编号-行号'),
        type: 'string',
        name: 'documentNumAndLine',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.reconciliationQuantity`)
          .d('对账数量'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billNetPrice`)
          .d('对账单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl.get(`hzero.common.view.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.billNetAmount')
          .d('对账金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxRate`)
          .d('对账税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxAmount`)
          .d('对账税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxIncludedsPrice`)
          .d('对账单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billNetAmount`)
          .d('对账金额(不含税)'),
        type: 'number',
        name: 'netAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxIncludedAmount`)
          .d('对账金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordDate`)
          .d('对账日期'),
        type: 'date',
        name: 'recordDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordSource`)
          .d('对账来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companyNamess`)
          .d('执行公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyNames`)
          .d('执行供应商'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.camp_range`)
          .d('创建方阵营'),
        type: 'string',
        name: 'campMeaning',
      },
      {
        label: intl.get(`ssta.common.model.common.processUser`).d('操作人'),
        type: 'string',
        name: 'createdUserName',
      },
      {
        label: intl.get(`ssta.common.model.common.processTime`).d('操作时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.processRemarks`)
          .d('操作备注'),
        type: 'string',
        name: 'remark',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.operation').d('操作'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleId, documentType },
          filter,
        } = dataSet;
        if (!settleId) return; // 无 settleId 的不执行查询
        const { recordSource = [], paymentType = [], recordStatus = [], ...rest } = filter;
        const paramsData = filterNullValueObject({
          recordSource: recordSource.join(','),
          recordStatus: recordStatus.join(','),
          paymentType: paymentType.join(','),
          ...rest,
          ...params,
        });
        const url = isTenantRoleLevel()
          ? `/ssta/v1/${organizationId}/settle-records/record/${settleId}/${documentType}`
          : `/ssta/v1/settle-records/record/${settleId}/${documentType}`;
        return {
          url,
          method: 'GET',
          params: paramsData,
        };
      },
    },
  };
};

const payDS = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.documentNumsAndLines`)
          .d('结算单编号'),
        type: 'string',
        name: 'documentNum',
      },
      // {
      //   label: intl
      //     .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.documentNumAndLines`)
      //     .d('结算单编号|行号'),
      //   type: 'string',
      //   name: 'documentNumAndLine',
      // },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentTypes`)
          .d('付款类型'),
        name: 'paymentTypeMeaning',
        help: intl
          .get(`ssta.common.model.settlePool.paymentTypesTips`)
          .d(
            '付款类型=付款：付款金额对应结算事务在付款申请中的实际付款金额；付款类型=预付款核销，预付款申请创建时不会回写结算池，待付款申请核销时回写，付款金额对应结算事务在付款申请中的预付款核销金额。点击付款申请结算单链接可查看付款明细信息、预付款核销明细信息'
          ),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentAmounts`)
          .d('付款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordPayStatus`)
          .d('付款状态'),
        name: 'recordStatusMeaning',
        type: 'string',
      },
      {
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.paysDate').d('付款日期'),
        name: 'recordDate',
        type: 'date',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paySources`)
          .d('付款来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companyNames`)
          .d('执行公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyNames`)
          .d('执行供应商'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.camp_range`)
          .d('创建方阵营'),
        type: 'string',
        name: 'campMeaning',
      },
      {
        label: intl.get(`ssta.common.model.common.processUser`).d('操作人'),
        type: 'string',
        name: 'createdUserName',
      },
      {
        label: intl.get(`ssta.common.model.common.processTime`).d('操作时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.processRemarks`)
          .d('操作备注'),
        type: 'string',
        name: 'remark',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.operation').d('操作'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleId, documentType },
          filter,
        } = dataSet;
        if (!settleId) return; // 无 settleId 的不执行查询
        const { recordSource = [], paymentType = [], recordStatus = [], ...rest } = filter;
        const paramsData = filterNullValueObject({
          recordSource: recordSource.join(','),
          recordStatus: recordStatus.join(','),
          paymentType: paymentType.join(','),
          ...rest,
          ...params,
        });
        const url = isTenantRoleLevel()
          ? `/ssta/v1/${organizationId}/settle-records/record/${settleId}/${documentType}`
          : `/ssta/v1/settle-records/record/${settleId}/${documentType}`;
        return {
          url,
          method: 'GET',
          params: paramsData,
        };
      },
    },
  };
};

const filterDS = () => {
  return {
    selection: false,
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        type: 'string',
        name: 'documentNum',
      },
      {
        name: 'recordStatus',
        type: 'string',
        lookupCode: 'SSTA.RECORD_STATUS',
      },
      {
        type: 'date',
        name: 'recordDateFrom',
      },
      {
        name: 'recordDateTo',
        type: 'date',
      },
      {
        name: 'recordSource',
        type: 'string',
        lookupCode: 'SSTA.RECORD_SOURCE',
      },
      {
        name: 'netWorth',
        type: 'string',
      },
      {
        name: 'paymentType',
        type: 'string',
        lookupCode: 'SSTA.PAYMENT_TYPE',
      },
    ],
  };
};

const detailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    queryParameter: { customizeUnitCode },
    fields: [
      /**
       * 交易方信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceCompanyNum`)
          .d('数据源公司编码'),
        type: 'string',
        name: 'sourceCompanyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceCompanyName`)
          .d('数据源公司名称'),
        type: 'string',
        name: 'sourceCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companyNum`)
          .d('结算公司编码'),
        type: 'string',
        name: 'companyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companysNames`)
          .d('结算公司名称'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierCompanyNum`)
          .d('数据源供应商编码'),
        type: 'string',
        name: 'sourceSupplierCompanyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierCompanyName`)
          .d('数据源供应商名称'),
        type: 'string',
        name: 'sourceSupplierCompanyName',
      },

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyNum`)
          .d('结算供应商编码'),
        type: 'string',
        name: 'supplierCompanyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyName1`)
          .d('结算供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierSiteCode1`)
          .d('数据源供应商地点'),
        type: 'string',
        name: 'sourceSupplierSiteCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierSiteCode1`)
          .d('结算供应商地点'),
        type: 'string',
        name: 'supplierSiteCode',
      },
      {
        label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
        type: 'string',
        name: 'unitName',
      },
      /**
       * 交易金额信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.itemCode`)
          .d('结算商品编码'),
        type: 'string',
        name: 'itemCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.itemName`)
          .d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        type: 'number',
        name: 'quantity',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleableQuantity`)
          .d('可结算数量'),
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrice`)
          .d('单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netAmount')
          .d('金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedAmount`)
          .d('金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrice`)
          .d('单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRate`).d('税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`)
          .d('结算币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.specificationsModel`)
          .d('规格型号'),
        type: 'string',
        name: 'specificationsModel',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.srmItemCode`)
          .d('srm物料编号'),
        type: 'string',
        name: 'srmItemCode',
      },
      {
        name: 'categoryName',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.categoryName`)
          .d('物料分类'),
      },
      {
        name: 'secondaryQuantity',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.secondaryQuantity`)
          .d('辅助数量'),
      },
      {
        name: 'secondaryUomCode',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.secondaryUom`)
          .d('辅助单位'),
      },
      /**
       * 交易事务信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.requestedByRealName`)
          .d('采购申请人姓名'),
        type: 'string',
        name: 'requestedByRealName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.prLineNum`)
          .d('采购申请单行编号'),
        type: 'string',
        name: 'prLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.prNum`)
          .d('采购申请单编号'),
        type: 'string',
        name: 'prNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum`)
          .d('结算事物编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorSettleNum`)
          .d('结算事物编号'),
        type: 'string',
        name: 'errorSettleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleNum`)
          .d('结算事务来源编号'),
        name: 'sourceSettleNum',
        type: 'string',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleLineNum')
          .d('结算事务来源行号'),
        name: 'sourceSettleLineNum',
        type: 'string',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.dataSource`)
          .d('数据来源'),
        type: 'string',
        name: 'dataSourceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxLineNums`)
          .d('srm事务编码-行号'),
        type: 'string',
        name: 'trxLineNums',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxDate`)
          .d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxYear`).d('事务年度'),
        type: 'string',
        name: 'trxYear',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.contractAndLineNum`)
          .d('协议编号-行号'),
        type: 'string',
        name: 'contractAndLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.poAndLineNum`)
          .d('采购订单编号-行号'),
        type: 'string',
        name: 'poAndLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.asnAndLineNum`)
          .d('送货单号-行号'),
        type: 'string',
        name: 'asnAndLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.poLineLocation`)
          .d('发运行'),
        type: 'string',
        name: 'poLineLocation',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.releaseNum`).d('发放号'),
        type: 'string',
        name: 'releaseNum',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.orderType`).d('订单类型'),
        type: 'string',
        name: 'orderType',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.purOrganizationId`)
          .d('采购组织'),
        type: 'string',
        name: 'purOrganizationName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationName`)
          .d('库存组织'),
        type: 'string',
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.inventoryName`).d('库房'),
        type: 'string',
        name: 'inventoryName',
      },
      {
        name: 'trxTypeCode',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCode`)
          .d('事务类型编码'),
      },
      {
        name: 'trxTypeCodeMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCodeMeaning`)
          .d('采购事务类型名称'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.createdByName`)
          .d('创建人'),
        type: 'string',
        name: 'createdByName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.creationDate`)
          .d('创建时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.businessTypeMeaning`)
          .d('业务类别'),
        type: 'string',
        name: 'businessTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.stockTypeMeaning`)
          .d('特殊库存'),
        type: 'string',
        name: 'stockTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformCodeMeaning`)
          .d('数据来源类型'),
        type: 'string',
        name: 'sourcePlatformCodeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.agentId`).d('采购员'),
        type: 'string',
        name: 'purchaseAgentName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceParentSettleAndLineNum`)
          .d('父事务处理编号｜行号'),
        type: 'string',
        name: 'sourceParentSettleAndLineNum',
      },

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.freightFlag`)
          .d('运费标识'),
        type: 'boolean',
        name: 'freightFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecPoNum`)
          .d('电商订单编号'),
        type: 'string',
        name: 'ecPoNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecPoSubNum`)
          .d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.deliverTime`)
          .d('妥投时间'),
        type: 'dateTime',
        name: 'deliverTime',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.deliverQuantity`)
          .d('妥投数量'),
        type: 'number',
        name: 'deliverQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecDeliverQuantity`)
          .d('配送数量'),
        type: 'number',
        name: 'ecDeliverQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceMethodMeaning`)
          .d('开票方式'),
        type: 'string',
        name: 'invoiceMethodMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceInformation`)
          .d('电商发票信息'),
        type: 'string',
        name: 'invoiceInfo',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.afterSalesStatusMeaning`)
          .d('电商售后状态'),
        type: 'string',
        name: 'afterSalesStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTypeMeaning`)
          .d('电商开票类型'),
        type: 'string',
        name: 'invoiceTypeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.costName`).d('成本中心'),
        type: 'string',
        name: 'costName',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ouName`).d('业务实体'),
        type: 'string',
        name: 'ouName',
      },
      {
        name: 'sinvLineAttachmentUuid',
        type: 'attachment',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleAttach`)
          .d('结算事务行附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.termCode`).d('付款条件'),
        type: 'string',
        name: 'termCode',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.supplierOrderTypeCode`).d('E卡标志'),
        type: 'string',
        name: 'supplierOrderTypeCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceInfo`)
          .d('电商发票信息'),
        type: 'string',
        name: 'invoiceInfo',
      },
      {
        type: 'string',
        name: 'multiDealTrxNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxNum`)
          .d('三方交易关联事务来源编号'),
      },
      {
        type: 'string',
        name: 'multiDealTrxLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxLineNum`)
          .d('三方交易关联事务来源行'),
      },
      {
        type: 'string',
        name: 'multiDealPoNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoNum`)
          .d('三方交易关联订单编号'),
      },
      {
        type: 'string',
        name: 'multiDealPoLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoLineNum`)
          .d('三方交易关联订单行号'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.pcSubjectLineNum`)
          .d('协议标的行号'),
        type: 'string',
        name: 'pcSubjectLineNum',
      },
      {
        name: 'poClosedFlagMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.poClosedFlag')
          .d('订单关闭标识'),
      },
      {
        label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
        type: 'string',
        name: 'unitName',
      },
      {
        label: intl.get(`ssta.common.model.common.poLineObjectVersionNumber`).d('订单行版本号'),
        type: 'string',
        name: 'poLineObjectVersionNumber',
      },
      {
        label: intl
          .get(`ssta.common.model.common.lineLocationObjectVersionNumber`)
          .d('订单发运行版本号'),
        type: 'string',
        name: 'lineLocationObjectVersionNumber',
      },
      {
        label: intl.get(`ssta.common.model.common.projectInformationTasks`).d('项目信息任务'),
        type: 'string',
        name: 'projectTaskMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.srmTrxCategory`)
          .d('SRM事务类别'),
        type: 'string',
        name: 'srmTrxCategory',
        lookupCode: 'SSTA.SRM_TRX_CATEGORY',
      },
      /**
       * 对账信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedQuantity`)
          .d('对账占用数量'),
        type: 'number',
        name: 'billOccupiedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedNetAmount`)
          .d('对账占用金额(不含税)'),
        type: 'number',
        name: 'billOccupiedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedTaxAmount`)
          .d('对账占用税额'),
        type: 'number',
        name: 'billOccupiedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedAmount`)
          .d('对账占用金额(含税)'),
        type: 'number',
        name: 'billOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedQuantity`)
          .d('对账完成数量'),
        type: 'number',
        name: 'billCompletedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedNetAmount`)
          .d('对账完成金额(不含税)'),
        type: 'number',
        name: 'billCompletedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedTaxAmount`)
          .d('对账完成税额'),
        type: 'number',
        name: 'billCompletedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedAmount`)
          .d('对账完成金额(含税)'),
        type: 'number',
        name: 'billCompletedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billRemoveFlag`)
          .d('对账暂挂'),
        type: 'boolean',
        name: 'billRemoveFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billLockQuantity`)
          .d('对账锁定标记'),
        type: 'string',
        name: 'billLockQuantity',
      },
      /**
       * 开票信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedQuantity`)
          .d('开票占用数量'),
        type: 'number',
        name: 'invoiceOccupiedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedNetAmount`)
          .d('开票占用金额(不含税)'),
        type: 'number',
        name: 'invoiceOccupiedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedTaxAmount`)
          .d('开票占用税额'),
        type: 'number',
        name: 'invoiceOccupiedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedAmount`)
          .d('开票占用金额(含税)'),
        type: 'number',
        name: 'invoiceOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedQuantity`)
          .d('开票完成数量'),
        type: 'number',
        name: 'invoiceCompletedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedNetAmount`)
          .d('开票完成金额(不含税)'),
        type: 'number',
        name: 'invoiceCompletedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedTaxAmount`)
          .d('开票完成税额'),
        type: 'number',
        name: 'invoiceCompletedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedAmount`)
          .d('开票完成金额(含税)'),
        type: 'number',
        name: 'invoiceCompletedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceRemoveFlag`)
          .d('开票暂挂'),
        type: 'boolean',
        name: 'invoiceRemoveFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceLockQuantity`)
          .d('开票锁定标记'),
        type: 'string',
        name: 'invoiceLockQuantity',
      },
      /**
       * 付款信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentOccupiedAmountMeaning`)
          .d('付款占用金额'),
        type: 'number',
        name: 'paymentOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentCompletedAmountMeaning`)
          .d('付款完成金额'),
        type: 'number',
        name: 'paymentCompletedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      // {
      //   label: intl
      //     .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedTaxAmount`)
      //     .d('开票占用税额'),
      //   type: 'string',
      //   name: 'invoiceOccupiedTaxAmount',
      // },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentRemoveFlag`)
          .d('付款暂挂'),
        type: 'boolean',
        name: 'paymentRemoveFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentLockQuantity`)
          .d('付款锁定标记'),
        type: 'string',
        name: 'paymentLockQuantity',
      },
      /**
       * 结算数据规则
       */

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigNum`)
          .d('结算策略编号'),
        type: 'string',
        name: 'settleConfigNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigName`)
          .d('结算策略名称'),
        type: 'string',
        name: 'settleConfigName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigVersionNumber`)
          .d('版本号'),
        type: 'string',
        name: 'versionNumber',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleBasePrice`)
          .d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMode`)
          .d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      /**
       * 对账单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompanyMeaning`)
          .d('对账公司'),
        type: 'string',
        name: 'billCompanyMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billSupplierMeaning`)
          .d('对账供应商'),
        type: 'string',
        name: 'billSupplierMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billPartMatchFlag`)
          .d('部分匹配'),
        type: 'boolean',
        name: 'billPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceAdjustFlag`)
          .d('单价调整'),
        type: 'boolean',
        name: 'priceAdjustFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billDependencyFlag`)
          .d('是否依赖'),
        type: 'boolean',
        name: 'billDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      /**
       * 结算单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleCompanyCodeMeaning`)
          .d('开票结算公司'),
        type: 'string',
        name: 'invoiceSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleCompanyCodeMeaning`)
          .d('付款结算公司'),
        type: 'string',
        name: 'paymentSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleSupplierCode`)
          .d('开票供应商'),
        type: 'string',
        name: 'invoiceSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleSupplierCode`)
          .d('付款供应商'),
        type: 'string',
        name: 'paymentSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePartMatchFlag`)
          .d('部分匹配-开票'),
        type: 'boolean',
        name: 'invoicePartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentPartMatchFlag`)
          .d('部分匹配-付款'),
        type: 'boolean',
        name: 'paymentPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePriceEditFlag`)
          .d('单价调整'),
        type: 'boolean',
        name: 'invoicePriceEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxRateEditFlag`)
          .d('税率调整'),
        type: 'boolean',
        name: 'invoiceTaxRateEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAmountEditFlag`)
          .d('税额调整'),
        type: 'boolean',
        name: 'invoiceTaxAmountEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'taxAmountAllowanceRange',
        type: 'number',
        range: ['taxAllowanceAmountLower', 'taxAllowanceAmountUpper'],
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAllowanceAmount`)
          .d('税额允差'),
      },
      {
        name: 'taxAllowanceAmountLower',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountLower',
      },
      {
        name: 'taxAllowanceAmountUpper',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountUpper',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceDependencyFlag`)
          .d('是否依赖-开票'),
        type: 'boolean',
        name: 'invoiceDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentDependencyFlag`)
          .d('是否依赖-付款'),
        type: 'boolean',
        name: 'paymentDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { dataSet } = config;
        const {
          queryParameter: { settleId, settleErrorId, type },
        } = dataSet;
        const url =
          type === 'B'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/detail-for-bill/${settleId}`
              : `/ssta/v1/settles/detail-detail-for-bill/${settleId}`
            : type === 'E'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/ssta-settle-errors/detail/${settleErrorId}`
              : `/ssta/v1/ssta-settle-errors/detail/${settleErrorId}`
            : isTenantRoleLevel()
            ? `/ssta/v1/${organizationId}/settles/detail/${settleId}`
            : `/ssta/v1/settles/detail/${settleId}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

const configDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    queryParameter: { customizeUnitCode },
    fields: [
      /**
       * 结算数据规则
       */

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigNum`)
          .d('结算策略编号'),
        type: 'string',
        name: 'settleConfigNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigName`)
          .d('结算策略名称'),
        type: 'string',
        name: 'settleConfigName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigVersionNumber`)
          .d('版本号'),
        type: 'string',
        name: 'versionNumber',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleBasePrice`)
          .d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMode`)
          .d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigVersionNumber1`)
          .d('数据规则版本号'),
        type: 'string',
        name: 'settleConfigVersionNumber',
      },
      /**
       * 对账单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompany`)
          .d('对账公司'),
        type: 'string',
        name: 'billCompanyMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billSupplier`)
          .d('对账供应商'),
        type: 'string',
        name: 'billSupplierMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billPartMatchFlag`)
          .d('部分匹配'),
        type: 'boolean',
        name: 'billPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceAdjustFlag`)
          .d('单价调整'),
        type: 'boolean',
        name: 'priceAdjustFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billDependencyFlag`)
          .d('是否依赖'),
        type: 'boolean',
        name: 'billDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      /**
       * 结算单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleCompanyCodeMeaning`)
          .d('开票结算公司'),
        type: 'string',
        name: 'invoiceSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleCompanyCodeMeaning`)
          .d('付款结算公司'),
        type: 'string',
        name: 'paymentSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleSupplierCode`)
          .d('开票供应商'),
        type: 'string',
        name: 'invoiceSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleSupplierCode`)
          .d('付款供应商'),
        type: 'string',
        name: 'paymentSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePartMatchFlag`)
          .d('部分匹配-开票'),
        type: 'boolean',
        name: 'invoicePartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentPartMatchFlag`)
          .d('部分匹配-付款'),
        type: 'boolean',
        name: 'paymentPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePriceEditFlag`)
          .d('单价调整-开票'),
        type: 'boolean',
        name: 'invoicePriceEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxRateEditFlag`)
          .d('税率调整-开票'),
        type: 'boolean',
        name: 'invoiceTaxRateEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAmountEditFlag`)
          .d('税额调整-开票'),
        type: 'boolean',
        name: 'invoiceTaxAmountEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'taxAmountAllowanceRange',
        type: 'number',
        range: ['taxAllowanceAmountLower', 'taxAllowanceAmountUpper'],
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAllowanceAmount`)
          .d('税额允差'),
      },
      {
        name: 'taxAllowanceAmountLower',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountLower',
      },
      {
        name: 'taxAllowanceAmountUpper',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountUpper',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceDependencyFlag`)
          .d('是否依赖-开票'),
        type: 'boolean',
        name: 'invoiceDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentDependencyFlag`)
          .d('是否依赖-付款'),
        type: 'boolean',
        name: 'paymentDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { dataSet } = config;
        const {
          queryParameter: { settleId, settleConfigNum, type, settleConfigId },
        } = dataSet;
        if (!settleConfigNum) {
          return;
        }
        const url =
          type === 'E'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settle-config/release-config/${settleConfigNum}`
              : // `/ssta/v1/${organizationId}/settle-config/detailBySettleConfigNum/${settleConfigNum}`
                `/ssta/v1//settle-config/detailBySettleConfigNum/${settleConfigNum}`
            : type === 'F'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settle-config/current-config-by-id/${settleConfigId}`
              : `/ssta/v1/settle-config/current-config-by-id/${settleConfigId}`
            : isTenantRoleLevel()
            ? `/ssta/v1/${organizationId}/settle-config/release-config/${settleConfigNum}`
            : `/ssta/v1/settles/detail/${settleId}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};
const recordDS = () => {
  return {
    selection: false,
    autoQuery: false,
    pageSize: 20,
    fields: [
      {
        label: intl
          .get(`ssta.supplySettlePool.model.supplySettlePool.documentNumAndLine`)
          .d('结算单编号-行号'),
        type: 'string',
        name: 'documentNumAndLine',
      },
      {
        label: intl
          .get(`ssta.supplySettlePool.model.supplySettlePool.sourceDocumentNumAndLine`)
          .d('开票单号'),
        type: 'string',
        name: 'sourceDocumentNumAndLine',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.paymentType`).d('付款类型'),
        name: 'paymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.paymentAmount`).d('付款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`hzero.common.view.recordStatuss`).d('付款状态'),
        name: 'recordStatusMeaning',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.recordDates').d('付款日期'),
        name: 'recordDate',
        type: 'date',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paySources`)
          .d('付款来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.companyNames`).d('执行公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.supplySettlePool.model.supplySettlePool.supplierCompanyNames`)
          .d('执行供应商'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销'),
        name: 'prePaymentWriteOff',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        const url = `/ssta/v1/${organizationId}/settle-sub-records`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

const lockQuantityDS = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'lockDocumentNum',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.lockDocumentNum`)
        .d('关联单据编号'),
    },
    {
      name: 'lockDocumentLineNum',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.lockDocumentLineNum`)
        .d('行号'),
    },
    {
      name: 'campMeaning',
      type: 'string',
      label: intl.get('ssta.supplySettlePool.model.supplySettlePool.campMeaning').d('创建方阵营'),
    },
    {
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.createdUserName`)
        .d('创建人'),
      type: 'string',
      name: 'createdUserName',
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `/ssta/v1/${organizationId}/lock-documents/${data.settleId}`,
      method: 'get',
    }),
  },
});

const suspendedDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'remark',
      type: 'string',
    },
  ],
});

const ecInvoiceLineDS = () => ({
  selection: false,
  fields: [
    {
      name: 'invoiceLineNum',
      type: 'string',
      label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceLineNum`).d('行号'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCode`).d('发票代码'),
    },
    {
      name: 'invoiceNumber',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceNumber`)
        .d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicingDate`)
        .d('开票日期'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmount`).d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netNotIncludeAmount`)
        .d('不含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncAmount`)
        .d('含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'invoiceSpeciesMeaning',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSpecies`)
        .d('发票种类'),
    },
    {
      name: 'invoiceUrl',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceUrl`)
        .d('电子发票地址'),
    },
  ],
  transport: {
    read: () => ({
      url: `/ssta/v1/${organizationId}/settles/get-settle-relation-tax-invoice`,
      method: 'GET',
      transformResponse: (data) => {
        let newData = {};
        try {
          newData = JSON.parse(data);
        } catch (err) {
          newData = {};
        }
        return newData.page;
      },
    }),
  },
});
const ecInvoiceFormDS = () => ({
  fields: [
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.company`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyId`)
        .d('供应商'),
    },
    {
      name: 'settleHeaderNum',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.documentNumsAndLines`)
        .d('结算单编号'),
    },
  ],
  transport: {
    read: () => ({
      url: `/ssta/v1/${organizationId}/settles/get-settle-relation-tax-invoice`,
      method: 'GET',
    }),
  },
});

const logisticBasicDS = (asnNum, ecPoSubNum) => ({
  autoQuery: true,
  queryParameter: {
    srmConsignmentCode: asnNum,
    ecConsignmentCode: ecPoSubNum,
  },
  fields: [
    {
      name: 'applicationNo',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.applicationNo`)
        .d('发票申请号'),
    },
    {
      name: 'logisticsCompany',
      type: 'string',
      label: intl
        .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.logisticsCompany`)
        .d('物流公司'),
    },
    {
      name: 'logisticsNo',
      type: 'string',
      label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.logisticsNo`).d('物流单号'),
    },
  ],
  transport: {
    read: () => ({
      url: `/smodr/v1/${organizationId}/invoices/consignment-info`,
      method: 'GET',
    }),
  },
});

const prePayWriteOffDS = (settleHeaderId, settleLineId) => {
  return {
    dataToJSON: 'all',
    selection: 'none',
    primaryKey: 'applyLineId',
    autoQuery: true,
    paging: false,
    pageSize: 0,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentTitle`)
          .d('预付款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentTitle`)
          .d('预付款结算单号｜行号'),
        type: 'string',
        name: 'preHeadAndLineLink',
        bind: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentRemainingAmount`)
          .d('预付款剩余核销金额'),
        type: 'number',
        name: 'prepaymentRemainingAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        required: true,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentAmount`)
          .d('预付款金额'),
        type: 'number',
        name: 'prepaymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentType`)
          .d('预付款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.associateNumd`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreatedBy`)
          .d('预付款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreationDates`)
          .d('预付款创建时间'),
        type: 'date',
        name: 'prepaymentCreationDate',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `/ssta/v1/${organizationId}/settle-apply-lines/${settleHeaderId}/${settleLineId}`,
          method: 'GET',
          params: {
            ...params,
            customizeUnitCode: 'SSTA.PURCHASE_POOL_RECORD.PEYPAYMENT_BOX',
          },
        };
      },
    },
  };
};

export {
  tableDS,
  invoiceDS,
  reconDS,
  payDS,
  filterDS,
  detailDS,
  queryDS,
  configDS,
  errorTableDS,
  recordDS,
  lockQuantityDS,
  suspendedDS,
  ecInvoiceLineDS,
  ecInvoiceFormDS,
  logisticBasicDS,
  prePayWriteOffDS,
};
