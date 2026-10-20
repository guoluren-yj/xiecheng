import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';
const organizationId = getCurrentOrganizationId();

const tableDs = (supFlag) => ({
  autoQuery: true,
  queryFields: [
    {
      label: intl.get('smpc.product.model.category').d('分类'),
      name: 'categoryId',
      type: 'object',
      valueField: 'categoryId',
      textField: 'categoryName',
      lovCode: 'SMPC.CATEGORY',
      transformRequest: (val) => (val || {}).categoryId,
    },
    {
      label: intl.get('smpc.product.model.product').d('商品'),
      name: 'skuName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.productGroupCode').d('商品组编码'),
      name: 'spuCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.item').d('物料'),
      name: 'itemId',
      type: 'object',
      valueField: 'itemId',
      textField: 'itemName',
      lovCode: 'SMAL.ITEM_BY_PUR',
      lovPara: { purchaseTenantId: organizationId },
      transformRequest: (val) => (val || {}).itemId,
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierCompanyId',
      type: 'object',
      valueField: 'supplierCompanyId',
      textField: 'supplierCompanyName',
      lovCode: 'SMAL.TENANT_SUPPLIER_ALL',
      transformRequest: (val) => (val || {}).supplierCompanyId,
    },
    {
      label: intl.get('smpc.product.model.goodsStatus').d('商品状态'),
      name: 'skuStatus',
      type: 'number',
      lookupCode: 'SMPC.SKU_STATUS',
    },
    {
      label: intl.get('smpc.product.model.thirdProductSkuCode').d('第三方商品编码'),
      name: 'thirdSkuCode',
      type: 'string',
    },
  ],
  fields: [
    {
      label: intl.get('smpc.productPublish.model.skuInfo').d('商品信息'),
      name: 'skuInfo',
      transformResponse: (_, record) => {
        return {
          spuCode: record.spuCode,
          skuName: record.skuName,
          mediaPath: record.mediaPath,
          categoryNamePath: record.categoryNamePath,
        };
      },
    },
    {
      label: intl.get('smpc.product.model.productGroupCode').d('商品组编码'),
      name: 'spuCode',
      type: 'string',
      bind: 'skuInfo.spuCode',
    },
    {
      label: intl.get('smpc.product.model.thirdProductSkuCode').d('第三方商品编码'),
      name: 'thirdSkuCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.productCode').d('商品编码'),
      name: 'skuCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.productCode').d('商品名称'),
      name: 'skuName',
      type: 'string',
      bind: 'skuInfo.skuName',
    },
    {
      label: intl.get('smpc.product.model.productImg').d('商品图片'),
      name: 'mediaPath',
      type: 'string',
      bind: 'skuInfo.mediaPath',
    },
    {
      label: intl.get('smpc.product.model.category').d('分类'),
      name: 'categoryNamePath',
      type: 'string',
      bind: 'skuInfo.categoryNamePath',
    },
    {
      label: intl.get('smpc.product.model.itemInfo').d('物料信息'),
      name: 'itemInfo',
      transformResponse: (_, record) => {
        return {
          itemCode: record.itemCode,
          itemName: record.itemName,
        };
      },
    },
    {
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
      name: 'itemCode',
      type: 'string',
      bind: 'itemInfo.itemCode',
    },
    {
      label: intl.get('smpc.product.model.item.name').d('物料名称'),
      name: 'itemName',
      type: 'string',
      bind: 'itemInfo.itemName',
    },
    {
      label: intl.get('smpc.productPublish.model.platformTaxPrice').d('平台价格（含税）'),
      name: 'unitPrice',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.goodsStatus').d('商品状态'),
      name: 'skuStatus',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.purchaser').d('采购方'),
      name: 'purchaser',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierTenantName',
      type: 'string',
    },
    {
      label: intl.get('smpc.productPublish.model.stock').d('库存'),
      name: 'skuStock',
      type: 'number',
    },
    // {
    //   label: intl.get('smpc.productPublish.model.promulgator').d('发布者'),
    //   name: 'tenantName',
    //   type: 'string',
    // },
    {
      label: intl.get('smpc.productPublish.model.uploadTime').d('上传时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
      type: 'object',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/skus/sku-page`,
        method: 'GET',
        data: {
          supFlag,
          ...data,
          tenantId: organizationId,
        },
      };
    },
  },
  events: {
    select: ({ dataSet, record }) => {
      dataSet.forEach((r) => {
        if (r.get('spuId') === record.get('spuId')) {
          Object.assign(r, { isSelected: true });
        }
      });
    },
    unSelect: ({ dataSet, record }) => {
      dataSet.forEach((r) => {
        if (r.get('spuId') === record.get('spuId')) {
          Object.assign(r, { isSelected: false });
        }
      });
    },
  },
});

export { tableDs };
