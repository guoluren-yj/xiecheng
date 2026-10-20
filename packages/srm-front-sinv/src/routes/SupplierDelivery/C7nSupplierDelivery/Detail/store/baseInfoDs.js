import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const baseInfoDataSet = () => ({
  dataToJSON: 'all',
  pageSize: 20,
  primaryKey: 'asnLineId',
  forceValidate: true,
  fields: [
    {
      label: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
      name: 'asnLineNum',
    },
    {
      label: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`sinv.common.model.common.categoryId`).d('物料品类'),
      name: 'categoryName',
    },
    {
      label: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`sinv.common.model.common.supplierItemNum`).d('供应商料号'),
      name: 'supplierItemNum',
    },
    {
      label: intl.get(`sinv.common.model.common.suppliesNumDescription`).d('供应商料号描述'),
      name: 'supplierItemDesc',
    },
    {
      label: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
      name: 'productionDate',
      type: 'date',
    },
    {
      label: intl.get(`sinv.common.model.common.shelfLife`).d('保质期'),
      name: 'shelfLife',
    },
    {
      label: intl.get(`sinv.common.model.common.lotExpirationDate`).d('批次有效期'),
      name: 'lotExpirationDate',
      type: 'date',
    },
    {
      label: intl.get(`sinv.common.model.common.unitPackageQuantity`).d('单包装数'),
      name: 'unitPackageQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
      name: 'packageQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
      name: 'remainderQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
      name: 'serialNum',
    },
    {
      label: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
      name: 'invoiceNum',
    },
    {
      label: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
      name: 'oldItemCode',
    },
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      name: 'supplierItemCode',
    },
    {
      label: intl.get(`entity.item.name`).d('物料名称'),
      name: 'supplierItemName',
    },
    {
      label: intl.get(`sinv.common.model.common.bom`).d('外协BOM'),
      name: 'bom',
    },
    {
      label: intl.get(`sinv.common.model.common.cancelledFlag`).d('已取消'),
      name: 'cancelledFlag',
    },
    {
      label: intl.get(`sinv.common.model.common.closedFlag`).d('已关闭'),
      name: 'closedFlag',
    },
    {
      label: intl.get(`sinv.common.model.common.sendQuantity`).d('发货数量'),
      name: 'shipQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sinv.common.model.common.grossWeight`).d('毛重'),
      name: 'grossWeightStandard',
      type: 'number',
    },
    {
      label: intl.get(`sinv.common.model.common.netWeight`).d('净重'),
      name: 'netWeightStandard',
      type: 'number',
    },
    {
      label: intl.get(`sinv.common.model.common.weightUomId`).d('重量单位'),
      name: 'weightUomName',
    },
    {
      label: intl.get(`sinv.common.model.common.uomName`).d('单位'),
      name: 'uomName',
    },
    {
      label: intl.get(`sinv.common.model.common.receiveStatus`).d('接收状态'),
      name: 'receiveStatusMeaning',
    },
    {
      label: intl.get(`sinv.common.model.common.receiveQuantity`).d('已接收'),
      name: 'receiveQuantity',
    },
    {
      label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
      name: 'displayPoNum',
    },
    {
      label: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
      name: 'displayReleaseNum',
    },
    {
      label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
      name: 'displayLineNum',
    },
    {
      label: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
      name: 'displayLineLocationNum',
    },

    {
      label: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
      name: 'versionNum',
    },
    {
      label: intl.get(`sinv.common.model.common.batchNo`).d('采购批次'),
      name: 'batchNo',
    },
    {
      label: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
      name: 'lotNum',
    },
    {
      label: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
    },
    {
      label: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
      name: 'promisedDate',
      type: 'date',
    },
    {
      label: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
    },
    {
      label: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
      name: 'inventoryName',
    },
    {
      label: intl.get(`sinv.common.model.common.locationName`).d('库位'),
      name: 'locationName',
    },
    {
      label: intl.get(`sinv.common.model.common.productionOrderNum`).d('生产工单号'),
      name: 'productionOrderNum',
    },
    {
      label: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
      name: 'contactInfo',
    },
    {
      label: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
      name: 'productNum',
    },
    {
      label: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
      name: 'productName',
    },
    {
      label: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
      name: 'catalogName',
    },
    {
      label: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
      name: 'purchaseRemark',
    },
    {
      label: intl.get(`sinv.common.approveAttachmentUuid`).d('采购方审核附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      name: 'approveAttachmentUuid', // 采购方审核附件
    },
    {
      label: intl.get(`sinv.common.reviewAttachmentUuid`).d('采购方复审附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      name: 'reviewAttachmentUuid', // 采购方复审附件
    },
    {
      label: intl.get(`sinv.common.otherAttachmentUuid`).d('采购方其他附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      name: 'otherAttachmentUuid', // 采购方其他附件
    },
    // {
    //   label: intl.get(`sinv.common.model.common.otherLineAttachmentUuid`).d('采购方行附件'),
    //   name: 'attachmentUuid',
    //   type: 'attachment',
    //   bucketName: PRIVATE_BUCKET,
    //   bucketDirectory: 'sodr-order',
    // },
    {
      label: intl.get(`sinv.common.model.common.supplierRemark`).d('供应商行备注'),
      name: 'supplierRemark',
    },
    {
      label: intl.get(`entity.attachment.tag`).d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      name: 'attachmentUuid',
    },
    // {
    //   label: intl.get(`entity.attachment.tag`).d('附件'),
    //   name: 'tag',
    //   type: 'attachment',
    //   bucketName: PRIVATE_BUCKET,
    //   bucketDirectory: 'sodr-order',
    //   width: 110,
    // },
    {
      label: intl.get(`sinv.receiptExecution.model.label.customSpecsJson`).d('定制品属性'),
      name: 'customSpecsJson',
    },
    {
      label: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
      name: 'attachmentUrlList',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { asnHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/page-lines`,
        method: 'GET',
        data: other,
      };
    },
  },
});

export default baseInfoDataSet;
