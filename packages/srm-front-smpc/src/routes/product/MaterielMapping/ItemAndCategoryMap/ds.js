import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId(); // 租户ID

const tableDS = (mappingType) => ({
  autoQuery: true,
  fields: [
    // {
    //   label: intl.get('smpc.product.model.mappingType').d('映射类型'),
    //   name: 'mappingType',
    //   type: 'string',
    //   lookupCode: 'SMPC.ITEM_MAPPING_TYPE',
    //   required: true,
    // },
    {
      label:
        mappingType === 'ITEM'
          ? intl.get('smpc.product.model.itemCode').d('物料编码')
          : intl.get('smpc.product.model.itemCategoryCode').d('品类编码'),
      name: 'mapLov',
      type: 'object',
      textField: 'mappingDataCode',
      valueField: 'mappingDataCode',
      ignore: 'always',
      required: true,
      lovCode: mappingType === 'ITEM' ? 'SMAL.CUSTOMER_ITEM' : 'SMDM.ITEM_CATEGORY',
      lovPara: { tenantId: organizationId, ...(mappingType !== 'ITEM' ? { enabledFlag: 1 } : {}) },
      // dynamicProps: ({ record }) => {
      //   const type = record.get('mappingType');
      //   return {
      //     disabled: !type,
      //   };
      // },
      transformResponse: (_, record) => {
        const { mappingData, mappingDataCode, mappingDataName } = record;
        return mappingData ? { mappingData, mappingDataCode, mappingDataName } : null;
      },
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
      label:
        mappingType === 'ITEM'
          ? intl.get('smpc.product.model.itemName').d('物料名称')
          : intl.get('smpc.product.model.itemCategoryName').d('品类名称'),
      name: 'mappingDataName',
      type: 'string',
      bind: 'mapLov.mappingDataName',
    },
    {
      label: intl.get('smpc.product.model.mallCatalogCode').d('商城目录编码'),
      name: 'catalogLov',
      type: 'object',
      lovCode: 'SMAL.TENANT.CATALOG',
      textField: 'catalogCode',
      valueField: 'catalogId',
      ignore: 'always',
      required: true,
      transformResponse: (_, record) => {
        const { catalogId, catalogCode, catalogName, level, catalogNamePath } = record;
        return catalogCode
          ? { catalogId, catalogCode, catalogName, catalogLevel: level, catalogNamePath }
          : null;
      },
    },
    {
      name: 'catalogId',
      bind: 'catalogLov.catalogId',
    },
    {
      name: 'catalogCode',
      type: 'string',
      bind: 'catalogLov.catalogCode',
    },
    {
      label: intl.get('smpc.product.model.mallCatalogName').d('商城目录名称'),
      name: 'catalogName',
      type: 'string',
      bind: 'catalogLov.catalogName',
    },
    {
      label: intl.get('smpc.product.model.mallCatalogLevel').d('商城目录层级'),
      name: 'level',
      type: 'number',
      bind: 'catalogLov.catalogLevel',
    },
    {
      label: intl.get('smpc.product.model.mallCatalogUrl').d('商城目录路径'),
      name: 'catalogNamePath',
      type: 'string',
      bind: 'catalogLov.catalogNamePath',
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
  ],
  queryFields: [
    {
      label:
        mappingType === 'ITEM'
          ? intl.get('smpc.product.model.itemCode').d('物料编码')
          : intl.get('smpc.product.model.itemCategoryCode').d('品类编码'),
      name: 'mappingDataCode',
      type: 'string',
    },
    {
      label:
        mappingType === 'ITEM'
          ? intl.get('smpc.product.model.itemName').d('物料名称')
          : intl.get('smpc.product.model.itemCategoryName').d('品类名称'),
      name: 'mappingDataName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.mallCatalog').d('商城目录'),
      name: 'catalogId',
      type: 'object',
      textField: 'catalogName',
      valueField: 'catalogId',
      lovCode: 'SMAL.TENANT.CATALOG',
      transformRequest: (val) => (val || {}).catalogId,
    },
    // {
    //   label: intl.get('smpc.product.model.mappingType').d('映射类型'),
    //   name: 'mappingType',
    //   type: 'string',
    //   lookupCode: 'SMPC.ITEM_MAPPING_TYPE',
    // },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}`,
      method: 'GET',
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SMPC}/v1/${organizationId}/catalog-mappings`,
      method: 'DELETE',
      data,
    }),
  },
});

export { tableDS };
