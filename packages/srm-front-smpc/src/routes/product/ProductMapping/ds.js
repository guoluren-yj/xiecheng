import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId(); // 租户ID

const getMapLovOptionsProps = (mappingType) => {
  if (mappingType === 'ITEM_CATEGORY') {
    return {
      optionsProps: {
        // 根据业务规则 - 品类值集选择范围， 判断数据是否能选中
        record: {
          dynamicProps: {
            // 预定义不能启用禁用（头上按钮）
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
    };
  } else return {};
};

// eslint-disable-next-line no-unused-vars
const getQueryFields = (mappingType) => {
  return [
    {
      label:
        mappingType === 'ITEM'
          ? intl.get('smpc.product.model.item').d('物料')
          : mappingType === 'ITEM_CATEGORY'
          ? intl.get('smpc.product.model.itemCategory').d('品类')
          : intl.get('smpc.product.model.catalogName').d('目录名称'),
      name: 'mappingData',
      type: 'object',
      textField:
        mappingType === 'ITEM'
          ? 'itemName'
          : mappingType === 'ITEM_CATEGORY'
          ? 'categoryName'
          : 'catalogName',
      valueField:
        mappingType === 'ITEM'
          ? 'itemId'
          : mappingType === 'ITEM_CATEGORY'
          ? 'categoryId'
          : 'catalogId',
      lovCode:
        mappingType === 'ITEM'
          ? 'SMAL.CUSTOMER_ITEM'
          : mappingType === 'ITEM_CATEGORY'
          ? 'SMDM.CATEGORY.LEVEL_CONTROL_TREE'
          : 'SMPC.CATALOG_THREE',
      lovPara: {
        tenantId: organizationId,
        ...(mappingType === 'ITEM_CATEGORY'
          ? {
              enabledFlag: 1,
              businessObjectCode: 'SRM_C_SRM_PRODUCT_DASHBOARD',
              hzeroUIFlag: 0,
            }
          : {}),
      },
      ...getMapLovOptionsProps(mappingType),
      transformRequest: (val) =>
        (val || {})[
          mappingType === 'ITEM'
            ? 'itemId'
            : mappingType === 'ITEM_CATEGORY'
            ? 'categoryId'
            : 'catalogId'
        ],
    },
    {
      name: 'skuType',
      label: intl.get('smpc.product.model.productSource').d('商品来源'),
      lookupCode: 'SMAL.SUPPLIER_SOURCE_FROM',
      required: true,
      defaultValue: 'CATA',
    },
    {
      label: intl.get('smpc.product.model.product').d('商品'),
      name: 'skuId',
      type: 'object',
      textField: 'skuName',
      valueField: 'productId',
      lovCode: 'SMPC.ES_PUR_SKU',
      lovPara: { tenantId: organizationId },
      transformRequest: (val) => (val || {}).productId,
    },
    {
      show: mappingType === 'ITEM',
      name: 'thirdSkuCode',
      label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
    },
  ].filter((f) => f.show || !('show' in f));
};

const tableDS = (mappingType, codes = []) => ({
  // autoQuery: true,
  primaryKey: 'mappingId',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get('smpc.product.model.mappingType').d('映射类型'),
      name: 'mappingType',
      type: 'string',
    },
    {
      label:
        mappingType === 'ITEM'
          ? intl.get('smpc.product.model.itemCodeWithName').d('物料编码-名称')
          : mappingType === 'ITEM_CATEGORY'
          ? intl.get('smpc.product.model.itemCategoryCodeWithName').d('品类编码-名称')
          : intl.get('smpc.product.model.catalogCodeWithName').d('目录编码-名称'),
      name: 'mapLov',
      type: 'object',
      textField: 'mappingDataDesc',
      valueField: 'mappingData',
      ignore: 'always',
      required: true,
      lovCode:
        mappingType === 'ITEM'
          ? 'SMAL.CUSTOMER_ITEM'
          : mappingType === 'ITEM_CATEGORY'
          ? 'SMDM.CATEGORY.LEVEL_CONTROL_TREE'
          : 'SMPC.CATALOG_THREE',
      lovPara: {
        tenantId: organizationId,
        ...(mappingType === 'ITEM_CATEGORY'
          ? {
              enabledFlag: 1,
              businessObjectCode: 'SRM_C_SRM_PRODUCT_DASHBOARD',
              hzeroUIFlag: 0,
            }
          : {}),
      },
      ...getMapLovOptionsProps(mappingType),
      transformResponse: (_, record) => {
        const { mappingData, mappingDataCode, mappingDataName, mappingDataDesc } = record;
        return mappingData
          ? { mappingData, mappingDataCode, mappingDataName, mappingDataDesc }
          : null;
      },
    },
    {
      name: 'externalSystemCode',
      label: intl.get('smpc.product.model.itemSourceSystem').d('物料来源'),
    },
    {
      name: 'mappingData',
      bind: 'mapLov.mappingData',
    },
    {
      name: 'mappingDataCode',
      bind: 'mapLov.mappingDataCode',
    },
    {
      // label:
      //   mappingType === 'ITEM'
      //     ? intl.get('smpc.product.model.itemName').d('物料名称')
      //     : mappingType === 'ITEM_CATEGORY'
      //     ? intl.get('smpc.product.model.itemCategoryName').d('品类名称')
      //     : intl.get('smpc.product.model.platformCategoryName').d('平台分类名称'),
      name: 'mappingDataName',
      type: 'string',
      bind: 'mapLov.mappingDataName',
    },
    {
      name: 'mappingDataDesc',
      type: 'string',
      bind: 'mapLov.mappingDataDesc',
    },
    {
      label: intl.get('smpc.product.model.catalogLevel').d('目录层级'),
      name: 'level',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.catalogUrl').d('目录路径'),
      name: 'catalogNamePath',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.supplier').d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get('smpc.product.model.productCode').d('商品编码'),
      name: 'productLov',
      type: 'object',
      lovCode: 'SMPC.ES_PUR_SKU',
      textField: 'skuCode',
      valueField: 'productId',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        disabled: ({ record }) => record.get('mappingId'),
      },
      transformResponse: (_, record) => {
        const { productId, skuCode, skuName, thirdSkuCode } = record;
        return productId ? { productId, skuCode, skuName, thirdSkuCode } : null;
      },
    },
    {
      name: 'skuId',
      bind: 'productLov.productId',
    },
    {
      name: 'skuCode',
      bind: 'productLov.skuCode',
    },
    {
      label: intl.get('smpc.product.model.thirdProductSkuId').d('第三方商品编码'),
      name: 'thirdSkuCode',
      type: 'string',
      bind: 'productLov.thirdSkuCode',
    },
    {
      label: intl.get('smpc.product.model.productName').d('商品名称'),
      name: 'skuName',
      type: 'string',
      bind: 'productLov.skuName',
    },
    {
      label: intl.get('smpc.product.model.createMethod').d('创建方式'),
      name: 'sourceFromMeaning',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
    },
    {
      name: 'updateUser',
      label: intl.get('smpc.product.view.updateUser').d('更新人'),
    },
    {
      name: 'updateTime',
      type: 'dateTime',
      label: intl.get('smpc.product.view.updateTime').d('更新时间'),
    },
  ],
  transport: {
    read: ({ dataSet, data }) => {
      dataSet.setState('dsDefaultParams', { customizeUnitCode: codes.join(',') });
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/sku-mappings/${mappingType}`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: codes.join(','),
        },
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/sku-mappings/${mappingType}`,
        method: 'POST',
        data: { ...data, customizeUnitCode: codes.join(',') },
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/sku-mappings/${mappingType}`,
        method: 'DELETE',
        data: {
          skuType: dataSet.queryDataSet.toData()[0].skuType,
          mappingIds: data.map((i) => i.mappingId),
        },
      };
    },
  },
});

export { tableDS };
