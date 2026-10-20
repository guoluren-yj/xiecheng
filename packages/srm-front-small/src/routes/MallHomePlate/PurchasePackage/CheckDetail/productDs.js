import { SRM_MALL } from '_utils/config';

import intl from 'utils/intl';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const productDs = {
  autoQuery: false,
  selction: false,
  queryFields: [
    {
      label: intl.get(`small.common.model.supplier`).d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`small.mallHomePlate.model.productCodeName`).d('商品编码/名称'),
      name: 'productName',
    },
  ],
  fields: [
    {
      label: intl.get(`small.common.model.sourceType`).d('商品类型'),
      name: 'sourceType',
      lookupCode: 'SMAL.PRODUCT_SOURCE_FROM',
    },
    { label: intl.get(`small.common.model.supplier`).d('供应商'), name: 'supplierCompanyName' },
    { label: intl.get(`small.common.model.productCode`).d('商品编码'), name: 'productNum' },
    { label: intl.get(`small.common.model.productName`).d('商品名称'), name: 'productName' },
    {
      label: intl.get('small.common.model.purchaseQuantity').d('采购数量'),
      name: 'purchaseQuantity',
    },
    { label: intl.get('hzero.common.button.action').d('操作'), name: 'option' },
  ],
  transport: {
    read: {
      url: `${SRM_MALL}/v1/${organizationId}/basket-assigns`,
      method: 'GET',
    },
    destroy: () => ({
      url: `${SRM_MALL}/v1/${organizationId}/basket-assigns`,
      method: 'DELETE',
    }),
  },
};

export { productDs };
