import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getQueryFields = (isShelf) => {
  const queryFields = [
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    {
      name: 'skuType',
      label: intl.get('smpc.product.model.productSource').d('商品来源'),
      lookupCode: 'SMAL.SUPPLIER_SOURCE_FROM',
      required: true,
      defaultValue: 'CATA',
    },
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
    {
      label: intl.get('smpc.product.model.catalog').d('目录'),
      name: 'catalogLov',
      type: 'object',
      lovCode: 'SMPC.CATALOG_THREE',
      textField: 'catalogName',
      valueField: 'catalogId',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'shelfFlag',
      label: intl.get('smpc.product.view.skuStatus').d('商品状态'),
      lookupCode: 'SMPC.WAITING_SHELF_STATUS',
      show: !isShelf,
    },
    {
      name: 'catalogId',
      bind: 'catalogLov.catalogId',
    },
    {
      name: 'catalogName',
      bind: 'catalogLov.catalogName',
    },
    {
      name: 'supplier',
      type: 'object',
      ignore: 'always',
      label: intl.get('smpc.product.view.supplier').d('供应商'),
      lovCode: 'SMAL.TENANT_SUPPLIER_ALL',
      lovPara: { tenantId: organizationId },
      textField: 'supplierCompanyName',
      valueField: 'supplierCompanyId',
    },
    {
      name: 'thirdSkuCode',
      label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplier.supplierCompanyId',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplier.supplierTenantId',
    },
    {
      name: 'shelfDate',
      label: intl.get('smpc.product.model.shelfActionTime').d('上架操作时间'),
      ignore: 'always',
      type: 'dateTime',
      range: ['start', 'end'],
    },
    {
      name: 'shelfDateFrom',
      bind: 'shelfDate.start',
    },
    {
      name: 'shelfDateTo',
      bind: 'shelfDate.end',
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
    // {
    //   name: 'publisher',
    //   type: 'object',
    //   ignore: 'always',
    //   label: intl.get('smpc.product.view.publisher').d('发布者'),
    //   lovCode: 'HIAM.TENANT.USER',
    //   lovPara: { organizationId },
    //   textField: 'realName',
    //   valueField: 'id',
    // },
    // {
    //   name: 'publisherId',
    //   bind: 'publisher.id',
    // },
  ];
  return queryFields.filter((f) => f.show !== false);
};

// 表格ds
const tableDs = (params = {}, isShelf = false) => ({
  autoQuery: false,
  queryFields: getQueryFields(isShelf),
  fields: [
    { name: 'skuStatus', label: intl.get('smpc.product.view.skuStatus').d('商品状态') },
    { name: 'approveStatus', label: intl.get('smpc.product.view.approveStatus').d('审批状态') },
    { name: 'shelfRemark', label: intl.get('smpc.product.view.skuRemark').d('商品备注') },
    { name: 'options', label: intl.get('hzero.common.action').d('操作') },
    { name: 'skuInfo', label: intl.get('smpc.product.view.skuInfo').d('商品信息') },
    { name: 'imagePath', label: intl.get('smpc.product.view.skuImage').d('商品图片') },
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    { name: 'spuCode', label: intl.get('smpc.product.view.spuCode').d('商品组编码') },
    {
      name: 'categoryNamePath',
      label: intl.get('smpc.product.view.platformCategory').d('平台分类'),
    },
    {
      name: 'thirdSkuCode',
      label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('smpc.product.view.supplier').d('供应商'),
    },
    {
      name: 'publisher',
      label: intl.get('smpc.product.view.publisher').d('发布者'),
    },
    { name: 'labels', label: intl.get('smpc.product.view.skuLabel').d('商品标签') },
    { name: 'priceInfo', label: intl.get('smpc.product.view.priceInfo').d('价格信息') },
    { name: 'shelfDate', label: intl.get('smpc.product.model.shelfActionTime').d('上架操作时间') },
    { name: 'effectTime', label: intl.get('smpc.product.view.effectTime').d('有效期') },
    { name: 'authority', label: intl.get('smpc.product.view.buyAuthority').d('采买权限') },
    { name: 'stockInfo', label: intl.get('smpc.product.view.stockInfo').d('库存信息') },
    {
      name: 'skuStock',
      label: intl.get('smpc.product.model.canUseStock').d('可用库存'),
    },
    {
      name: 'warnStock',
      label: intl.get('smpc.product.model.warnStock').d('预警库存'),
    },
    {
      name: 'consumedStock',
      label: intl.get('smpc.product.model.useStock').d('消耗库存'),
    },
    {
      name: 'totalStock',
      label: intl.get('smpc.product.model.allStock').d('总库存'),
    },
    {
      name: 'catalogName',
      label: intl.get('smpc.product.model.catalog').d('目录'),
    },
    {
      name: 'itemName',
      label: intl.get('smpc.product.model.item').d('物料'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get('smpc.product.view.itemCategory').d('物料品类'),
    },
    { name: 'skuComment', label: intl.get('smpc.product.view.skuComment').d('商品评价') },
    { name: 'mappingInfo', label: intl.get('smpc.product.view.mappingInfo').d('映射信息') },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...other } = data;
      return {
        url: `/smpc/v1/${organizationId}/pur-skus`,
        method: 'GET',
        data: { ...other, ...queryParams, ...params },
      };
    },
  },
});

export { tableDs };
