import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const baseInfoDataSet = ({ processFactory, HeaderDs, activeKey, sureSupplier }) => ({
  dataToJSON: 'all',
  pageSize: 20,
  modifiedCheck: false,
  forceValidate: true,
  cacheModified: true,
  primaryKey: 'invLineId',
  // forceValidate: true,
  selection: activeKey === 'all' || activeKey === 'affirm' ? false : 'multiple',
  fields: [
    {
      label: intl.get(`sinv.inventoryBench.model.view.invLineNum`).d('行号'),
      name: 'invLineNum',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.invOrganizationId`).d('库存组织'),
      name: 'invOrganizationId',
      type: 'object',
      lovCode: sureSupplier ? 'SPUC.SINV_STOCK_OUT_INV_ORG' : 'SPFM.USER_AUTH.INVORG',
      textField: 'organizationName',
      valueField: 'invOrganizationId',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
        disabled: ({ record, dataSet }) =>
          record.get('sourceCode') === 'EXTERNAL_SYSTEM' ||
          (dataSet?.getState('invOrganizationId') &&
            (record.get('internalAddQuantity') > 0 || record.get('internalReduceQuantity') > 0)),
      },
      transformRequest: (value) => {
        return value && value.organizationId;
      },
      transformResponse: (value) => {
        return value
          ? {
              organizationId: value,
            }
          : undefined;
      },
    },
    {
      name: 'organizationName',
      type: 'string',
      bind: 'invOrganizationId.organizationName',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.itemCode`).d('物料编码'),
      name: 'itemIdLov',
      type: 'object',
      lovCode: 'SPUC.ITEM_PRICE_CODE',
      lovPara: {
        tenantId: organizationId,
      },
      textField: 'itemCode',
      ignore: 'always',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
            organizationId,
            supplierCompanyId: HeaderDs?.map((i) => i.toJSONData())?.[0]?.supplierCompanyId,
            companyId: HeaderDs?.map((i) => i.toJSONData())?.[0]?.companyId,
          };
        },
        required: () => HeaderDs?.map((i) => i.toJSONData())?.[0]?.sourceCode === 'SRM',
        disabled: ({ record }) =>
          HeaderDs?.map((i) => i.toJSONData())?.[0]?.sourceCode === 'EXTERNAL_SYSTEM' ||
          record.get('internalAddQuantity') ||
          record.get('internalReduceQuantity'),
      },
    },
    {
      name: 'itemId',
      type: 'string',
      bind: 'itemIdLov.itemId',
    },
    {
      name: 'itemCode',
      type: 'string',
      bind: 'itemIdLov.itemCode',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.customerItemName`).d('物料名称'),
      name: 'itemName',
      bind: 'itemIdLov.itemName',
    },
    {
      name: 'uomIdLov',
      type: 'object',
      lovCode: 'SMDM.UOM',
      label: intl.get(`sinv.inventoryBench.model.view.uomId`).d('单位'),
      textField: 'uomName',
      valueField: 'uomId',
    },
    {
      name: 'uomId',
      bind: 'uomIdLov.uomId',
    },
    {
      name: 'uomName',
      bind: 'uomIdLov.uomName',
    },
    {
      name: 'uomCode',
      bind: 'uomIdLov.uomCode',
    },
    {
      label:
        processFactory === '1'
          ? intl.get(`sinv.inventoryBench.model.view.quality`).d('库存差异值')
          : intl.get(`sinv.inventoryBench.model.view.quantity`).d('创建数量'),
      name: 'quantity',
      type: 'number',

      dynamicProps: {
        required: () => processFactory !== '1',
        disabled: () => processFactory === '1',
        min: () => {
          // const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          // const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
          if (processFactory !== '1') {
            return 0;
          }
        },
      },
      defaultValue: processFactory === '1' ? 0 : null,
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.affirmQuantity`).d('确认数量'),
      name: 'affirmQuantity',
      type: 'number',
      dynamicProps: {
        required: () => activeKey === 'affirm' && processFactory !== '1',
        min: () => {
          if (processFactory !== '1') {
            return 0;
          }
        },
      },
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.inventoryId`).d('库房'),
      name: 'inventoryId',
      type: 'object',
      lovCode: 'SODR.INVENTORY',
      valueField: 'inventoryId',
      textField: 'inventoryName',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
        disabled: ({ record, dataSet }) =>
          record.get('sourceCode') === 'EXTERNAL_SYSTEM' ||
          (dataSet?.getState('inventoryId') &&
            (record.get('internalAddQuantity') > 0 || record.get('internalReduceQuantity') > 0)),
      },
      transformRequest: (value) => {
        return value && value.inventoryId;
      },
      transformResponse: (value) => {
        return value
          ? {
              inventoryId: value,
            }
          : undefined;
      },
    },
    // {
    //   name: 'inventoryId',
    //   type: 'string',
    //   bind: 'inventoryIdLov.inventoryId',
    // },
    {
      name: 'inventoryName',
      type: 'string',
      bind: 'inventoryId.inventoryName',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.locationId`).d('库位'),
      name: 'locationId',
      type: 'object',
      lovCode: 'HPFM.LOCATION_URL',
      valueField: 'locationId',
      textField: 'locationName',
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
        disabled: ({ record, dataSet }) =>
          record.get('sourceCode') === 'EXTERNAL_SYSTEM' ||
          (dataSet?.getState('locationId') &&
            (record.get('internalAddQuantity') > 0 || record.get('internalReduceQuantity') > 0)),
      },
      transformRequest: (value) => {
        return value && value.locationId;
      },
      transformResponse: (value) => {
        return value
          ? {
              locationId: value,
            }
          : undefined;
      },
    },
    {
      name: 'locationName',
      type: 'string',
      bind: 'locationId.locationName',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.sourceNum`).d('来源订单'),
      name: 'sourceNum',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.lotNum`).d('批次号'),
      name: 'lotNum',
      dynamicProps: {
        disabled: ({ dataSet, record }) =>
          dataSet?.getState('lotNum') &&
          (record.get('internalAddQuantity') > 0 || record.get('internalReduceQuantity') > 0),
      },
    },

    {
      label: intl.get(`sinv.inventoryBench.model.view.lineAttachmentUuid`).d('行附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      name: 'lineAttachmentUuid', // 采购方其他附件
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.inspectQuantity`).d('线下盘点库存总量'),
      name: 'inspectQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.theoryQuantities`).d('理论库存现有量'),
      name: 'theoryQuantity',
      type: 'number',
    },

    {
      label: intl.get(`sinv.inventoryBench.model.view.internalAddQuantities`).d('理论周期内发料'),
      name: 'internalAddQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.internalReduceQuantity`).d('理论周期内消耗'),
      name: 'internalReduceQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.purchaseAgentId`).d('采购员'),
      name: 'purchaseAgentId',
      type: 'object',
      lovCode: sureSupplier ? 'SPUC.SINV_STOCK_OUT_AGENT' : 'SPFM.USER_AUTH.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: sureSupplier ? organizationId : undefined,
          };
        },
      },
      transformRequest: (value) => {
        return value && value.purchaseAgentId;
      },
      transformResponse: (value) => {
        return value
          ? {
              purchaseAgentId: value,
            }
          : undefined;
      },
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      bind: 'purchaseAgentId.purchaseAgentName',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.inventoryDetail`).d('发料消耗明细'),
      name: 'action',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { invHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/line/${invHeaderId}`,
        method: 'GET',
        data: other,
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'affirmQuantity' && value >= 0) {
        const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
        record.set('affirmQuantity', Number(record.get('affirmQuantity')).toFixed(uomPrecision));
      }
      if (name === 'quantity' && value >= 0 && processFactory !== '1') {
        const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
        record.set('quantity', Number(record.get('quantity')).toFixed(uomPrecision));
      }
      if (name === 'inspectQuantity') {
        const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
        record.set('inspectQuantity', Number(record.get('inspectQuantity')).toFixed(uomPrecision));
        if (processFactory === '1') {
          const minusValue = math.minus(value, record.get('theoryQuantity'));
          record.set('quantity', minusValue || 0);
        }
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.set({
          affirmQuantity: isNil(i.get('affirmQuantity'))
            ? i.get('quantity')
            : i.get('affirmQuantity'),
        });
      });
    },
  },
});

export default baseInfoDataSet;
