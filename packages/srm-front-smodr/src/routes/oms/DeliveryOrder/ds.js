import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const productDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.proEntryCode').d('行号'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuName').d('商品名称'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.skuTypeMeaning').d('商品类型'),
    },
    {
      name: 'originalQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.deliveryOrder.model.quantity').d('发货数量'),
    },
    {
      name: 'cancelQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.deliveryOrder.model.cancelQuantity').d('取消数量'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/consignment-entrys/product-page`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

const freightDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'consignmentLineNum',
      type: 'string',
      label: intl.get('smodr.orderLine.model.lineCode').d('行号'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuName').d('商品名称'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.itemName').d('物料名称'),
    },
    {
      name: 'extraCostTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.additionType').d('附加费种类'),
    },
    // {
    //   name: 'freightPricingMethodMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.orderDetail.model.freightRuleTypeMethod').d('运费计价方式'),
    // },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.deliveryOrder.model.freightQuantity').d('发货数量'),
    },
    {
      name: 'cancelQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.deliveryOrder.model.cancelQuantity').d('取消数量'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/consignment-entrys/freight-page`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

const baseDS = () => ({
  fields: [
    {
      name: 'consignmentCode',
      label: intl.get('smodr.deliveryOrder.model.consignmentCode').d('商城配送单编码'),
    },
    {
      name: 'ecConsignmentCode',
      label: intl.get('smodr.deliveryOrder.model.ecSubCode').d('电商子订单编码'),
    },
    {
      name: 'srmConsignmentCode',
      label: intl.get('smodr.deliveryOrder.model.outConsignmentCode').d('外部配送单编码'),
    },
    {
      name: 'consignmentStatusMeaning',
      label: intl.get('smodr.deliveryOrder.model.consignmentStatusMeaning').d('配送状态'),
    },
    {
      name: 'shippedTime',
      type: 'dateTime',
      label: intl.get('smodr.deliveryOrder.model.shippedTime').d('配送时间'),
    },
    {
      name: 'completedTime',
      type: 'dateTime',
      label: intl.get('smodr.deliveryOrder.model.completedTime').d('妥投时间'),
    },
  ],
});

export { productDs, freightDs, baseDS };
