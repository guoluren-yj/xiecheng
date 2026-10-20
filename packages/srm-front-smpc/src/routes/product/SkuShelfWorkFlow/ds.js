import intl from 'utils/intl';

const batchShelfHeaderDs = () => ({
  autoQuery: false,
  paging: false,
  fields: [
    { name: 'realName', label: intl.get('smpc.product.view.createByName').d('创建人') },
    { name: 'lastUpdateDate', label: intl.get('hzero.common.date.createdDate').d('创建时间') },
    { name: 'approveRemark', label: intl.get('smpc.product.model.remark').d('备注') },
  ],
});

const baseInfoDs = () => ({
  autoQuery: false,
  autoCreate: true,
  paging: false,
  fields: [
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get('smpc.product.model.mallCatalog').d('商城目录'),
      name: 'catalogName',
    },
    {
      name: 'labels',
      label: intl.get('smpc.product.view.skuLabel').d('商品标签'),
    },
    {
      label: intl.get('smpc.product.view.title.skuDescription').d('商品描述'),
      name: 'introductions',
    },
    {
      name: 'customFlag',
      label: intl.get('smpc.product.view.customSkuInfo').d('定制品信息'),
    },
    {
      name: 'primaryImagePath',
    },
  ],
});

export { baseInfoDs, batchShelfHeaderDs };
