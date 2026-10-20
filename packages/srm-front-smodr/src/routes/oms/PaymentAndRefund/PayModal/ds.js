import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const initDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'cancelStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.cancelStatusMeaning').d('取消状态'),
    },
    {
      name: 'orderCodeLine',
      type: 'string',
      label: intl.get('smodr.deal.model.orderCodeLine').d('商城订单编码-行号'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.deal.model.payChannel').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.deal.model.skuName').d('商品名称'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.skuTypeMeaning').d('商品类型'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.quantity').d('数量'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.unitPriceNew').d('单价(含税)'),
    },
    {
      name: 'amountMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.amountTax').d('行金额(含税)'),
    },
  ],
  transport: {
    read({ data }) {
      const { queryParam, ...other } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/payment-entrys/product`,
        method: 'GET',
        data: { ...queryParam, ...other },
      };
    },
  },
});

const wholeDs = () => ({
  selection: false,
  fields: [
    {
      name: 'paymentStatusMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.paymnetStatus').d('支付状态'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.deal.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'orderAmount',
      type: 'string',
      label: intl.get('smodr.payment.model.orderAmountTax').d('订单金额(含税)'),
    },
    {
      name: 'orderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'paymentAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.payAmountTax').d('支付金额(含税)'),
    },
    {
      name: 'cecOrderCode',
      type: 'string',
      label: intl.get('smodr.payment.model.cecOrderCode').d('电商订单编码'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.payment.model.buyerName').d('下单人'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.payment.model.purchaseCompanyName').d('采购方公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.payment.model.newSupplierCompanyName').d('供应商公司'),
    },
  ],
  transport: {
    read({ data }) {
      const { queryParam, ...other } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/payments/merge-payment-order-review`,
        method: 'POST',
        data: { ...queryParam, ...other, customizeUnitCode: 'SMODR.PAYMENT.REVIEW.QUERY' },
      };
    },
  },
});

export { initDs, wholeDs };
