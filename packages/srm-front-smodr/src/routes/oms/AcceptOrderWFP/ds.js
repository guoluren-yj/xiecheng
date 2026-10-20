import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

const skuDs = (skuCode, skuSearchCode) => ({
  selection: false,
  fields: [
    {
      name: 'consignmentCode',
      type: 'string',
      label: `${intl.get('smodr.deliveryOrder.model.consignmentCode').d('商城配送单编码') }-${ intl.get('smodr.orderLine.model.lineCode').d('行号')}`,
    },
    {
      name: 'receiptLineNum',
      type: 'string',
      label: intl.get('smodr.acceptOrder.model.proEntryCode').d('行号'),
    },
    {
        name: 'primaryUrl',
        type: 'string',
        label: intl.get('smodr.orderLine.model.skuPrimaryUrl').d('商品图片'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.acceptOrder.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.acceptOrder.model.skuName').d('商品名称'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.acceptOrder.model.skuTypeMeaning').d('商品类型'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.acceptOrder.model.quantity').d('接收数量'),
    },
    {
        name: 'attachmentUuid',
        label: intl.get('smodr.orderLine.model.receiptAttachmentUuid').d('接收行附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'smodr',
      },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/receipt-entrys/product-page`,
        method: 'GET',
        data: { ...data, customizeUnitCode: `${skuCode},${skuSearchCode}`},
      };
    },
  },
});

const freightDs = () => ({
  selection: false,
  fields: [
    {
      name: 'receiptLineNum',
      type: 'string',
      label: intl.get('smodr.orderLine.model.lineCode').d('行号'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuName').d('商品名称'),
    },
    {
      name: 'consignmentCode',
      type: 'string',
      label: `${intl.get('smodr.deliveryOrder.model.consignmentCode').d('商城配送单编码') }-${ intl.get('smodr.orderLine.model.lineCode').d('行号')}`,
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
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.acceptOrder.model.quantity').d('接收数量'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/receipt-entrys/freight-page`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

const baseDs = () => ({
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get('smodr.acceptOrder.model.supplierCompanyId').d('供应商'),
    },
    {
      name: 'purchaseCompanyName',
      label: intl.get('smodr.acceptOrder.model.purchaseCom').d('采购方'),
    },
    {
      name: 'consignmentCode',
      label: intl.get('smodr.acceptOrder.model.consignmentCode').d('商城配送单编码'),
    },
    {
      name: 'receiptedTime',
      label: intl.get('smodr.acceptOrder.model.receiptedTime').d('接收时间'),
    },
    {
      name: 'createdByName',
      label: intl.get('smodr.acceptOrder.model.receiptedBy').d('接收人'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/receipt-entrys/header`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

export { skuDs, freightDs, baseDs };
