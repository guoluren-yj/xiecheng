import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 记录筛选的ds
const filterDs = () => ({
  autoCreate: true,
  fields: [{ name: 'tabStatus' }, { name: 'viewType' }],
});

// 工作台筛选fields
const getFilterFields = (filterFields = []) => {
  const fields = [
    {
      label: intl.get('smpc.product.model.itemCodeAndName').d('物料编码/名称'),
      name: 'itemName',
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
      name: 'shelfFlag',
      label: intl.get('smpc.product.view.skuStatus').d('商品状态'),
      lookupCode: 'SMPC.PUR_SKU_STATUS',
    },
    {
      name: 'shelfStatus',
      ignore: 'always',
      label: intl.get('smpc.product.view.skuStatus').d('商品状态'),
      lookupCode: 'SMPC.WAITING_SHELF_STATUS',
    },
    {
      name: 'thirdSkuCode',
      label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
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
      label: intl.get('smpc.product.view.publisher').d('发布者'),
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
      name: 'imageCheck',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('smpc.product.view.isMatainImg').d('是否维护图片'),
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
  ];
  return fields.filter((field) => !filterFields.includes(field.name));
};

// 表单ds
const formDs = () => ({
  // autoCreate: true,
  fields: [{ name: 'skuName' }, ...getFilterFields()],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'shelfStatus') {
        record.set('shelfFlag', value);
      }
    },
  },
});

// 表格ds
const tableDs = (url = '', params = {}, dsProps = {}) => ({
  autoQuery: false,
  primaryKey: 'skuId',
  cacheSelection: true,
  ...dsProps,
  pageSize: 20,
  fields: [
    { name: 'skuStatus', label: intl.get('smpc.product.view.skuStatus').d('商品状态') },
    {
      name: 'supplierShelfFlag',
      label: intl.get('smpc.product.view.skuStatus').d('商品状态'),
    },
    {
      name: 'recycleFlagMeaning',
      label: intl.get('smpc.product.view.skuStatus').d('商品状态'),
    },
    { name: 'approveStatus', label: intl.get('smpc.product.view.approveStatus').d('审批状态') },
    { name: 'shelfRemark', label: intl.get('smpc.product.view.skuRemark').d('商品备注') },
    { name: 'approveType' },
    {
      name: 'approveTypeMeaning',
      label: intl.get('smpc.product.view.approveType').d('申请类型'),
    },
    { name: 'approveReason', label: intl.get('smpc.product.model.applyCause').d('申请原因') },
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
      label: intl.get('smpc.workbench.model.createBy').d('创建人'),
    },
    { name: 'labels', label: intl.get('smpc.product.view.skuLabel').d('商品标签') },
    { name: 'priceInfo', label: intl.get('smpc.product.view.priceInfo').d('价格信息') },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smpc.product.view.firsSendTime').d('首次推送时间'),
    },
    {
      name: 'shelfDate',
      type: 'dateTime',
      label: intl.get('smpc.product.model.shelfActionTime').d('上架操作时间'),
    },
    {
      name: 'offShelfDate',
      label: intl.get('smpc.product.model.offShelfActionTime').d('下架操作时间'),
    },
    { name: 'effectTime', label: intl.get('smpc.product.view.effectTime').d('有效期') },
    {
      name: 'firstShelfDate',
      type: 'dateTime',
      label: intl.get('smpc.product.view.firstShelfDate').d('首次上架时间'),
    },
    {
      name: 'ecValidDateTo',
      label: intl.get('smpc.product.model.dateTo').d('有效期至'),
      type: 'date',
    },
    {
      name: 'sourceFromNums',
      label: intl.get('smpc.product.view.sourceFromNum').d('寻源单号'),
    },
    { name: 'authority', label: intl.get('smpc.product.view.buyAuthority').d('采买权限') },
    { name: 'stockInfo', label: intl.get('smpc.product.view.stockInfo').d('库存信息') },
    { name: 'inventoryName', label: intl.get('smpc.product.view.inventoryName').d('库房') },
    {
      name: 'skuStock',
      type: 'number',
      label: intl.get('smpc.product.model.canUseStock').d('可用库存'),
    },
    {
      name: 'warningStock',
      type: 'number',
      label: intl.get('smpc.product.model.warnStock').d('预警库存'),
    },
    {
      name: 'consumedStock',
      type: 'number',
      label: intl.get('smpc.product.model.useStock').d('消耗库存'),
    },
    {
      name: 'totalStock',
      type: 'number',
      label: intl.get('smpc.product.model.allStock').d('总库存'),
    },
    {
      name: 'catalogName',
      label: intl.get('smpc.product.model.catalog').d('目录'),
    },
    {
      name: 'itemCode',
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('smpc.product.model.itemName').d('物料名称'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get('smpc.product.view.itemCategory').d('物料品类'),
    },
    { name: 'skuComment', label: intl.get('smpc.product.view.skuComment').d('商品评价') },
    { name: 'mappingInfo', label: intl.get('smpc.product.view.mappingInfo').d('映射信息') },
    { name: 'shelfRemark', label: intl.get('smpc.product.model.remark').d('备注') },
    {
      name: 'weightScore',
      type: 'number',
      label: intl.get('smpc.product.modal.weightScore').d('权重分'),
      min: 0,
      max: 1000000,
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('smpc.product.view.purchaser').d('采购员'),
    },
    {
      name: 'giveawayFlag',
      label: intl.get('smpc.product.model.giveawayFlag').d('赠品'),
      readOnly: true,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...other } = data;
      return {
        url,
        method: 'GET',
        data: { ...other, ...queryParams, ...params },
      };
    },
  },
});

export { formDs, tableDs, filterDs, getFilterFields };
