import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_PRODUCT = '/smpc';

const organizationId = getCurrentOrganizationId();

const tableDs = ({ selection = false, query = {} }) => ({
  selection,
  paging: 'server',
  idField: 'skuTemporaryId',
  parentField: '__versionId',
  modifiedCheck: false,
  queryFields: [
    { name: 'skuName', label: intl.get('smpc.product.view.skuCodeName').d('商品编码/名称') },
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
      name: 'publisher',
      type: 'object',
      ignore: 'always',
      label: intl.get('smpc.workbench.model.createBy').d('创建人'),
      lovCode: 'HIAM.TENANT.USER',
      lovPara: { organizationId },
      textField: 'realName',
      valueField: 'id',
    },
    {
      name: 'publisherId',
      bind: 'publisher.id',
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
  ],
  fields: [
    {
      name: 'approveStatus',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
    },
    {
      name: 'options',
      label: intl.get('hzero.common.action').d('操作'),
      type: 'string',
    },
    { name: 'skuInfo', label: intl.get('smpc.product.view.skuInfo').d('商品信息') },
    {
      name: 'supplierCompanyName',
      label: intl.get('smpc.product.view.supplier').d('供应商'),
    },
    {
      name: 'publisher',
      label: intl.get('smpc.workbench.model.createBy').d('创建人'),
    },
    { name: 'labels', label: intl.get('smpc.product.view.skuLabel').d('商品标签') },
    { name: 'priceInfo', label: intl.get('smpc.product.view.priceInfo').d('价格信息') },
    { name: 'effectTime', label: intl.get('smpc.product.view.effectTime').d('有效期') },
    { name: 'authority', label: intl.get('smpc.product.view.buyAuthority').d('采买权限') },
    { name: 'stockInfo', label: intl.get('smpc.product.view.stockInfo').d('库存信息') },
    { name: 'skuComment', label: intl.get('smpc.product.view.skuComment').d('商品评价') },
    { name: 'mappingInfo', label: intl.get('smpc.product.view.mappingInfo').d('映射信息') },
  ],

  record: {
    dynamicProps: {
      selectable(record) {
        return record.get('approveStatus') !== 'WORKFLOW_WAITING';
      },
    },
  },

  events: {
    append: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('__versionId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data, params, dataSet }) => {
      // 方便导出获得queryParameter参数
      Object.keys(query).forEach((key) => {
        dataSet.setQueryParameter(key, query[key]);
      });
      return {
        url: `${SRM_PRODUCT}/v1/${organizationId}/skus/query-sku-temporary`,
        method: 'GET',
        data: { ...query, ...data, ...params },
      };
    },
  },
});

export { tableDs };
