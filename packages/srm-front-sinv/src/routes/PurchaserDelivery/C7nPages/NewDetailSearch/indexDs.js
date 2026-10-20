import intl from 'utils/intl';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const detailDataSet = () => ({
  autoQuery: false,
  // 主键字段名
  primaryKey: 'asnLineId',
  // 缓存选中字段 与 primaryKey 同时使用
  cacheSelection: true,
  pageSize: 20,
  queryParameter: {
    overReceptionFlag: 0,
    customizeUnitCode:
      'SINV.PURCHASER_DELIVERY_LIST.GRID_BY_DETAIL,SINV.PURCHASER_DELIVERY.SEARCH.DETAIL_SEARCH',
  },
  fields: [
    {
      label: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
      name: 'asnNum',
      width: 150,
      fixed: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
      name: 'displayAsnLineNum',
      width: 70,
      fixed: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
      name: 'asnTypeCodeMeaning',
      width: 100,
    },
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      name: 'itemCode',
      width: 110,
    },
    {
      label: intl.get(`entity.item.name`).d('物料名称'),
      name: 'itemName',
      width: 180,
    },
    {
      label: intl.get(`sinv.common.model.common.cancelledFlag`).d('已取消'),
      name: 'cancelledFlag',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.closedFlag`).d('已关闭'),
      name: 'closedFlag',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
      name: 'displayPoNum',
      width: 180,
    },
    {
      label: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
      name: 'displayReleaseNum',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
      name: 'displaylineNum',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
      name: 'displayLineLocationNum',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
      name: 'versionNum',
      width: 120,
    },
    {
      label: intl.get(`sinv.purchaserDelivery.model.purchaserDelivery.asnStatus`).d('送货单状态'),
      name: 'asnStatusMeaning',
      width: 130,
    },
    {
      label: intl.get(`sinv.common.model.common.shipQuantity`).d('发货数量'),
      name: 'shipQuantity',
      width: 110,
    },
    {
      label: intl.get(`sinv.common.model.common.grossWeight`).d('毛重'),
      name: 'grossWeightStandard',
      width: 120,
      align: 'right',
    },
    {
      label: intl.get(`sinv.common.model.common.netWeight`).d('净重'),
      name: 'netWeightStandard',
      width: 120,
      align: 'right',
    },
    {
      label: intl.get(`sinv.common.model.common.weightUomId`).d('重量单位'),
      name: 'weightUomName',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.receiveStatus`).d('接收状态'),
      name: 'receiveStatusMeaning',
      width: 110,
    },
    {
      label: intl.get(`sinv.common.model.common.receiveQuantity`).d('已接收'),
      name: 'receiveQuantity',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.uomName`).d('单位'),
      name: 'uomName',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
      name: 'creationDate',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
      name: 'shipDate',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
      name: 'expectedArriveDate',
      width: 180,
    },
    {
      label: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
      name: 'promisedDate',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
      name: 'inventoryName',
      width: 100,
    },
    {
      label: intl.get(`sinv.common.model.common.locationName`).d('库位'),
      name: 'locationName',
      width: 100,
    },
    {
      label: intl.get(`sinv.common.model.common.shipAddress`).d('发货地点'),
      name: 'supplierSiteName',
      width: 150,
    },
    {
      label: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
      name: 'organizationName',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
      name: 'shipToLocationAddress',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
      name: 'contactInfo',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
      name: 'lotNum',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
      name: 'productionDate',
      width: 150,
    },
    {
      label: intl.get(`sinv.purchaseReception.message.shelfLife`).d('保质期'),
      name: 'shelfLife',
      width: 80,
    },
    {
      label: intl.get(`sinv.purchaseReception.message.lotExpirationDate`).d('批次有效期'),
      name: 'lotExpirationDate',
      width: 140,
    },
    {
      label: intl.get(`sinv.common.model.common.unitPackageQuantity`).d('单包装数'),
      name: 'unitPackageQuantity',
      width: 110,
    },
    {
      label: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
      name: 'packageQuantity',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
      name: 'remainderQuantity',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
      name: 'serialNum',
      width: 80,
    },
    {
      label: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
      name: 'invoiceNum',
      width: 80,
    },
    {
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      name: 'supplierCompanyName',
      width: 120,
    },
    {
      label: intl.get(`entity.company.tag`).d('公司'),
      name: 'companyName',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
      name: 'productNum',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
      name: 'productName',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
      name: 'catalogName',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
      name: 'oldItemCode',
      width: 110,
    },
    {
      label: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
      name: 'purchaseRemark',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.otherLineAttachmentUuid`).d('采购方行附件'),
      name: 'approveAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      width: 130,
    },
    {
      label: intl.get(`sinv.common.model.common.supplierRemark`).d('供应商行备注'),
      name: 'supplierRemark',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.lineAttachmentUuid`).d('行附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      width: 130,
    },
    {
      label: intl.get(`sinv.common.model.common.bom`).d('外协BOM'),
      name: 'bom',
      width: 120,
    },
    {
      label: intl.get(`sinv.receiptExecution.model.name.customSpecsJson`).d('定制品属性'),
      name: 'customSpecsJson',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.purOrganizationName`).d('采购组织'),
      name: 'purOrganizationName',
      width: 180,
    },
    {
      label: intl.get(`sinv.common.model.common.relationDanju`).d('关联单据'),
      name: 'relation',
      width: 120,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/lines/for-purchase`,
        method: 'GET',
      };
    },
  },
});

export { detailDataSet };
