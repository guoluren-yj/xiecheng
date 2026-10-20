import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  pageSize: 20,
  primaryKey: 'paymentId',
  cacheSelection: true,
  autoQuery: true,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.status').d('状态'),
    },
    {
      name: 'code',
      type: 'string',
      label: intl.get('smodr.deal.model.payDealCode').d('商城交易编码'),
    },
    {
      name: 'cecSerialNumber',
      type: 'string',
      label: intl.get('smodr.deal.model.payConfigName').d('支付渠道交易流水号'),
    },
    {
      name: 'operationTypeMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.dealType').d('交易类型'),
    },
    {
      name: 'channelMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.dealChannel').d('支付渠道'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.deal.model.currency').d('币种'),
    },
    {
      name: 'amountMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.dealAmount').d('交易金额'),
    },
    {
      name: 'operationTime',
      type: 'dateTime',
      label: intl.get('smodr.deal.model.dealTime').d('交易时间'),
    },
    {
      name: 'payerName',
      type: 'string',
      label: intl.get('smodr.deal.model.payer').d('付款方'),
    },
    {
      name: 'receiverName',
      type: 'string',
      label: intl.get('smodr.deal.model.payee').d('收款方'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.deal.model.operation').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      const { filterParams = {} } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/trading-record/list`,
        method: 'GET',
        data: {
          ...filterParams,
          customizeUnitCode: 'SMODR.PAYMENT.TRADING.SELECT',
        },
      };
    },
  },
});

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
      name: 'paymnetStatusMeaning',
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
      label: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
    },
    {
      name: 'orderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'paymentAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.payAmount').d('支付金额'),
    },
    {
      name: 'buyerDate',
      type: 'string',
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
      label: intl.get('smodr.payment.model.purchaseCompanyName').d('采购方公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.frightLine.model.newSupplierCompanyName').d('供应商公司'),
    },
  ],
  transport: {
    read({ data }) {
      const { queryParam, ...other } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/payment-entrys/freight`,
        method: 'GET',
        data: { ...queryParam, ...other },
      };
    },
  },
});

const skuDS = () => ({
  selection: false,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.deal.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'cecOrderCode',
      type: 'string',
      label: intl.get('smodr.deal.model.cecOrderCode').d('电商订单编码'),
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
      label: intl.get('smodr.deal.model.unitPriceNewer').d('单价(含税)'),
    },
    {
      name: 'per',
      type: 'number',
      label: intl.get('smodr.deal.model.per').d('每'),
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

const freightDS = () => ({
  selection: false,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.deal.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'extraCostTypeMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.extraCostType').d('附加费种类'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.quantity').d('数量'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.deal.model.unitPriceTaxrat').d('单价(含税)'),
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
        url: `${SMALL_ORDER}/v1/${organizationId}/payment-entrys/freight`,
        method: 'GET',
        data: { ...queryParam, ...other },
      };
    },
  },
});

export { tableDS, initDs, wholeDs, skuDS, freightDS };
