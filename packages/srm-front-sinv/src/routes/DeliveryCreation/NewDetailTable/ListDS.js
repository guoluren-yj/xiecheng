import { isNil } from 'lodash';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

import { getLineAttachmentUuid } from '@/services/deliveryCreationService';

const organizationId = getCurrentOrganizationId();

const lineListDataSet = () => ({
  dataToJSON: 'all',
  primaryKey: 'asnLineId',
  selection: 'multiple',
  paging: false,
  modifiedCheck: false,
  forceValidate: true,
  fields: [
    {
      name: 'action',
      type: 'string',
      label: intl.get(`hzero.common.button.action`).d('操作'),
      fixed: 'left',
    },
    {
      name: 'displayAsnLineNum',
      type: 'number',
      label: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
      fixed: 'left',
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
      fixed: 'left',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
      fixed: 'left',
    },
    {
      name: 'supplierItemNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.supplierItemNum`).d('供应商料号'),
    },
    {
      name: 'supplierItemDesc',
      type: 'string',
      label: intl.get(`sinv.common.model.common.suppliesNumDescription`).d('供应商料号描述'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.quantity`).d('订单数量'),
    },
    {
      name: 'canShipQuantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.anyShipQuantity`).d('剩余可发货数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.uomName`).d('单位'),
    },
    {
      name: 'shipQuantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.theShipQuantity`).d('本次发货'),
      required: true,
      dynamicProps: {
        precision: ({ record }) => {
          if (!isNil(record.get('uomPrecision'))) {
            return record.get('uomPrecision');
          }
        },
        min: ({ record }) => {
          if ([0, '0'].includes(record.get('uomPrecision'))) {
            return 1;
          }
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
          return textNum;
        },
      },
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      min: 0,
      numberGrouping: true,
      label: intl.get(`sinv.common.model.common.taxIncludedLineAmount`).d('含税金额'),
      dynamicProps: {
        precision: ({ record }) => {
          if (!isNil(record.get('financialPrecision'))) {
            return record.get('financialPrecision');
          }
        },
      },
    },
    {
      name: 'grossWeightStandard',
      type: 'number',
      min: 0,
      numberGrouping: true,
      label: intl.get(`sinv.common.model.common.grossWeight`).d('毛重'),
    },
    {
      name: 'netWeightStandard',
      type: 'number',
      min: 0,
      numberGrouping: true,
      label: intl.get(`sinv.common.model.common.netWeight`).d('净重'),
    },
    {
      name: 'weightUomId',
      type: 'object',
      label: intl.get(`sinv.common.model.common.weightUomId`).d('重量单位'),
      lovCode: 'SMDM.ITEM.UOM.ORG',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value && value.uomId,
    },
    {
      name: 'unitPackageQuantity',
      type: 'number',
      min: 0,
      numberGrouping: true,
      label: intl.get(`sinv.common.model.common.unitPackageQuantity`).d('单包装数'),
      dynamicProps: {
        max: ({ record }) => {
          return record.get('shipQuantity');
        },
        precision: ({ record }) => {
          if (!isNil(record.get('uomPrecision'))) {
            return record.get('uomPrecision');
          }
        },
      },
    },
    {
      name: 'packageQuantity',
      type: 'number',
      min: 0,
      numberGrouping: true,
      label: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
    },
    {
      name: 'remainderQuantity',
      type: 'number',
      min: 0,
      numberGrouping: true,
      label: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
      dynamicProps: {
        precision: ({ record }) => {
          if (!isNil(record.get('uomPrecision'))) {
            return record.get('uomPrecision');
          }
        },
      },
    },
    {
      name: 'lotNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
      inputChinese: false,
    },
    {
      name: 'productionDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
    },
    {
      name: 'shelfLife',
      type: 'number',
      label: intl.get(`sinv.common.model.common.shelfLife`).d('保质期'),
    },
    {
      name: 'lotExpirationDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.lotExpirationDate`).d('批次有效期'),
    },
    {
      name: 'serialNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
      inputChinese: false,
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
      inputChinese: false,
    },
    {
      name: 'supplierRemark',
      type: 'string',
      label: intl.get(`sinv.common.model.common.supplierRemark`).d('供应商行备注'),
    },
    {
      name: 'displayPoNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
    },
    {
      name: 'displayReleaseNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
    },
    {
      name: 'displayLineNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
    },
    {
      name: 'displayLineLocationNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
    },
    {
      name: 'versionNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
    },
    {
      name: 'batchNo',
      type: 'string',
      label: intl.get(`sinv.common.model.common.batchNo`).d('采购批次'),
    },
    {
      name: 'neededDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
    },
    {
      name: 'promisedDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
    },
    {
      name: 'locationName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.locationName`).d('库位'),
    },
    {
      name: 'productionOrderNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.productionOrderNum`).d('生产工单号'),
    },
    {
      name: 'contactInfo',
      type: 'string',
      label: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
    },
    {
      name: 'catalogueName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
    },
    {
      name: 'purchaseRemark',
      type: 'string',
      label: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
    },
    {
      name: 'otherAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get(`sinv.common.model.common.otherLineAttachmentUuid`).d('采购方行附件'),
    },
    {
      name: 'supplierItemCode',
      type: 'string',
      label: intl.get(`entity.item.code`).d('物料编码'),
    },
    {
      name: 'supplierItemName',
      type: 'string',
      label: intl.get(`entity.item.name`).d('物料名称'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get(`sinv.common.model.common.lineAttachmentUuid`).d('行附件'),
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.agentId`).d('采购员'),
    },
    {
      name: 'commonName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.commonName`).d('通用名'),
    },
    {
      name: 'bom',
      type: 'string',
      label: intl.get(`sinv.common.model.common.bom`).d('外协BOM'),
    },
    {
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性'),
    },
    {
      name: 'attachmentUrlList',
      type: 'string',
      label: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'attachmentUuid') {
        if (record.get('asnLineId')) {
          getLineAttachmentUuid({
            asnLineId: record.get('asnLineId'),
            objectVersionNumber: record.get('objectVersionNumber'),
            _token: record.get('_token'),
            attachmentUuid: value,
          }).then((res) => {
            if (res && !res.failed) {
              record.init({
                attachmentUuid: res.attachmentUuid,
                objectVersionNumber: res.objectVersionNumber,
              });
            }
          });
        }
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { asnHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/lines`,
        method: 'GET',
        data: other,
      };
    },
  },
});

const addListDataSet = () => ({
  dataToJSON: 'dirty',
  primaryKey: 'index',
  selection: 'multiple',
  // paging: false,
  modifiedCheck: false,
  forceValidate: true,
  fields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
      fixed: 'left',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
      fixed: 'left',
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.quantity`).d('订单数量'),
    },
    {
      name: 'canAsnQuantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.canAsnQuantity`).d('可发货数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.uomName`).d('单位'),
    },
    {
      name: 'displayPoNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
    },
    {
      name: 'displayLineNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
    },
    {
      name: 'displayLineLocationNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
    },
    {
      name: 'releaseNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
    },
    {
      name: 'versionNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
    },
    {
      name: 'neededDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
    },
    {
      name: 'promisedDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`entity.customer.tag`).d('客户'),
    },
    {
      name: 'shipToThirdPartyName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
    },
  ],
  queryFields: [
    {
      name: 'displayPoNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
      typeCase: 'upper',
      inputChinese: false,
    },
    {
      name: 'displayLineNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`entity.item.tag`).d('物料'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { asnHeaderId } = data.params || {};
      const queryData = filterNullValueObject({ ...data });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/lines/add`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { lineListDataSet, addListDataSet };
