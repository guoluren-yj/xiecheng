import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const SRM_SMPC = '/smpc';
const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  selection: false,
  autoQuery: false,
  queryFields: [
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    {
      label: intl.get('smpc.product.model.item').d('物料'),
      name: 'itemLov',
      type: 'object',
      ignore: 'always',
      valueField: 'itemId',
      textField: 'itemName',
      lovCode: 'SMAL.CUSTOMER_ITEM',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
  ], // 勿删，生成queryDataSet
  fields: [
    {
      name: 'skuStatus',
      label: intl.get('smpc.product.model.product.status').d('商品状态'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smpc.product.model.productCode').d('商品编码'),
    },
    {
      name: 'skuInfo',
      type: 'string',
      label: intl.get('smpc.product.model.productInfo').d('商品信息'),
    },
    {
      name: 'itemInfo',
      type: 'string',
      label: intl.get('smpc.product.model.itemInfo').d('物料信息'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smpc.product.view.supplier').d('供应商'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { isSup, ...params } = data;
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/${isSup ? 'sup' : 'pur'}-skus/new`,
        data: params,
        method: 'GET',
      };
    },
  },
});

const queryDs = (isSup) => {
  return {
    autoQuery: false,
    fields: [
      { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
      { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
      {
        name: 'skuType',
        label: intl.get('smpc.product.model.productSource').d('商品来源'),
        lookupCode: 'SMAL.SUPPLIER_SOURCE_FROM',
        required: true,
        show: !isSup,
        defaultValue: 'CATA',
      },
      {
        label: intl.get('smpc.product.model.item').d('物料'),
        name: 'itemLov',
        type: 'object',
        show: !isSup,
        ignore: 'always',
        valueField: 'itemId',
        textField: 'itemName',
        lovCode: 'SMAL.CUSTOMER_ITEM',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'itemId',
        bind: 'itemLov.itemId',
        show: !isSup,
      },
      {
        name: 'itemName',
        label: intl.get('smpc.product.model.itemName').d('物料名称'),
        show: isSup,
      },
      {
        name: 'itemCode',
        label: intl.get('smpc.product.model.itemCode').d('物料编码'),
        show: isSup,
      },
      {
        label: intl.get('smpc.product.model.category').d('分类'),
        name: 'categoryLov',
        type: 'object',
        lovCode: 'SMPC.CATEGORY',
        textField: 'categoryPath',
        valueField: 'categoryId',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'categoryId',
        bind: 'categoryLov.categoryId',
      },
    ].filter((f) => f.show !== false),
  };
};

export { tableDs, queryDs };
