import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const lovPropsMap = () => ({
  PLATFORM_CATEGORY: {
    lovCode: 'SMPC.CATEGORY',
    textField: 'categoryPath',
    valueField: 'categoryId',
    codeField: 'categoryCode',
    nameLabel: intl.get('smpc.product.model.platformCategoryName').d('平台分类名称'),
    codeLabel: intl.get('smpc.product.model.platformCategoryCode').d('平台分类编码'),
  },
  CATALOG: {
    lovCode: 'SMPC.CATALOG_THREE',
    textField: 'catalogName',
    valueField: 'catalogId',
    codeField: 'catalogCode',
    nameLabel: intl.get('smpc.product.model.catalogName').d('目录名称'),
    codeLabel: intl.get('smpc.product.model.catalogCode').d('目录编码'),
  },
  ITEM_CATEGORY: {
    lovCode: 'SMDM.ITEM_CATEGORY',
    textField: 'categoryName',
    valueField: 'categoryId',
    codeField: 'categoryCode',
    lovPara: { tenantId: organizationId, enabledFlag: 1 },
    nameLabel: intl.get('smpc.product.model.itemCategoryName').d('品类名称'),
    codeLabel: intl.get('smpc.product.model.itemCategoryCode').d('品类编码'),
  },
  ITEM: {
    lovCode: 'SMAL.ITEM_BY_PUR',
    textField: 'itemName',
    valueField: 'itemId',
    codeField: 'itemCode',
    lovPara: { purchaseTenantId: organizationId },
    nameLabel: intl.get('smpc.product.model.itemName').d('物料名称'),
    codeLabel: intl.get('smpc.product.model.itemCode').d('物料编码'),
  },
  SKU: {
    lovCode: 'SMPC.EC_PUR_SKU',
    textField: 'skuName',
    valueField: 'skuId',
    codeField: 'skuCode',
    lovPara: { tenantId: organizationId, skyType: 'EC' },
    nameLabel: intl.get('smpc.product.view.skuName').d('商品名称'),
    codeLabel: intl.get('smpc.product.view.skuCode').d('商品编码'),
  },
  SUPPLIER: {
    lovCode: 'SMPC.EC_PRICE_MONITOR_SUPPLIER',
    textField: 'companyName',
    valueField: 'companyId',
    codeField: 'companyNum',
    lovPara: { tenantId: organizationId },
    nameLabel: intl.get('smpc.product.model.companyName').d('公司名称'),
    codeLabel: intl.get('smpc.product.model.companyCode').d('公司编码'),
  },
});

export default function DimensionDs({ monitorType, monitorStrategyId }) {
  const { codeField, nameLabel, codeLabel, ...lovProps } = lovPropsMap()[monitorType] || {};
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'dimensionValueCode',
        bind: `dimensionLov.${codeField}`,
        label: intl.get('smpc.ecPriceMonitor.view.dimensionValueCode').d('维度值编码'),
      },
      {
        name: 'dimensionLov',
        type: 'object',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        ...lovProps,
        required: true,
        label: intl.get('smpc.ecPriceMonitor.view.dimensionValueName').d('维度值名称'),
      },
      {
        name: 'dimensionValue',
        bind: `dimensionLov.${lovProps.valueField}`,
      },
      {
        name: 'dimensionValueName',
        bind: `dimensionLov.${lovProps.textField}`,
      },
    ],
    queryFields: [
      {
        name: 'dimensionValueCode',
        label: codeLabel,
        display: true,
      },
      {
        name: 'dimensionValueName',
        label: nameLabel,
        display: true,
      },
      {
        name: 'monitorDimensionId',
        label: intl.get('hzero.common.date.createdDate').d('创建时间'),
        sortFlag: true,
        visible: false,
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-dimensions`,
        method: 'GET',
        data: { ...data, monitorStrategyId, monitorType },
      }),
      submit: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-dimensions`,
        method: 'POST',
        data: data.map((m) => ({ ...m, monitorStrategyId, tenantId: organizationId })),
      }),
      destroy: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-dimensions`,
        method: 'DELETE',
        data,
      }),
    },
  };
}
