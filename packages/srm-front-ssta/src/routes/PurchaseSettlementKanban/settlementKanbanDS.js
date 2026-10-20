import { getCurrentOrganizationId } from 'utils/utils';
import { getDatas, transformSupplierData } from '@/utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();
const prefix = 'ssta.purchaseSettlementKanban.model.purchaseSettlementKanban';
export const tableDs = () => {
  return {
    // autoCreate: true,
    autoQuery: true,
    selection: 'multiple',
    cacheSelection: false,
    primaryKey: 'settleId',
    fields: [
      {
        name: 'dimensionMeaning',
        type: 'string',
        label: intl.get(`${prefix}.dimension`).d('维度'),
      },
      {
        name: 'documentNum',
        type: 'string',
        label: intl.get(`${prefix}.documentNum`).d('关联单据编号'),
      },
      {
        name: 'documentLineNum',
        type: 'string',
        label: intl.get(`${prefix}.documentLineNum`).d('关联单据行号'),
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl.get(`${prefix}.netAmount`).d('关联单据不含税金额'),
      },
      {
        name: 'taxAmount',
        type: 'string',
        label: intl.get(`${prefix}.taxAmount`).d('关联单据税额'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'string',
        label: intl.get(`${prefix}.taxIncludedAmount`).d('关联单据含税金额'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`${prefix}.companyName`).d('公司'),
      },
      {
        name: 'displaySupplierName',
        type: 'string',
        label: intl.get(`${prefix}.displaySupplierName`).d('供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get(`${prefix}.currencyCode`).d('币种'),
      },
      {
        name: 'billOccupiedNetAmount',
        type: 'string',
        label: intl.get(`${prefix}.billOccupiedNetAmount`).d('对账发起不含税金额'),
      },
      {
        name: 'billOccupiedTaxAmount',
        type: 'string',
        label: intl.get(`${prefix}.billOccupiedTaxAmount`).d('对账发起税额'),
      },
      {
        name: 'billOccupiedAmount',
        type: 'string',
        label: intl.get(`${prefix}.billOccupiedAmount`).d('对账发起含税金额'),
      },
      {
        name: 'billCompletedNetAmount',
        type: 'string',
        label: intl.get(`${prefix}.billCompletedNetAmount`).d('对账完成不含税金额'),
      },
      {
        name: 'billCompletedTaxAmount',
        type: 'string',
        label: intl.get(`${prefix}.billCompletedTaxAmount`).d('对账完成税额'),
      },
      {
        name: 'billCompletedAmount',
        type: 'string',
        label: intl.get(`${prefix}.billCompletedAmount`).d('对账完成含税金额'),
      },
      {
        name: 'invoiceOccupiedNetAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceOccupiedNetAmount`).d('开票发起不含税金额'),
      },
      {
        name: 'invoiceOccupiedTaxAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceOccupiedTaxAmounts`).d('开票发起税额'),
      },
      {
        name: 'invoiceOccupiedAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceOccupiedAmounts`).d('开票发起含税金额'),
      },
      {
        name: 'invoiceCompletedNetAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceCompletedNetAmount`).d('开票完成不含税金额'),
      },
      {
        name: 'invoiceCompletedTaxAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceCompletedTaxAmount`).d('开票完成税额'),
      },
      {
        name: 'invoiceCompletedAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceCompletedAmount`).d('开票完成含税金额'),
      },
      {
        name: 'paymentOccupiedAmount',
        type: 'string',
        label: intl.get(`${prefix}.paymentOccupiedAmount`).d('付款发起金额'),
      },
      {
        name: 'paymentCompletedAmount',
        type: 'string',
        label: intl.get(`${prefix}.paymentCompletedAmount`).d('付款完成金额'),
      },
      {
        name: 'applyOccupiedAmount',
        type: 'string',
        label: intl.get(`${prefix}.applyOccupiedAmount`).d('预付款核销发起金额'),
      },
      {
        name: 'applyCompletedAmount',
        type: 'string',
        label: intl.get(`${prefix}.applyCompletedAmount`).d('预付款核销完成金额'),
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: 'string',
        label: intl.get(`${prefix}.prepaymentOccupiedAmount`).d('预付款发起金额'),
      },
      {
        name: 'prepaymentCompletedAmount',
        type: 'string',
        label: intl.get(`${prefix}.prepaymentCompletedAmounts`).d('预付款完成金额'),
        width: 200,
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
      },
    ],
    transport: {
      read: ({ data, dataSet: { reParams } }) => {
        const queryParams = getDatas({ ...data });
        const { supplierCompanyId } = queryParams || {};
        return {
          url: `/ssta/v1/${organizationId}/settle-report/purchaser/report-page?customizeUnitCode=SSTA.PURCHASE_SETTLEMENT_KANBAN.SEARCH_BAR,SSTA.PURCHASE_SETTLEMENT_KANBAN.LIST_GRID`,
          method: 'GET',
          data: { ...queryParams, ...reParams, ...transformSupplierData(supplierCompanyId) },
        };
      },
    },
  };
};

// 对账
export const reconDs = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'documentAndLineNum',
        type: 'string',
        label: intl.get(`${prefix}.reconDocumentAndLineNums`).d('对账单编号|行号'),
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get(`${prefix}.settleNum`).d('结算事务编号'),
      },
      {
        name: 'quantity',
        type: 'string',
        label: intl.get(`${prefix}.quantity`).d('对账数量'),
      },
      {
        name: 'netPrice',
        type: 'string',
        label: intl.get(`${prefix}.netPrice`).d('对账不含税单价'),
      },
      {
        name: 'unitPriceBatch',
        type: 'string',
        label: intl.get(`${prefix}.unitPriceBatch`).d('每'),
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl.get(`${prefix}.reconNetAmount`).d('对账不含税金额'),
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`${prefix}.taxRate`).d('对账税率'),
      },
      {
        name: 'taxAmount',
        type: 'string',
        label: intl.get(`${prefix}.reconTaxAmount`).d('对账税额'),
      },
      {
        name: 'taxIncludedPrice',
        type: 'string',
        label: intl.get(`${prefix}.taxIncludedPrice`).d('对账含税单价'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'string',
        label: intl.get(`${prefix}.reconTaxIncludedAmount`).d('对账含税金额'),
      },
      {
        name: 'recordStatusMeaning',
        type: 'string',
        label: intl.get(`${prefix}.recordStatus`).d('对账状态'),
      },
      {
        name: 'recordDate',
        type: 'string',
        label: intl.get(`${prefix}.recordDate`).d('对账日期'),
      },
      {
        name: 'recordSource',
        type: 'string',
        label: intl.get(`${prefix}.recordSource`).d('对账来源'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`${prefix}.companyNames`).d('执行公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get(`${prefix}.supplierCompanyName`).d('执行供应商'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/settle-report/purchaser/bill/report-page`,
          method: 'GET',
          data: { ...data.val },
        };
      },
    },
  };
};

// 开票
export const invoiceDs = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'documentAndLineNum',
        type: 'string',
        label: intl.get(`${prefix}.invoiceDocumentAndLineNums`).d('结算单编号|行号'),
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get(`${prefix}.settleNum`).d('结算事务编号'),
      },
      {
        name: 'quantity',
        type: 'string',
        label: intl.get(`${prefix}.invoiceQuantity`).d('开票数量'),
      },
      {
        name: 'netPrice',
        type: 'string',
        label: intl.get(`${prefix}.invoiceNetPrice`).d('开票不含税单价'),
      },
      {
        name: 'unitPriceBatch',
        type: 'string',
        label: intl.get(`${prefix}.unitPriceBatch`).d('每'),
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceNetAmount`).d('开票不含税金额'),
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`${prefix}.invoiceTaxRate`).d('开票税率'),
      },
      {
        name: 'taxAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceTaxAmount`).d('开票税额'),
      },
      {
        name: 'taxIncludedPrice',
        type: 'string',
        label: intl.get(`${prefix}.invoiceTaxIncludedPrice`).d('开票含税单价'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'string',
        label: intl.get(`${prefix}.invoiceTaxIncludedAmount`).d('开票含税金额'),
      },
      {
        name: 'recordStatusMeaning',
        type: 'string',
        label: intl.get(`${prefix}.invoiceRecordStatus`).d('开票状态'),
      },
      {
        name: 'recordDate',
        type: 'string',
        label: intl.get(`${prefix}.invoiceRecordDate`).d('开票日期'),
      },
      {
        name: 'recordSource',
        type: 'string',
        label: intl.get(`${prefix}.invoiceRecordSource`).d('开票来源'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`${prefix}.companyNames`).d('执行公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get(`${prefix}.supplierCompanyName`).d('执行供应商'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/settle-report/purchaser/invoice/report-page`,
          method: 'GET',
          data: { ...data.val },
        };
      },
    },
  };
};
// 付款
export const payDs = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'documentNum',
        type: 'string',
        label: intl.get(`${prefix}.payDocumentAndLineNums`).d('结算单编号'),
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get(`${prefix}.settleNum`).d('结算事务编号'),
      },
      {
        name: 'paymentTypeMeaning',
        type: 'string',
        label: intl.get(`${prefix}.paymentType`).d('付款类型'),
      },
      {
        name: 'paymentAmount',
        type: 'string',
        label: intl.get(`${prefix}.paymentAmount`).d('付款金额'),
      },
      {
        name: 'recordStatusMeaning',
        type: 'string',
        label: intl.get(`${prefix}.payRecordStatus`).d('付款状态'),
      },
      {
        name: 'recordDate',
        type: 'string',
        label: intl.get(`${prefix}.payRecordDate`).d('付款日期'),
      },
      {
        name: 'recordSource',
        type: 'string',
        label: intl.get(`${prefix}.payRecordSource`).d('付款来源'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`${prefix}.companyNames`).d('执行公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get(`${prefix}.supplierCompanyName`).d('执行供应商'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/settle-report/purchaser/payment/report-page`,
          method: 'GET',
          data: { ...data.val },
        };
      },
    },
  };
};

// 预付款
export const prepaymentDs = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'documentAndLineNum',
        type: 'string',
        label: intl.get(`${prefix}.prepaymenDocumentAndLineNums`).d('预付款结算单编号|行号'),
      },
      {
        name: 'prepaymentAmount',
        type: 'string',
        label: intl.get(`${prefix}.prepaymentAmount`).d('预付款行金额'),
      },
      {
        name: 'documentStatusMeaning',
        type: 'string',
        label: intl.get(`${prefix}.documentStatusMeaning`).d('单据状态'),
      },
      {
        name: 'associateNum',
        type: 'string',
        label: intl.get(`${prefix}.associateNum`).d('关联单据号'),
      },
      {
        name: 'associateAmount',
        type: 'string',
        label: intl.get(`${prefix}.associateAmount`).d('关联单据金额'),
      },
      {
        name: 'prepaymentApplyAmount',
        type: 'string',
        label: intl.get(`${prefix}.prepaymentApplyAmount`).d('已核销金额'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/settle-report/purchaser/prepayment/report-page`,
          method: 'GET',
          data: { ...data.val },
        };
      },
    },
  };
};
