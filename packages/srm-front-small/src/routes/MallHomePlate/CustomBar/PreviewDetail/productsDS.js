import { SRM_MALL } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const productsDS = () => ({
  primaryKey: 'barAssginId',
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'sourceFrom',
      type: 'string',
      label: intl.get(`small.common.model.sourceType`).d('商品类型'),
      lookupCode: 'SMAL.PRODUCT_SOURCE_FROM',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`small.common.model.supplier`).d('供应商'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get(`small.common.model.productCode`).d('商品编码'),
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get(`small.common.model.productName`).d('商品名称'),
    },
    {
      name: 'shelfFlag',
      type: 'number',
      label: intl.get('small.common.model.product.status').d('商品状态'),
    },
    {
      name: 'operate',
      type: 'string',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],

  queryFields: [
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`small.common.model.supplier`).d('供应商'),
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get(`small.mallHomePlate.model.productCodeName`).d('商品编码/名称'),
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/custom-bar-assigns`,
        method: 'GET',
        data: {
          ...data,
        },
      };
    },
  },
});

export { productsDS };
