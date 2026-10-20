import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const allDs = () => ({
  // autoQuery: true,
  primaryKey: 'orderId',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
    },
    // {
    //   name: 'orderTypeCodeMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.payment.model.orderTypeCodeMeaning').d('订单类型'),
    // },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
    },
    {
      name: 'orderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'paymentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentMethods').d('支付方式'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.payment.model.currencyCode').d('币种'),
    },
    {
      name: 'paymentAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.payAmount').d('支付金额'),
    },
    {
      name: 'paymentStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentStatusMeaning').d('支付状态'),
    },
    {
      name: 'refundedAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundAmount').d('退款金额'),
    },
    {
      name: 'refundingAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundingAmount').d('退款中金额'),
    },
    {
      name: 'notRefundAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.notRefundAmount').d('待退款金额'),
    },
    {
      name: 'buyerDate',
      type: 'dateTime',
      label: intl.get('smodr.payment.model.buyerDate').d('下单时间'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.payment.model.buyerName').d('下单人'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.payment.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.frightLine.model.newSupplierCompany').d('供应商'),
    },
    {
      name: 'action',
      label: intl.get('smodr.payment.model.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...params } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/payments/payment-order`,
        method: 'GET',
        data: {
          ...params,
          ...queryParams,
          paymentTypeCodeArr: 'COMPANY_PAYMENT,PERSONAL_PAYMENT',
          customizeUnitCode: 'SMODR.PAYMENT.QUERY',
        },
      };
    },
  },
});

const payDs = () => ({
  // autoQuery: true,
  primaryKey: 'orderId',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'paymentStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentStatusMeaning').d('支付状态'),
    },
    {
      name: 'action',
      label: intl.get('smodr.payment.model.action').d('操作'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'orderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'paymentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentMethods').d('支付方式'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.payment.model.currencyCode').d('币种'),
    },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
    },
    {
      name: 'paymentAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.payAmount').d('支付金额'),
    },
    {
      name: 'buyerDate',
      type: 'dateTime',
      label: intl.get('smodr.payment.model.buyerDate').d('下单时间'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.payment.model.buyerName').d('下单人'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.payment.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.frightLine.model.newSupplierCompany').d('供应商'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...params } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/payments/to-payment-order`,
        method: 'GET',
        data: {
          ...params,
          ...queryParams,
          paymentTypeCodeArr: 'COMPANY_PAYMENT,PERSONAL_PAYMENT',
          customizeUnitCode: 'SMODR.PAYMENT.PAYMENT-QUERY',
        },
      };
    },
  },
});

const refundDs = () => ({
  // autoQuery: true,
  primaryKey: 'orderId',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'action',
      label: intl.get('smodr.payment.model.action').d('操作'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
    },
    {
      name: 'orderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'paymentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentMethods').d('支付方式'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.payment.model.currencyCode').d('币种'),
    },
    {
      name: 'refundedAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundAmount').d('退款金额'),
    },
    {
      name: 'refundingAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundingAmount').d('退款中金额'),
    },
    {
      name: 'notRefundAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.notRefundAmount').d('待退款金额'),
    },
    {
      name: 'buyerDate',
      type: 'dateTime',
      label: intl.get('smodr.payment.model.buyerDate').d('下单时间'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.payment.model.buyerName').d('下单人'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.payment.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.frightLine.model.newSupplierCompany').d('供应商'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...params } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/refunds/to-refund-order`,
        method: 'GET',
        data: {
          ...params,
          ...queryParams,
          paymentTypeCodeArr: 'COMPANY_PAYMENT,PERSONAL_PAYMENT',
          customizeUnitCode: 'SMODR.PAYMENT.REFUND-QUERY',
        },
      };
    },
  },
});

const payModalDs = (recordData) => ({
  autoQuery: true,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
    },
    {
      name: 'paymentAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.payAmount').d('支付金额'),
    },
    {
      name: 'paymentStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentStatusMeaning').d('支付状态'),
    },
    {
      name: 'action',
      label: intl.get('smodr.payment.model.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/payments/payment-order`,
        method: 'GET',
        data: {
          ...data,
          orderId: recordData?.get('orderId'),
        },
      };
    },
  },
});

const refundModalDs = (recordData) => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'refundStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundStatusMeaning').d('退款状态'),
    },
    {
      name: 'action',
      label: intl.get('smodr.payment.model.action').d('操作'),
    },
    {
      name: 'afterSaleCode',
      type: 'string',
      label: intl.get('smodr.payment.model.afterSaleNum').d('售后申请单号'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.payment.model.skuName').d('商品名称'),
    },
    {
      name: 'refundAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundAmount').d('退款金额'),
    },
    {
      name: 'refundTypeMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundType').d('退款类型'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const url = `${SMALL_ORDER}/v1/${organizationId}/refunds/refund-info`;
      return {
        url,
        method: 'GET',
        data: {
          ...data,
          orderId: recordData?.get('orderId'),
          refundTypeCode: recordData?.get('refundTypeCode'),
        },
      };
    },
  },
});

const refundAfterDs = (recordData) => ({
  // autoQuery: true,
  selection: 'single',
  fields: [
    {
      name: 'afterSaleCode',
      type: 'string',
      label: intl.get('smodr.payment.model.afterSaleNum').d('售后申请单号'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.payment.model.skuName').d('商品名称'),
    },
    {
      name: 'refundAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundAmount').d('退款金额'),
    },
    {
      name: 'refundTypeMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundType').d('退款类型'),
    },
    // {
    //   name: 'afterSaleTime',
    //   label: intl.get('smodr.payment.model.afterSaleTime').d('售后完成时间'),
    // },
  ],
  transport: {
    read: ({ data }) => {
      const url = `${SMALL_ORDER}/v1/${organizationId}/refunds/to-refund-info`;
      return {
        url,
        method: 'GET',
        data: {
          ...data,
          orderId: recordData?.get('orderId'),
          refundTypeCode: recordData?.get('refundTypeCode'),
        },
      };
    },
  },
});

export { allDs, payDs, refundDs, payModalDs, refundModalDs, refundAfterDs };
