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

const tableDS = (mappingType) => ({
  autoQuery: false, // 筛选器不要自动查询
  pageSize: 20,
  cacheSelection: true,
  primaryKey: 'mappingId',
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
          : intl.get('smpc.product.model.platformCategoryCodeWithName').d('平台分类编码-名称'),
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
          : 'SMPC.CATEGORY',
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
      dynamicProps: {
        required: ({ record }) => record.get('enabledFlag'),
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
      label: intl.get('smpc.product.model.catalogCodeWithName').d('目录编码-名称'),
      name: 'catalogLov',
      type: 'object',
      lovCode: 'SMPC.CATALOG_THREE',
      textField: 'catalogDesc',
      valueField: 'catalogId',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        disabled: ({ record }) => record.get('mappingId'),
        required: ({ record }) => record.get('enabledFlag'),
      },
      transformResponse: (_, record) => {
        const { catalogId, catalogName, level, catalogNamePath, catalogDesc } = record;
        return catalogId
          ? { catalogId, catalogName, catalogLevel: level, catalogNamePath, catalogDesc }
          : null;
      },
    },
    {
      name: 'catalogId',
      bind: 'catalogLov.catalogId',
    },
    {
      // label: intl.get('smpc.product.model.catalogName').d('目录名称'),
      name: 'catalogName',
      type: 'string',
      bind: 'catalogLov.catalogName',
    },
    {
      name: 'catalogDesc',
      type: 'string',
      bind: 'catalogLov.catalogDesc',
    },
    {
      label: intl.get('smpc.product.model.catalogLevel').d('目录层级'),
      name: 'level',
      type: 'number',
      bind: 'catalogLov.catalogLevel',
    },
    {
      label: intl.get('smpc.product.model.catalogUrl').d('目录路径'),
      name: 'catalogNamePath',
      type: 'string',
      bind: 'catalogLov.catalogNamePath',
    },
    {
      label: intl.get('smpc.product.model.ecSkuNum').d('电商商品数量'),
      name: 'ecSkuCount',
      type: 'number',
      help: intl.get('smpc.catalogMapping.view.ecSkuNumHelp').d('对应分类下的电商商品数量'),
    },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
      help:
        mappingType === 'CATEGORY'
          ? intl
              .get('smpc.catalogMapping.view.operationHelp')
              .d('批量上架操作可将对应分类下的电商商品批量上架')
          : '',
    },
  ],
  record: {
    dynamicProps: {
      // 未映射的平台分类映射 不能操作 勾选导出、批量删除
      selectable: (record) => !(mappingType === 'CATEGORY' && !record.get('mappingId')),
    },
  },
  queryFields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
      display: true,
      // type: 'number',
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
    {
      label:
        mappingType === 'ITEM'
          ? intl.get('smpc.product.model.item').d('物料')
          : mappingType === 'ITEM_CATEGORY'
          ? intl.get('smpc.product.model.itemCategory').d('品类')
          : intl.get('smpc.product.model.platformCategory').d('平台分类'),
      name: 'mappingLov',
      ignore: 'always',
      display: true,
      type: 'object',
      textField: mappingType === 'ITEM' ? 'itemName' : 'categoryName',
      // : mappingType === 'ITEM_CATEGORY'
      // ? 'categoryName'
      // : 'name',
      valueField: mappingType === 'ITEM' ? 'itemId' : 'categoryId',
      lovCode:
        mappingType === 'ITEM'
          ? 'SMAL.CUSTOMER_ITEM'
          : mappingType === 'ITEM_CATEGORY'
          ? 'SMDM.CATEGORY.LEVEL_CONTROL_TREE'
          : 'SMPC.CATEGORY',
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
          mappingType === 'ITEM' ? 'itemId' : 'categoryId'
          // mappingType === 'ITEM_CATEGORY' ? 'categoryId' : 'id'
        ],
    },
    // 查询参数
    {
      name: 'mappingData',
      forceQuery: true,
      visible: false,
      transformValue: (value, record) =>
        (record.get('mappingLov') || {})[mappingType === 'ITEM' ? 'itemId' : 'categoryId'],
    },
    {
      label: intl.get('smpc.product.model.catalog').d('目录'),
      name: 'catalogLov',
      type: 'object',
      ignore: 'always',
      display: true,
      textField: 'catalogName',
      valueField: 'catalogId',
      lovCode: 'SMPC.CATALOG_THREE',
      lovPara: { tenantId: organizationId },
      transformRequest: (val) => (val || {}).catalogId,
    },
    // 查询参数
    {
      name: 'catalogId',
      forceQuery: true,
      visible: false,
      transformValue: (value, record) => record.get('catalogLov')?.catalogId,
    },
    {
      name: 'mappingFlag',
      label: intl.get('smpc.product.model.mappingFlag').d('是否已映射目录'),
      lookupCode: 'HPFM.FLAG',
      show: mappingType === 'CATEGORY',
      display: true,
    },
    // 平台分类映射目录不支持时间排序
    {
      name: 'lastUpdateDate',
      label: intl.get('smpc.product.view.updateTime').d('更新时间'),
      sortFlag: true,
      visible: false,
      show: mappingType !== 'CATEGORY',
    },
  ].filter((f) => f.show !== false),
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
      url: `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}`,
      method: 'DELETE',
      data: data.map((i) => i.mappingId),
    }),
  },
});

export { tableDS };
