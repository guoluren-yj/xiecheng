import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const initDs = () => ({
  selection: false,
  pageSize: 20,
  autoQuery: true,
  fields: [
    {
      name: 'settlementCodeLine',
      type: 'string',
      label: intl.get('smodr.settle.model.settlementCodeLine').d('事务编码｜行号'),
    },
    {
      name: 'operation',
      label: intl.get('smodr.settle.model.operation').d('操作'),
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.sourceFromMeaning').d('来源类型'),
    },
    {
      name: 'sourceDocumentCode',
      type: 'string',
      label: intl.get('smodr.settle.model.sourceDocumentCode').d('来源单据编码'),
    },
    {
      name: 'sourceDocumentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.sourceDocumentTypeMeaning').d('来源单据类型'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.settle.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'ecConsignmentCode',
      type: 'string',
      label: intl.get('smodr.settle.model.ecConsignmentCode').d('电商子订单编码'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.settle.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.settle.model.skuName').d('商品名称'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.quantity').d('数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('smodr.settle.model.uomName').d('单位'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('smodr.settle.model.taxRate').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.settle.model.currencyName').d('币种'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.unitPriceMeaning').d('单价(含税)'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.entryAmountMeaning').d('行金额(含税)'),
    },
    {
      name: 'statementsStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsStatus').d('对账状态'),
    },
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceStatus').d('开票状态'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.purchaseCompanyName').d('采购方公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.supplierCompanyName').d('供应商公司'),
    },
    {
      name: 'settlementTime',
      type: 'string',
      label: intl.get('smodr.settle.model.settlementTime').d('事务生成时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/settlement-entrys`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.SETTLEMENT.DATA.POOL_V' },
      };
    },
  },
});

const stateDs = () => ({
  selection: false,
  pageSize: 20,
  autoQuery: true,
  fields: [
    {
      name: 'statementsStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsStatusMeaning').d('对账状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.settle.model.supplierStatement').d('操作'),
    },
    {
      name: 'statementsCode',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsCode').d('商城对账单编码'),
    },
    {
      name: 'ecStatementsCode',
      type: 'string',
      label: intl.get('smodr.settle.model.ecStatementsCode').d('电商对账单编码'),
    },
    {
      name: 'srmStatementsCode',
      type: 'string',
      label: intl.get('smodr.settle.model.srmStatementsCode').d('结算对账单编码'),
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.sourceFromMeaning').d('来源类型'),
    },
    {
      name: 'statementsTypeMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsTypeMeaning').d('账单出具方'),
    },
    {
      name: 'statementsNetAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsNetAmountMeaning').d('账单金额(不含税)'),
    },
    {
      name: 'statementsTaxAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsTaxAmountMeaning').d('账单税额'),
    },
    {
      name: 'statementsAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsAmountMeaning').d('账单金额(含税)'),
    },
    // {
    //   name: '1',
    //   type: 'string',
    //   label: intl.get('smodr.settle.model.supplierStatement').d('创建人'),
    // },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.purchaseCompanyName').d('采购方公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.supplierCompanyName').d('供应商公司'),
    },
    {
      name: 'statementsTime',
      // type: 'string',
      label: intl.get('smodr.settle.model.statementsTime').d('账单时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/statementss`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.SETTLEMENT.DATA.POOL' },
      };
    },
  },
});

const applyDs = () => ({
  selection: false,
  pageSize: 20,
  autoQuery: true,
  fields: [
    {
      name: 'requestStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceStatus').d('开票状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.settle.model.supplierStatement').d('操作'),
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.settle.model.applyInvoieNum').d('开票申请编码'),
    },
    {
      name: 'srmApplicationNo',
      type: 'string',
      label: intl.get('smodr.settle.model.settleApplyInvoieNum').d('结算开票申请编码'),
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.sourceFromMeaning').d('来源类型'),
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceTypeMeaning').d('发票类型'),
    },
    {
      name: 'invoiceStateMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceStatusType').d('开票方式'),
    },
    {
      name: 'requestAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.requestAmountMeaning').d('开票金额(含税)'),
    },
    {
      name: 'creationByName',
      type: 'string',
      label: intl.get('smodr.settle.model.creationByName').d('申请人'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.purchaseCompanyName').d('采购方公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.supplierCompanyName').d('供应商公司'),
    },
    {
      name: 'creationDate',
      label: intl.get('smodr.settle.model.applyTime').d('申请时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/invoice-requests`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.SETTLEMENT.INVOICE.REQUEST' },
      };
    },
  },
});

const invoiceDs = () => ({
  selection: false,
  pageSize: 20,
  autoQuery: true,
  fields: [
    {
      name: 'requestStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.requestStatusMeaning').d('发票状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.settle.model.supplierStatement').d('操作'),
    },
    {
      name: 'invoiceBatch',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceBatch').d('发票号码'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceCode').d('发票代码'),
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.settle.model.applicationNo').d('开票申请编码'),
    },
    {
      name: 'invoiceTitle',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceTitle').d('发票抬头'),
    },
    {
      name: 'invoiceTime',
      // type: 'string',
      label: intl.get('smodr.settle.model.invoiceTime').d('开票日期'),
    },
    {
      name: 'invoiceOrderNetAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceOrderNetAmountMeaning').d('发票总金额(不含税)'),
    },
    {
      name: 'invoiceTaxAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceTaxAmountMeaning').d('税额'),
    },
    {
      name: 'invoiceAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceAmountMeaning').d('发票总金额(含税)'),
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceTypeMeaning').d('发票类型'),
    },
    {
      type: 'string',
      name: 'invoiceContentCode',
      label: intl.get('smodr.settle.model.invoiceContentCode').d('开票内容'),
    },
    {
      type: 'string',
      name: 'invoiceFormatMeaning',
      label: intl.get('smodr.settle.model.invoiceFormatMeaning').d('发票材质'),
    },
    {
      type: 'string',
      name: 'invoiceStateMeaning',
      label: intl.get('smodr.settle.model.invoiceStateMeaning').d('开票方式'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.purchaseCompanyName').d('采购方公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.settle.model.supplierCompanyName').d('供应商公司'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/invoices`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.SETTLEMENT.INVOICE' },
      };
    },
  },
});

export { initDs, stateDs, applyDs, invoiceDs };
