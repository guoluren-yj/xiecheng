import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

const ds = () => ({
  selection: false,
  fields: [
    {
      name: 'otherInfo',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.otherInfo').d('其他信息'),
    },
    {
      name: 'batchNum',
      type: 'string',
      label: intl.get('smodr.orderLine.model.batchNum').d('批次号'),
    },
    {
      name: 'batchAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.batchAmount').d('批次总额'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.buyerName').d('下单人姓名'),
    },
    {
      name: 'cecCreatedTime',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.buyerDate').d('下单时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/orders/batch-detail`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

const productDs = () => ({
  selection: false,
  fields: [
    {
      name: 'primaryUrl',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuPrimaryUrl').d('商品图片'),
    },
    {
      name: 'groupOrderCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.groupOrderCode').d('商城订单编码-行号'),
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
      name: 'productCompareDTO',
      type: 'string',
      label: intl.get('smodr.orderLine.model.competitive').d('比价单'),
    },
    {
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.entryCode').d('商品行号'),
    },
    {
      name: 'productAttributeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.productAttributeMeaning').d('销售规格'),
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
      name: 'originalQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.quantity').d('数量'),
    },
    {
      name: 'uom',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.uomName').d('单位'),
    },
    {
      name: 'taxRateMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxRateMeaning').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
    },
    {
      name: 'containFreight',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.containFreight').d('单价是否含运费'),
    },
    {
      name: 'eachFreight',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.fenAmount').d('分摊运费（每）'),
    },
    {
      name: 'unitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.unitNakedPriceMeaning').d('单价(不含税)'),
    },
    {
      name: 'per',
      type: 'number',
      label: intl.get('smodr.orderDetail.model.per').d('每'),
    },
    {
      name: 'proxyUnitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.unitPriceTaxNew').d('单价(含税)'),
    },
    {
      name: 'proxyEntryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.lineAmountTaxNew').d('行金额(含税)'),
    },
    {
      name: 'nakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.nakedPriceMeaning').d('行金额(不含税)'),
    },
    {
      name: 'neededDate',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.neededDate').d('需求日期'),
    },
    {
      name: 'remark',
      label: intl.get('smodr.orderDetail.model.remark').d('备注'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.DETAIL.BATCH.APPROVE.SKU, SMODR.ORDER.DETAIL.NE_WORKFLOW.SKU.SEARCHBAR', freightFlag: 0 },
      };
    },
  },
});

const freightDs = () => ({
  selection: false,
  fields: [
    {
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.lineNumber').d('行号'),
    },
    {
      name: 'groupOrderCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.groupOrderCode').d('商城订单编码-行号'),
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
      label: intl.get('smodr.orderDetail.model.extraCostTypeMeaning').d('附加费种类'),
    },
    {
      name: 'originalQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.quantity').d('数量'),
    },
    {
      name: 'taxRateMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxRateMeaning').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.freightAmountTaxNew').d('单价(含税)'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.lineAmountTaxNew').d('行金额(含税)'),
    },
    {
      name: 'nakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.nakedPriceMeaning').d('行金额(不含税)'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/extra-cost-list`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.DETAIL.BATCH.APPROVE.FREIGHT' },
      };
    },
  },
});

const orderDs = () => ({
  selection: false,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderCoder').d('订单编码'),
    },
    {
      name: 'proxyOrderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderMoneyTax').d('订单全额(含税)'),
    },
    {
      name: 'nakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.nakedPriceMeaningNew').d('订单金额(不含税)'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
    },
    {
      name: 'contactName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactName').d('收货人姓名'),
    },
    {
      name: 'mobilePhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.phone').d('手机号码'),
    },
    {
      name: 'fullAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.address').d('收货详细地址'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'showSupplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.supplierCompanyName').d('供应商'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'smodr',
    },
    {
      name: 'outerAttachmentUuid',
      type: 'attachment',
      label: intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'smodr',
    },
    {
      name: 'remark',
      label: intl.get('smodr.orderDetail.model.remark').d('备注'),
    },
    {
      name: 'showOrderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'unitName',
      label: intl.get('smodr.orderDetail.model.unitName').d('部门名称'),
    },
    {
      name: 'ouName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/orders/order-list`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

const orderBaseInfoDS = () => ({
  fields: [
    {
      name: 'contactName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactName').d('收货人姓名'),
    },
    {
      name: 'fullPhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.fullPhone').d('收货人手机号码'),
    },
    {
      name: 'receiveFullAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.address').d('收货详细地址'),
    },
    {
      name: 'invoiceContactName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.acquirerName').d('收单人姓名'),
    },
    {
      name: 'invoiceTelNum',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceTelNum').d('收单人手机号码'),
    },
    {
      name: 'fullAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.acquirerAddress').d('收单详细地址'),
    },
    {
      name: 'invoiceTypeName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceType').d('发票类型'),
    },
    {
      name: 'invoiceStateName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceMethod').d('开票方式'),
    },
    {
      name: 'invoiceTitle',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceTitle').d('发票抬头'),
    },
    {
      name: 'invoiceContentName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceContent').d('发票内容'),
    },
    {
      name: 'taxRegisterNum',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxNumber').d('纳税人识别号'),
    },
    {
      name: 'depositBank',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.depositBank').d('开户银行'),
    },
    {
      name: 'bankAccount',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.bankAccount').d('银行账户'),
    },
    {
      name: 'registeredAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactAddress').d('联系地址'),
    },
    {
      name: 'registeredPhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactPhone').d('联系电话'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/orders/inner-detail`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.DETAIL.ORDER.APPROVE.PERSONAL_INFO, SMODR.ORDER.DETAIL.ORDER.APPROVE.INVOICE_INFO' },
      };
    },
  },
});

export { productDs, freightDs, ds, orderDs, orderBaseInfoDS };
