import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const organizationId = getCurrentOrganizationId();

function getPrecision(step) {
  return new BigNumber(1 / math.pow(10, step || 0)).toFormat();
}

function numberChange({ value, name, record, precision }) {
  let newVal = value;
  if (value && precision !== 0) {
    newVal = math.toFixed(value, Math.min.call(null, math.dp(value), precision));
    record.set(name, newVal);
  } else {
    record.set(name, newVal);
  }
  return newVal;
}

const productDs = (readOnly) => ({
  selection: false,
  pageSize: 10,
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
      type: 'number',
      label: intl.get('smodr.acceptOrder.model.quantity').d('接收数量'),
      required: !readOnly,
      computedProps: readOnly ? null : {
        min: ({ record }) => {
          return getPrecision(record.get('uomPrecision') || 0);
        },
        max: ({ record }) => {
          return record.get('waitingReceiveQuantity');
        },
        step: ({ record }) => {
          return (record.get('uomPrecision') || 0) === 0 ? 1 : null;
        },
      },
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
        data: { ...data },
      };
    },
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'quantityMeaning') {
        // 处理精度
        const newValue = numberChange({ value, name, record, precision: record.get('uomPrecision') || 0 });
        // 同步值
        record.set('quantity', newValue);
      }
    },
  },
});

const freightDs = () => ({
  selection: false,
  pageSize: 10,
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
    // {
    //   name: 'freightPricingMethodMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.acceptOrder.model.freightRuleTypeMethod').d('运费计价方式'),
    // },
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

const baseDS = () => ({
  fields: [
    {
      name: 'receiptCode',
      label: intl.get('smodr.acceptOrder.model.receiptCode').d('商城接收单编码'),
    },
    {
      name: 'cecReceiptCode',
      label: intl.get('smodr.acceptOrder.model.outReceiptCode').d('外部接收单编码'),
    },
    {
      name: 'consignmentCode',
      label: intl.get('smodr.acceptOrder.model.consignmentCode').d('商城配送单编码'),
    },
    {
      name: 'receiptStatusMeaning',
      label: intl.get('smodr.acceptOrder.model.receiptedStatusMeaning').d('接收状态'),
    },
    {
      name: 'receiptedTime',
      type: 'dateTime',
      label: intl.get('smodr.acceptOrder.model.receiptedTime').d('接收时间'),
    },
    {
      name: 'createdByName',
      label: intl.get('smodr.acceptOrder.model.receiptedBy').d('接收人'),
    },
  ],
});

export { productDs, freightDs, baseDS };
