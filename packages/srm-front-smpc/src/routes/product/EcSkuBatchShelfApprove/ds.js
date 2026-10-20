import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const baseDs = ({ batchId }) => ({
  fields: [
    { name: 'batchNum', label: intl.get('smpc.import.model.batchNum').d('批次号') },
    { name: 'createdByName', label: intl.get('smpc.product.view.createByName').d('创建人') },
    { name: 'creationDate', label: intl.get('hzero.common.creationDate').d('创建时间') },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `/smec/v1/${organizationId}/sku-batch-approves/batch-detail/${batchId}`,
        method: 'get',
        data: {
          ...data,
          customizeUnitCode: 'SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.BASIC_INFO',
        },
      };
    },
  },
});

const skuDs = ({ batchId }) => ({
  selection: false,
  fields: [
    {
      name: 'imagePath',
      label: intl.get('smpc.product.view.skuImage').d('商品图片'),
    },
    { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
    { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
    {
      name: 'categoryNamePath',
      label: intl.get('smpc.product.view.platformCategory').d('平台分类'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('smpc.product.view.supplier').d('供应商'),
    },
    {
      name: 'catalogName',
      label: intl.get('smpc.product.model.catalog').d('目录'),
    },
    { name: 'taxPrice', label: intl.get('sagm.common.view.price.tax').d('单价(含税)') },
    { name: 'tax', label: intl.get('smpc.product.model.tax').d('税率') },
    { name: 'currencyName', label: intl.get('smpc.product.model.currency').d('币种') },
    { name: 'options', width: 160, label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smpc/v1/${organizationId}/pur-skus/ec-list`,
        method: 'get',
        data: {
          ...data,
          batchId,
          customizeUnitCode:
            'SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.LIST_EC_ALL,SMPC.WORKFLOW.EC_SKU_SHELF_APPROVE.SEARCH_BAR',
        },
      };
    },
  },
});

export { baseDs, skuDs };
