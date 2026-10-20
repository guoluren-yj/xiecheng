import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';

const SRM_PRODUCT = '/smpc';

const tenantId = getCurrentOrganizationId();

const tableDs = ({ selection = false, query = {} }) => ({
  selection,
  paging: 'server',
  expandField: 'expend',
  idField: 'skuTemporaryId',
  parentField: 'parentId',
  fields: [
    {
      name: 'approveStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
    },
    {
      name: 'skuCode',
      label: intl.get('smpc.product.model.productCode').d('商品编码'),
      type: 'string',
    },
    {
      name: 'productInfo',
      label: intl.get('smpc.productApprove.model.productInfo').d('商品信息'),
      type: 'object',
    },
    {
      name: 'itemInfo',
      label: intl.get('smpc.product.model.itemInfo').d('物料信息'),
      type: 'object',
    },
    {
      name: 'companyInfo',
      label: intl.get('smpc.productApprove.model.supAndPur').d('供采双方'),
      type: 'object',
    },
    {
      name: 'agreementInfo',
      label: intl.get('smpc.productApprove.model.withAgreementInfo').d('关联协议信息'),
      type: 'object',
    },
    {
      name: 'priceInfo',
      label: intl.get('smpc.productApprove.model.priceInfo').d('价格信息'),
      type: 'object',
    },
    {
      name: 'supplierTenantName',
      label: intl.get('smpc.product.model.publisher').d('发布者'),
      type: 'string',
    },
    {
      name: 'options',
      label: intl.get('hzero.common.action').d('操作'),
      type: 'string',
    },
  ],
  queryFields: [
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smpc.product.model.productCodeAndName').d('商品编码/名称'),
    },
    {
      name: 'spuCode',
      type: 'string',
      label: intl.get('smpc.product.model.productGroupCode').d('商品组编码'),
    },
    {
      name: 'creationDateFrom',
      type: 'date',
      format: getDateFormat(),
      max: 'creationDateTo',
      label: intl.get('smpc.product.model.creationDateFrom').d('创建日期从'),
    },
    {
      name: 'creationDateTo',
      type: 'date',
      format: getDateFormat(),
      min: 'creationDateFrom',
      label: intl.get('smpc.product.model.creationDateTo').d('创建日期至'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('parentId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PRODUCT}/v1/${tenantId}/skus/query-sku-temporary`,
        method: 'GET',
        data: { ...query, ...data, ...params },
      };
    },
  },
});

export { tableDs };
