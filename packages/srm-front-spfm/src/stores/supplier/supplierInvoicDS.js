/**
 * 供应商缴费记录 - dataSet
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-01-06
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config.js';

const organizationId = getCurrentOrganizationId();

/**
 * 缴费记录 采购方视角
 * @returns
 */
const BuyerRecordListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  selection: 'multiple',
  primaryKey: 'supplierPaymentId',
  fields: [
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentNumber`).d('缴费编号'),
      name: 'paymentNo',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.customerCode`).d('客户编码'),
      name: 'supplierTenantCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.customerName`).d('客户名称'),
      name: 'supplierTenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.payUser`).d('缴费用户'),
      name: 'payUser',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentAmount`).d('缴费金额'),
      name: 'paymentFee',
      type: 'number',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentDate`).d('缴费时间'),
      name: 'paymentDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.startDate`).d('有效期从'),
      name: 'startDate',
      type: 'date',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.endDate`).d('有效期至'),
      name: 'endDate',
      type: 'date',
    },
  ],
  events: {},
});

/**
 *  缴费记录 供应商视角
 * @returns
 */
const SupplierInvoicListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment-list?allPaymentFlag=true`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  selection: 'multiple',
  primaryKey: 'supplierPaymentId',
  fields: [
    {
      label: intl.get(`spfm.supplierInvoic.model.payStatus`).d('支付状态'),
      name: 'payStatus',
      type: 'string',
      lookupCode: 'AMKT.SUPPLIER_PAY_STATUS',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentObjectCode`).d('缴费对象编码'),
      name: 'coreTenantCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentObjectName`).d('缴费对象名称'),
      name: 'coreTenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.invoicingStatus`).d('开票状态'),
      name: 'ticketState',
      type: 'string',
      lookupCode: 'SPFM.TICKET_STATUS',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentNumber`).d('缴费编号'),
      name: 'paymentNo',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.customerCode`).d('客户编码'),
      name: 'supplierTenantCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.customerName`).d('客户名称'),
      name: 'supplierTenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.payUser`).d('缴费用户'),
      name: 'payUser',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentAmount`).d('缴费金额'),
      name: 'paymentFee',
      type: 'number',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentDate`).d('缴费时间'),
      name: 'paymentDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.startDate`).d('有效期从'),
      name: 'startDate',
      type: 'date',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.endDate`).d('有效期至'),
      name: 'endDate',
      type: 'date',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 发票信息DS
 * @returns
 */
const InvoiceInfoDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/invoice/${data.supplierInvoiceId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/invoice/save`,
        data,
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/invoice/save`,
        data,
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/invoice/save`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierInvoiceId',
  fields: [
    {
      label: intl.get(`spfm.supplierInvoic.model.invoiceTypeStr`).d('发票类型'),
      name: 'invoiceTypeMeaning',
      type: 'string',
      required: true,
      // lookupCode: 'SPFM.ASYNC_AMKT_INVOICE_TYPE_LIST',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.invoiceCode`).d('发票代码'),
      name: 'invoiceCode',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('invoiceType') === 'VAT';
        },
      },
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.invoiceNumber`).d('发票号码'),
      name: 'invoiceNo',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.taxRate`).d('税率'),
      name: 'taxRateMeaning',
      type: 'string',
      // lookupCode: 'SPFM.ASYNC_AMKT_TAX_RATE_LIST',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.taxAmount`).d('税额'),
      name: 'taxFee',
      type: 'number',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.excludingTaxAmount`).d('不含税金额'),
      name: 'feeNoTax',
      type: 'number',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.totalAmount`).d('价税合计'),
      name: 'feeIncludeTax',
      type: 'number',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.ticketFlag`).d('是否出票'),
      name: 'ticketFlag',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.courierCompany`).d('快递公司'),
      name: 'expressCompanyMeaning',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('invoiceType') === 'VAT';
        },
      },
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.trackingNumber`).d('快递单号'),
      name: 'expressNum',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('invoiceType') === 'VAT';
        },
      },
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.handler`).d('处理人'),
      name: 'handleUserName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.handleTime`).d('处理时间'),
      name: 'submitDate',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.invoicingDate`).d('开票日期'),
      name: 'invoiceDate',
      type: 'date',
      required: true,
    },
    {
      name: 'attachmentUuid',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 开票信息DS
 * @returns
 */
const BillingInfoDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/ticket-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/ticket/save`,
        data,
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/ticket/save`,
        data,
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/ticket/save`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierTicketId',
  autoCreate: true,
  fields: [
    {
      label: intl.get(`spfm.supplierInvoic.model.invoiceType`).d('发票种类'),
      name: 'invoiceType',
      type: 'string',
      // lookupCode: 'SPFM.AMKT_INVOICE_TYPE',
      lookupUrl: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/queryAmktLov?lovCode=AMKT.INVOICE_TYPE`,
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.invoiceTitle`).d('发票抬头'),
      name: 'invoiceTitle',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.taxRegistNumber`).d('税务登记号'),
      name: 'taxNo',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.accountBank`).d('开户行'),
      name: 'bankName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.bankAccountNumber`).d('开户行账号'),
      name: 'bankAccount',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.taxRegisAddress`).d('税务登记地址'),
      name: 'taxAddress',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.taxRegisPhone`).d('税务登记电话'),
      name: 'taxPhone',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.recipient`).d('收票人'),
      name: 'invoicePerson',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.recipientEmail`).d('收票人邮箱'),
      name: 'invoiceEmaill',
      type: 'email',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.recipientPhone`).d('收票人手机号'),
      name: 'invoicePhone',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.recipientAddress`).d('收票人地址'),
      name: 'invoiceAddress',
      type: 'string',
      required: true,
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 历史记录弹窗
 * @returns
 */
const HistoryRecordDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierTicketId',
  fields: [
    {
      label: intl.get(`spfm.supplierInvoic.model.invoicingStatus`).d('开票状态'),
      name: 'ticketState',
      type: 'string',
      lookupCode: 'SPFM.TICKET_STATUS',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentNumber`).d('缴费编号'),
      name: 'paymentNo',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentAmount`).d('缴费金额'),
      name: 'paymentFee',
      type: 'number',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.paymentDate`).d('缴费时间'),
      name: 'paymentDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.startDate`).d('有效期从'),
      name: 'startDate',
      type: 'date',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.endDate`).d('有效期至'),
      name: 'endDate',
      type: 'date',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 缴费账单弹窗
 * @returns
 */
const BillPaymentDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment/renew-payment`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierTicketId',
  fields: [
    {
      label: intl.get(`spfm.supplierInvoic.model.enterpriseCode`).d('核企编码'),
      name: 'coreTenantCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.enterpriseName`).d('核企名称'),
      name: 'coreTenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.amount`).d('年订阅费金额'),
      name: 'paymentFee',
      // type: 'number',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.supplierName`).d('供应商名称'),
      name: 'supplierTenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.activePeriod`).d('有效期'),
      name: 'activePeriod',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

export {
  BuyerRecordListDS,
  SupplierInvoicListDS,
  InvoiceInfoDS,
  BillingInfoDS,
  HistoryRecordDS,
  BillPaymentDS,
};
