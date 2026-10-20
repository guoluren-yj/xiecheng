import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const agreementLineDS = (url) => ({
  primaryKey: 'agreementLineId',
  selection: false,
  autoQuery: false,
  queryFields: [
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('small.common.model.itemCodeAndName').d('物料编码/名称'),
    },
    {
      name: 'effectiveFlag',
      type: 'number',
      lookupCode: 'SMAL.AGREEMENT_LINE_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'catalogId',
      type: 'object',
      label: intl.get('small.common.view.catalog').d('目录'),
      lovCode: 'SMPC.CATALOG_THREE',
      lovPara: { tenantId: organizationId },
      textField: 'catalogName',
      valueField: 'catalogId',
      transformRequest: (val) => (val || {}).catalogId,
    },
  ],
  fields: [
    {
      label: intl.get('small.common.model.lineNum').d('行号'),
      name: 'lineNum',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.item.code').d('物料编码'),
      name: 'itemLov',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.item.name').d('物料名称'),
      name: 'itemName',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.itemCategory').d('物料分类'),
      name: 'itemCategoryLov',
      type: 'string',
    },
    {
      label: intl.get('sagm.common.model.catalog').d('目录'),
      name: 'catalogLov',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.status').d('状态'),
      name: 'effectiveFlag',
      type: 'string',
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
      type: 'string',
    },
    {
      label: intl.get('small.common.model.tax').d('税率'),
      name: 'taxLov',
      type: 'number',
    },
    {
      label: intl.get('small.common.model.currency').d('币种'),
      name: 'currencyLov',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.priceType').d('价格类型'),
      name: 'priceType',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.noTaxPrice').d('未税单价'),
      name: 'unitPrice',
      type: 'number',
    },
    {
      label: intl.get('small.common.model.taxPrice').d('含税单价'),
      name: 'taxPrice',
      type: 'number',
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get('sagm.common.model.priceBatchQuantity').d('价格批量'),
    },
    {
      label: intl.get('small.common.model.ladderPrice').d('阶梯价格'),
      name: 'ladderFlag',
      type: 'number',
    },
    {
      label: intl.get('small.common.model.isHiddenPrice').d('是否隐藏价格'),
      name: 'priceHiddenFlag',
      lookupCode: 'HPFM.FLAG',
    },
    {
      label: intl.get('small.common.view.freightRule').d('运费规则'),
      name: 'postageLov',
      type: 'object',
    },
    {
      label: intl.get('small.common.view.installExpense').d('安装费'),
      name: 'installLov',
      type: 'object',
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
      label: intl.get('small.common.model.purchaseQuantityLimit').d('最大购买量'),
      name: 'purchaseQuantityLimit',
      type: 'number',
    },
    {
      label: intl.get('small.common.model.purchaseAmountLimit').d('采购额上限'),
      name: 'purchaseAmountLimit',
      type: 'number',
    },
    {
      label: intl.get('small.common.model.postRegion').d('送货区域'),
      name: 'deliverRegionLov',
      type: 'object',
    },
    {
      label: intl.get('small.common.model.canBuyOrganization').d('可采买组织'),
      name: 'buyOrganizationLov',
      type: 'object',
    },
    {
      name: 'priceSourceFromNum',
      label: intl.get('sagm.common.model.sourceFromNum').d('合同号'),
    },
    {
      name: 'priceSourceFromLnNum',
      label: intl.get('sagm.common.model.sourceFromLnNum').d('合同行号'),
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
      type: 'string',
    },
    {
      label: intl.get('small.common.model.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operation',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const { agreementStatus, effectiveFlag } = record.toData();
        if (['TERMINATED', 'DISABLED'].includes(agreementStatus) || effectiveFlag === -1) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: () => {
      const _url = url.replace('{organizationId}', `${organizationId}`);
      return {
        url: `/sagm/${_url}`,
        method: 'GET',
      };
    },
  },
});

export { agreementLineDS };
