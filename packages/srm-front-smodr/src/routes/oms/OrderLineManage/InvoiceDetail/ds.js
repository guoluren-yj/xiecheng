import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_SMODR = '/smodr';

const getCommonFields = () => [
  {
    name: 'skuName',
    label: intl.get('smodr.common.model.productName').d('商品名称'),
  },
  {
    name: 'quantity',
    label: intl.get('smodr.invoice.model.quantity').d('开票数量'),
    type: 'number',
  },
  {
    name: 'uomName',
    label: intl.get('smodr.common.model.uomName').d('单位'),
  },
  {
    name: 'taxRate',
    label: intl.get('smodr.common.model.taxRate').d('税率'),
    type: 'number',
  },
  {
    name: 'currencyName',
    label: intl.get('smodr.common.model.currencyName').d('币种'),
  },
  {
    name: 'unitPriceMeaning',
    label: intl.get('smodr.invoice.model.unitPriceMeaning').d('单价（含税）'),
  },
  {
    name: 'unitNakedPriceMeaning',
    label: intl.get('smodr.invoice.model.unitNakedPriceMeaning').d('单价（不含税）'),
  },
  {
    name: 'amountMeaning',
    label: intl.get('smodr.invoice.model.amountMeaning').d('行金额（含税）'),
  },
  {
    name: 'nakedAmountMeaning',
    label: intl.get('smodr.invoice.model.nakedAmountMeaning').d('行金额（不未税）'),
  },
  {
    name: 'per',
    type: 'number',
    label: intl.get('smodr.invoice.model.per').d('每'),
  },
];
// 基本信息
const baseInfoDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'requestNum',
        label: intl.get('smodr.invoice.model.invoiceNum').d('开票申请编码'),
      },
      {
        name: 'applicationNo',
        label: intl.get('smodr.common.model.outInvoiceCode').d('外部开票申请编码'),
      },
      {
        name: 'ecApplicationNo',
        label: intl.get('smodr.invoice.model.applicationNo').d('电商开票申请编码'),
      },
      {
        name: 'sourceFromMeaning',
        label: intl.get('smodr.invoice.model.sourceFromMeaning').d('来源类型'),
      },
      {
        name: 'requestStatusMeaning',
        label: intl.get('smodr.invoice.model.requestStatusMeaning').d('开票状态'),
      },
      {
        name: 'currencyName',
        label: intl.get('smodr.invoice.model.currencyName').d('币种'),
      },
      {
        name: 'requestAmountMeaning',
        label: intl.get('smodr.invoice.model.requestAmountMeaning').d('发票金额（含税）'),
      },
      {
        name: 'purchaseCompanyName',
        label: intl.get('smodr.invoice.model.purchaseCompanyName').d('采购方'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('smodr.invoice.model.supplierCompanyName').d('供应商'),
      },
      {
        name: 'creationByName',
        label: intl.get('smodr.invoice.model.creationByName').d('申请人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('smodr.invoice.model.creationDate').d('申请时间'),
      },
      {
        name: 'lastUpdateDate',
        type: 'dateTime',
        label: intl.get('smodr.invoice.model.lastUpdateDate').d('更新时间'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMODR}/v1/${organizationId}/invoice-requests/detail`,
        method: 'GET',
      },
    },
  };
};

const invoiceSkuDS = () => {
  return {
    pageSize: 20,
    selection: false,
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'skuCode',
        label: intl.get('smodr.common.model.productNum').d('商品编码'),
      },
      ...getCommonFields(),
    ],
    transport: {
      read: {
        url: `${SRM_SMODR}/v1/${organizationId}/invoice-requests/product-page`,
        method: 'GET',
      },
    },
  };
};

const invoiceAddFreightDS = () => {
  return {
    pageSize: 20,
    selection: false,
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'extraCostTypeMeaning',
        label: intl.get('smodr.invoice.model.extraCostTypeMeaning').d('附加费种类'),
      },
      ...getCommonFields(),
    ],
    transport: {
      read: {
        url: `${SRM_SMODR}/v1/${organizationId}/invoice-requests/freight-page`,
        method: 'GET',
      },
    },
  };
};

const invoiceDS = () => {
  return {
    pageSize: 20,
    selection: false,
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'validityStatusMeaning',
        label: intl.get('smodr.invoice.model.invoiceStatusMeaning').d('发票状态'),
      },
      {
        name: 'invoiceBatch',
        label: intl.get('smodr.invoice.model.invoiceBatch').d('发票号码'),
      },
      {
        name: 'invoiceCode',
        label: intl.get('smodr.invoice.model.invoiceCode').d('发票代码'),
      },
      {
        name: 'invoiceTime',
        type: 'dateTime',
        label: intl.get('smodr.invoice.model.invoiceTime').d('开票日期'),
      },
      {
        name: 'invoiceOrderNetAmount',
        label: intl.get('smodr.invoice.model.invoiceOrderNetAmount').d('金额（不含税）'),
      },
      {
        name: 'invoiceTaxAmount',
        label: intl.get('smodr.invoice.model.invoiceTaxAmount').d('税额'),
      },
      {
        name: 'invoiceAmountMeaning',
        label: intl.get('smodr.invoice.model.invoiceAmountMeaning').d('金额含税'),
      },
      {
        name: 'invoiceTypeMeaning',
        label: intl.get('smodr.invoice.model.invoiceTypeMeaning').d('发票类型'),
      },
      {
        name: 'invoiceStateMeaning',
        label: intl.get('smodr.invoice.model.invoiceStateMeaning').d('开票方式'),
      },
      {
        name: 'invoiceTitle',
        label: intl.get('smodr.invoice.model.invoiceTitle').d('发票抬头'),
      },
      {
        name: 'invoiceContentCode',
        label: intl.get('smodr.invoice.model.invoiceContentCode').d('发票内容'),
      },
      {
        name: 'regCode',
        label: intl.get('smodr.invoice.model.regCode').d('纳税人识别号'),
      },
      {
        name: 'depositBank',
        label: intl.get('smodr.invoice.model.depositBank').d('开户银行'),
      },
      {
        name: 'bankAccountNum',
        label: intl.get('smodr.invoice.model.bankAccountNum').d('银行账户'),
      },
      {
        name: 'contactAddress',
        label: intl.get('smodr.invoice.model.contactAddress').d('联系地址'),
      },
      {
        name: 'contactNumber',
        label: intl.get('smodr.invoice.model.contactNumber').d('联系电话'),
      },
      {
        name: 'originalInvoiceId',
        label: intl.get('smodr.invoice.model.originalInvoiceId').d('原蓝票号码'),
      },
      {
        name: 'originalInvoiceCode',
        label: intl.get('smodr.invoice.model.originalInvoiceCode').d('原蓝票代码'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMODR}/v1/${organizationId}/invoices`,
        method: 'GET',
      },
    },
  };
};

export {
  baseInfoDS,
  invoiceSkuDS,
  invoiceAddFreightDS,
  invoiceDS,
};
