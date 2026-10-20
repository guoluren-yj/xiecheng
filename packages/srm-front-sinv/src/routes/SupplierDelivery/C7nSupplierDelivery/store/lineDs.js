import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { BUCKET_NAME, BUCKET_DIRECTORY } from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();

const wholeDataSet = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
  pageSize: 20,
  primaryKey: 'asnHeaderId',
  queryParameter: {
    unReadMessageFlag: 1,
    customizeUnitCode: 'SINV.SUPPLIER_DELIVERY_LIST.GRID,SINV.SUPPLIER_DELIVERY_LIST.NEW_FILTER',
  },
  fields: [
    {
      name: 'asnStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
      fixed: 'left',
    },
    {
      name: 'asnNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
      fixed: 'left',
      sorter: true,
    },
    {
      name: 'printStatusFlag',
      type: 'string',
      label: intl.get(`sinv.supplierDelivery.model.supplierDelivery.printable`).d('可打印'),
      fixed: 'left',
    },
    {
      name: 'asnTypeCodeMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
      align: 'left',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('entity.company.tag').d('公司'),
      align: 'left',
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('entity.customer.tag').d('客户'),
      align: 'left',
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
      align: 'left',
    },
    {
      name: 'shipDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
      align: 'left',
    },
    {
      name: 'expectedArriveDate',
      type: 'dateTime',
      label: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
      align: 'left',
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
      align: 'left',
    },
    {
      name: 'shipToLocationAddress',
      type: 'string',
      label: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
      align: 'left',
    },
    {
      name: 'actualReceiverName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
      align: 'left',
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
      align: 'left',
    },
    {
      name: 'createByName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.createByName`).d('创建人'),
      align: 'left',
    },
    {
      name: 'cancelStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态'),
      align: 'left',
    },
    {
      name: 'submitSyncStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.supplierDelivery.model.supplierDelivery.submitStatus`).d('导入状态'),
      align: 'left',
    },
    {
      name: 'erpAsnNum',
      label: intl.get(`sinv.deliveryClosed.model.closeSyncResponseMsg`).d('反馈信息'),
    },
    {
      name: 'dataSourceCode',
      label: intl.get('hzero.common.button.operating').d('操作记录'),
    },
    {
      name: 'expressNum',
      label: intl.get(`sinv.supplierDelivery.model.common.expressNum`).d('物流单号'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/for-supplier`,
        method: 'GET',
      };
    },
  },
});

const DetailDataSet = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
  pageSize: 20,
  primaryKey: 'asnLineId',
  queryParameter: {
    customizeUnitCode:
      'SINV.SUPPLIER_DELIVERY_LIST.GRID_BY_DETAIL,SINV.SUPPLIER_DELIVERY_LIST.NEW_FILTER_BY_DETAIL',
  },
  fields: [
    {
      name: 'asnNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
      fixed: 'left',
    },
    {
      name: 'displayAsnLineNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
      fixed: 'left',
      sorter: true,
    },
    {
      name: 'asnTypeCodeMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
      fixed: 'left',
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
      align: 'left',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
      align: 'left',
    },
    {
      name: 'cancelledFlag',
      type: 'string',
      label: intl.get(`sinv.common.model.common.cancelledFlag`).d('已取消'),
      align: 'left',
    },
    {
      name: 'closedFlag',
      type: 'Date',
      label: intl.get(`sinv.common.model.common.closedFlag`).d('已关闭'),
      align: 'left',
    },
    {
      name: 'displayPoNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
      align: 'left',
    },
    {
      name: 'displayReleaseNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
      align: 'left',
    },
    {
      name: 'displaylineNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
      align: 'left',
    },
    {
      name: 'displayLineLocationNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
      align: 'left',
    },
    {
      name: 'versionNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
      align: 'left',
    },
    {
      name: 'asnStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.supplierDelivery.model.supplierDelivery.asnStatus`).d('送货单状态'),
      align: 'left',
    },
    {
      name: 'shipQuantity',
      type: 'string',
      label: intl.get(`sinv.common.model.common.shipQuantity`).d('发货数量'),
      align: 'left',
    },
    {
      name: 'grossWeightStandard',
      type: 'string',
      label: intl.get(`sinv.common.model.common.grossWeight`).d('毛重'),
      align: 'right',
    },
    {
      name: 'netWeightStandard',
      type: 'string',
      label: intl.get(`sinv.common.model.common.netWeight`).d('净重'),
      align: 'right',
    },
    {
      name: 'weightUomName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.weightUomId`).d('重量单位'),
      align: 'left',
    },
    {
      name: 'receiveStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.receiveStatus`).d('接收状态'),
      align: 'left',
    },
    {
      name: 'receiveQuantity',
      type: 'string',
      label: intl.get(`sinv.common.model.common.receiveQuantity`).d('已接收'),
      align: 'left',
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.uomName`).d('单位'),
      align: 'left',
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
      align: 'left',
    },
    {
      name: 'shipDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
      align: 'left',
    },
    {
      name: 'expectedArriveDate',
      type: 'dateTime',
      label: intl.get(`sinv.common.model.common.expectedArriveDate`).d('预计到货时间'),
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      align: 'left',
      type: 'date',
    },
    {
      label: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
      name: 'promisedDate',
      align: 'left',
      type: 'date',
    },
    {
      label: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
      name: 'inventoryName',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.locationName`).d('库位'),
      name: 'locationName',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.shipAddress`).d('发货地点'),
      name: 'supplierSiteName',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
      name: 'organizationName',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
      name: 'shipToLocationAddress',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
      name: 'contactInfo',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
      name: 'lotNum',
      align: 'left',
    },
    {
      label: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
      name: 'productionDate',
      align: 'left',
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
      label: intl.get(`entity.company.tag`).d('公司'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`entity.customer.tag`).d('客户'),
      name: 'companyName',
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
      label: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
      name: 'purchaseRemark',
    },
    {
      label: intl.get(`sinv.common.model.common.otherLineAttachmentUuid`).d('采购方行附件'),
      name: 'approveAttachmentUuid',
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    {
      label: intl.get(`sinv.common.model.common.supplierRemark`).d('供应商行备注'),
      name: 'supplierRemark',
    },
    {
      label: intl.get(`sinv.common.model.common.lineAttachmentUuid`).d('行附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    {
      label: intl.get(`sinv.common.model.common.bom`).d('外协BOM'),
      name: 'bom',
    },
    {
      label: intl.get(`sinv.receiptExecution.model.label.customSpecsJson`).d('定制品属性'),
      name: 'customSpecsJson',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/lines/for-supplier`,
        method: 'GET',
      };
    },
  },
});

export { wholeDataSet, DetailDataSet };
