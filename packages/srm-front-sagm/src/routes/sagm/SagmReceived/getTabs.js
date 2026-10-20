// tabs封装

import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { SRM_SAGM } from '_utils/config';
import AgmDetailTable from './AgmDetailTable';
import SkuDetailTable from './SkuDetailTable';
import HistoryTable from './HistoryTable';

const organizationId = getCurrentOrganizationId();
const supplierTenantId = getUserOrganizationId();

const getFields = () => [
  { name: 'agreementStatusMeaning', label: intl.get('hzero.common.status').d('状态') },
  { name: 'agreementNumber', label: intl.get('sagm.common.model.agreementCode').d('协议编码') },
  { name: 'agreementName', label: intl.get('small.common.model.agreementName').d('协议名称') },
  { name: 'versionNum', label: intl.get('small.common.model.version').d('版本') },
  {
    name: 'creationDate',
    label: intl.get('sagm.common.view.creationDate').d('创建时间'),
    type: 'date',
  },
  { name: 'companyName', label: intl.get('sagm.common.model.purchase').d('采购方') },
  { name: 'supplierCompanyName', label: intl.get('sagm.common.model.supplier').d('供应商') },
  {
    name: 'remark',
    label: intl.get('sagm.common.model.remark').d('备注'),
    transformResponse: (_, record) => record.remarkMeaning || record.remark,
  },
  { name: 'itemCode', label: intl.get('small.common.model.itemCode').d('物料编码') },
  { name: 'itemName', label: intl.get('small.common.model.item.name').d('物料名称') },
  { name: 'itemCategoryCode', label: intl.get('small.common.model.itemCategory').d('物料品类') },
  { name: 'uomName', label: intl.get('small.common.model.uom').d('单位') },
  {
    name: 'taxPrice',
    label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
    type: 'number',
  },
  {
    name: 'priceBatchQuantity',
    type: 'number',
    label: intl.get('sagm.common.model.priceBatchQuantity').d('价格批量'),
  },
  {
    name: 'currencyName',
    label: intl.get('sagm.common.model.currencyName').d('币种'),
  },
  {
    name: 'tax',
    label: intl.get('sagm.common.model.tax').d('税率'),
    type: 'number',
  },
  { name: 'validDate', title: intl.get('sagm.common.view.validDate').d('有效期') },
  {
    name: 'sourceFromMeaning',
    label: intl.get('small.common.model.documentSource').d('单据来源'),
  },
  {
    name: 'sourceFrom',
    lookupCode: 'SMAL.AGREEMENT_FROM',
    label: intl.get('small.common.model.documentSource').d('单据来源'),
  },
  {
    label: intl.get('small.common.model.lineNum').d('行号'),
    name: 'lineNum',
  },
  {
    label: intl.get('small.common.model.item.code').d('物料编码'),
    name: 'itemLov',
  },
  {
    label: intl.get('small.common.model.item.name').d('物料名称'),
    name: 'itemName',
  },
  {
    label: intl.get('small.common.model.itemCategory').d('物料品类'),
    name: 'itemCategoryLov',
  },
  {
    label: intl.get('sagm.common.model.catalog').d('目录'),
    name: 'catalogLov',
  },
  {
    label: intl.get('small.common.model.status').d('状态'),
    name: 'effectiveFlag',
  },
  {
    label: intl.get('small.common.model.dateFrom').d('有效期从'),
    type: 'date',
    name: 'validDateFrom',
  },
  {
    label: intl.get('small.common.model.dateTo').d('有效期至'),
    type: 'date',
    name: 'validDateTo',
  },
  {
    label: intl.get('small.common.model.uom').d('单位'),
    name: 'uomLov',
  },
  {
    label: intl.get('small.common.model.tax').d('税率'),
    name: 'taxLov',
    type: 'number',
  },
  {
    label: intl.get('small.common.model.currency').d('币种'),
    name: 'currencyLov',
  },
  {
    label: intl.get('small.common.model.priceType').d('价格类型'),
    name: 'priceType',
  },
  {
    label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
    name: 'unitPrice',
    type: 'number',
  },
  {
    label: intl.get('small.common.model.ladderPrice').d('阶梯价格'),
    name: 'ladderFlag',
    type: 'number',
  },
  {
    label: intl.get('small.common.view.freightRule').d('运费规则'),
    name: 'postageLov',
  },
  {
    label: intl.get('small.common.view.installExpense').d('安装费'),
    name: 'installLov',
  },
  {
    label: intl.get('small.common.model.agreementQuantity').d('协议数量'),
    name: 'agreementQuantity',
    type: 'number',
  },
  {
    label: intl.get('small.common.model.orderQuantity').d('起订量'),
    name: 'orderQuantity',
    type: 'number',
  },
  {
    label: intl.get('small.common.model.minPackageQuantity').d('最小包装量'),
    name: 'minPackageQuantity',
    type: 'number',
  },
  {
    label: intl.get('small.common.model.postRegion').d('送货区域'),
    name: 'deliverRegionLov',
  },
  {
    label: intl.get('small.common.model.deliveryDay').d('供货周期（天）'),
    name: 'deliveryDay',
    type: 'number',
  },
  {
    label: intl.get('small.common.model.guaranteeDay').d('质保期（天）'),
    name: 'guaranteeDay',
    type: 'number',
  },
  {
    label: intl.get('small.common.model.priceFromNum').d('价格编号'),
    name: 'priceLibNumber',
  },
];

// 协议头ds配置
export const agmBaseInfoDs = ({ isHis, params = {}, dsConfig = {} }) => {
  const url = isHis
    ? `${SRM_SAGM}/v1/${organizationId}/agreement-hiss/supplier`
    : `${SRM_SAGM}/v1/${organizationId}/agreements`;
  return {
    autoQuery: false,
    selection: false,
    ...dsConfig,
    fields: getFields(),
    transport: {
      read({ data }) {
        return {
          url,
          method: 'GET',
          data: { ...data, ...params },
        };
      },
    },
  };
};

// 协议行ds配置
export const agmDetailLineDs = ({ isHis, params = {}, dsConfig = {} }) => {
  const url = isHis
    ? `${SRM_SAGM}/v1/${organizationId}/agreement-line-hiss`
    : `${SRM_SAGM}/v1/${organizationId}/agreement-lines/supplier`;
  return {
    autoQuery: false,
    selection: false,
    ...dsConfig,
    fields: getFields(),
    transport: {
      read({ data }) {
        return {
          url,
          method: 'GET',
          data: { ...data, ...params },
        };
      },
    },
  };
};

const skuDetailDs = (params) => ({
  autoQuery: false,
  pageSize: 20,
  fields: [
    ...getFields(),
    {
      name: 'shelfFlagMeaning',
      label: intl.get('sagm.common.model.productStatus').d('商品状态'),
    },
    {
      name: 'skuCode',
      label: intl.get('sagm.common.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      label: intl.get('sagm.common.model.skuName').d('商品名称'),
    },
    {
      name: 'skuUom',
      label: intl.get('sagm.common.model.skuUom').d('销售单位'),
    },
    {
      name: 'skuBrand',
      label: intl.get('sagm.common.model.skuBrand').d('商品品牌'),
    },
    {
      name: 'imagePath',
      label: intl.get('sagm.common.model.imagePath').d('商品图片'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SAGM}/v1/${organizationId}/agreement-details/supplier`,
        method: 'GET',
        data: { ...data, ...params },
      };
    },
  },
});

export default function getTabs(type) {
  const tenantPara =
    organizationId === supplierTenantId
      ? { supplierTenantId }
      : { tenantId: organizationId, supplierTenantId };
  // 目前查询数目的查询参数最好写在 params里， 或ds.setQueryParameter 设置
  const initTabs = [
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.protocolDetail').d('协议明细'),
      key: 'a',
      groupKey: 'detail',
      customizeUnitCode: 'SAGM.RECEIVED.LIST_PROTOCOL_DETAIL',
      searchBarCode: 'SAGM.RECEIVED.PROTOCOL_DETAIL.SEARCH_BAR',
      params: { ...tenantPara, searchFlag: 1, deleteFlag: 0 },
      getDataSetConfig: (params) => agmDetailLineDs({ params, dsConfig: { pageSize: 20 } }),
      url: `${SRM_SAGM}/v1/${organizationId}/agreement-lines/supplier`,
      tabComp: AgmDetailTable,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.productDetail').d('商品明细'),
      key: 'b',
      groupKey: 'detail',
      customizeUnitCode: 'SAGM.RECEIVED.LIST_SKU_DETAIL',
      searchBarCode: 'SAGM.RECEIVED.SKU_DETAIL.SEARCH_BAR',
      params: { ...tenantPara, searchFlag: 1 },
      getDataSetConfig: skuDetailDs,
      url: `${SRM_SAGM}/v1/${organizationId}/agreement-details/supplier`,
      tabComp: SkuDetailTable,
    },
    {
      tab: intl.get('sagm.common.model.historyVersion').d('历史版本'),
      key: 'c',
      groupKey: 'history',
      customizeUnitCode: 'SAGM.RECEIVED.LIST_HISTORY',
      searchBarCode: 'SAGM.RECEIVED.HISTORY.SEARCH_BAR',
      params: { ...tenantPara },
      getDataSetConfig: (params) =>
        agmBaseInfoDs({ params, isHis: true, dsConfig: { pageSize: 20 } }),
      url: `${SRM_SAGM}/v1/${organizationId}/agreement-hiss/supplier`,
      tabComp: HistoryTable,
    },
  ];
  if (type === 'custCode') {
    const codes = initTabs.map((m) => m.customizeUnitCode);
    return [...new Set(codes), 'SAGM.RECEIVED.BTNS'];
  }
  const tabs = initTabs.map((m) => {
    const {
      params,
      customizeUnitCode: tableCode,
      searchBarCode,
      getDataSetConfig = () => ({}),
    } = m;
    const customizeUnitCode = `${tableCode},${searchBarCode}`;
    const queryParams = { ...params, customizeUnitCode };
    const dataSetConfig = getDataSetConfig(queryParams);
    const dataSet = new DataSet(dataSetConfig);
    dataSet.setState('onlyQueryParam', queryParams);
    return { ...m, params: queryParams, dataSet };
  });
  return tabs;
}
