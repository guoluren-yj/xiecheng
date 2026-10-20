import intl from 'utils/intl';
// import { SRM_MALL } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// const organizationId = getCurrentOrganizationId();

const baseInfoDs = () => ({
  autoQuery: false,
  autoCreate: true,
  paging: false,
  fields: [
    {
      name: 'skuTitle',
      label: intl.get('smpc.product.view.skuTitle1').d('商品副标题'),
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get('smpc.product.model.platformCategory').d('平台分类'),
      name: 'categoryNamePath',
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

export { baseInfoDs };
