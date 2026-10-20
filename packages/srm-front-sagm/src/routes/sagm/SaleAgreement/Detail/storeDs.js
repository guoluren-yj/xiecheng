// import { DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 将字符串的1,0转化
function getNumber(value) {
  return value ? +value : value;
}

const baseInfoDs = () => ({
  fields: [
    {
      name: 'agreementHeaderNum',
      label: intl.get('sagm.saleAgreement.model.agreementNum').d('协议编号'),
    },
    {
      name: 'agreementHeaderName',
      label: intl.get('sagm.saleAgreement.model.agreementName').d('协议名称'),
      required: true,
    },
    {
      name: 'agreementHeaderType',
      label: intl.get('sagm.saleAgreement.model.agreementType').d('协议类型'),
      lookupCode: 'SAGM.AGREEMENT_HEADER_TYPE',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('agreementHeaderId'),
      },
    },
    {
      name: 'originalSupplierType',
      label: intl.get('sagm.saleAgreement.view.sourceSupplierType').d('原始供应商类型'),
      lookupCode: 'SMAL.SUPPLIER_SOURCE_FROM',
      // required: true,
    },
    {
      name: 'proxyCompanyLov',
      label: intl.get('sagm.saleAgreement.view.saleMainBody').d('销售主体'),
      type: 'object',
      required: true,
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'proxyCompanyId',
      bind: 'proxyCompanyLov.companyId',
    },
    {
      name: 'proxyCompanyName',
      bind: 'proxyCompanyLov.companyName',
    },
    {
      name: 'showSupplierType',
      label: intl.get('sagm.saleAgreement.model.mallSupplierShow').d('商城供应商展示'),
      lookupCode: 'SAGM.SHOW_SUPPLIER_TYPE',
      defaultValue: 'ORIGINAL_SUPPLIER',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('agreementHeaderType') === 'RECEIVE',
      },
    },
    {
      name: 'realName',
      label: intl.get('sagm.common.model.createName').d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get('sagm.common.model.creationTime').d('创建时间'),
    },
    {
      name: 'validDateFrom',
      min: moment().format(DATETIME_MIN),
      max: 'validDateTo',
      type: 'dateTime',
      label: intl.get('sagm.common.model.dateFrom').d('有效期从'),
    },
    {
      name: 'validDateTo',
      min: 'validDateFrom',
      type: 'dateTime',
      label: intl.get('sagm.common.model.dateTo').d('有效期至'),
      computedProps: {
        min: ({ record }) => record.get('validDateFrom') || moment().format(DATETIME_MIN),
      },
    },
    {
      name: 'paymentType',
      lookupCode: 'SAGM.PAYMENT_TYPE',
      label: intl.get('sagm.common.model.paymentType').d('支付方式'),
      computedProps: {
        required: ({ record }) => record.get('agreementHeaderType') === 'MEMBER',
      },
    },
    {
      name: 'paymentMethod',
      lookupCode: 'SAGM.PAYMENT_METHOD',
      label: intl.get('sagm.common.model.paymentType').d('支付方式'),
      computedProps: {
        required: ({ record }) =>
          !['MEMBER', 'RECEIVE'].includes(record.get('agreementHeaderType')),
      },
    },
    {
      name: 'pointsTypeId',
      textField: 'pointsTypeName',
      valueField: 'pointsTypeId',
      lookupUrl: `/sigl/v1/${organizationId}/points-types/list-no-cache`,
      label: intl.get('sagm.common.view.hasPotinsType').d('支持的积分类型'),
      computedProps: {
        required: ({ record }) =>
          record.get('agreementHeaderType') === 'MEMBER' &&
          record.get('paymentType') !== 'CASH_PAYMENT',
      },
    },
    {
      name: 'inventoryLov',
      ignore: 'always',
      required: true,
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      valueField: 'organizationId',
      textField: 'organizationName',
      dynamicProps: {
        lovPara: ({ record }) => ({ companyId: record.get('proxyCompanyId') }),
        required: ({ record }) => record.get('agreementHeaderType') !== 'RECEIVE',
      },
      label: intl.get('sagm.common.model.inventory.organization').d('库存组织'),
    },
    {
      name: 'invOrganizationId',
      bind: 'inventoryLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'inventoryLov.organizationName',
    },
    {
      name: 'purchaseLov',
      ignore: 'always',
      type: 'object',
      required: true,
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      valueField: 'purchaseOrgId',
      textField: 'organizationName',
      label: intl.get('sagm.common.model.purchase.organization').d('采购组织'),
      dynamicProps: {
        required: ({ record }) => record.get('agreementHeaderType') !== 'RECEIVE',
      },
    },
    {
      name: 'purOrganizationId',
      bind: 'purchaseLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationName',
      bind: 'purchaseLov.organizationName',
    },
    {
      name: 'remark',
      label: intl.get('sagm.common.model.remark').d('备注'),
    },
    {
      name: 'saleAgreementInventories',
      type: 'object',
      multiple: true,
      lovCode: 'HPFM.INVENTORY',
      lovPara: { tenantId: organizationId, enabledFlag: 1 },
      valueField: 'inventoryId',
      textField: 'inventoryName',
      dynamicProps: {
        required: ({ record }) => record.get('agreementHeaderType') === 'RECEIVE',
      },
      label: intl.get('sagm.common.view.reveiveInventory').d('领用库房'),
    },
    {
      name: 'autoLabelFlag',
      lookupCode: 'HPFM.FLAG',
      dynamicProps: {
        required: ({ record }) => record.get('agreementHeaderType') === 'RECEIVE',
      },
      label: intl.get('sagm.common.view.autoLabel').d('自动打标'),
    },
    {
      name: 'labelLov',
      type: 'object',
      lovCode: 'SMPC.SKU_LABEL',
      ignore: 'always',
      valueField: 'labelId',
      textField: 'labelName',
      lovPara: { tenantId: organizationId, enabledFlag: 1 },
      label: intl.get('sagm.common.view.skuLabel').d('商品标签'),
      dynamicProps: {
        required: ({ record }) =>
          getNumber(record.get('autoLabelFlag')) && record.get('agreementHeaderType') === 'RECEIVE',
        disabled: ({ record }) => !getNumber(record.get('autoLabelFlag')),
      },
    },
    {
      name: 'skuLabelName',
      bind: 'labelLov.labelName',
    },
    {
      name: 'skuLabelId',
      bind: 'labelLov.labelId',
    },
  ],
  events: {
    update: ({ record, name, value, oldValue }) => {
      if (name === 'agreementHeaderType' && value === 'RECEIVE') {
        record.set('showSupplierType', 'SALES_BODY');
      }
      // 公司变更
      if (name === 'proxyCompanyLov' && record.get('inventoryLov')) {
        if ((value && oldValue && value.companyId !== oldValue.companyId) || !value) {
          record.set('inventoryLov', null);
        }
      }
      // 库存组织变更
      if (name === 'inventoryLov' && value && !record.get('proxyCompanyLov')) {
        record.set('proxyCompanyId', value.companyId);
        record.set('proxyCompanyName', value.companyName);
      }
      // 清空积分类型
      if (
        (name === 'agreementHeaderType' && value !== 'MEMBER') ||
        (name === 'paymentType' && value === 'CASH_PAYMENT')
      ) {
        record.set('pointsTypeId', null);
      }
    },
  },
});

const strategyDs = () => ({
  autoQuery: false,
  selection: false,
  paging: false,
  autoLocateFirst: false,
  autoLocateAfterCreate: false,
  fields: [
    {
      name: 'strategyCode',
      label: intl.get('sagm.saleAgreement.view.priceStrategyCode').d('价格策略编码'),
    },
    {
      name: 'strategyName',
      label: intl.get('sagm.saleAgreement.view.priceStrategyName').d('价格策略名称'),
    },
    {
      name: 'versionNum',
      label: intl.get('sagm.saleAgreement.view.versionNum').d('版本号'),
      type: 'number',
    },
    {
      name: 'strategyDetail',
      label: intl.get('sagm.priceStrategy.view.strategyDetail').d('策略明细'),
    },
    {
      name: 'priority',
      label: intl.get('sagm.common.view.priority').d('优先级'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-price-strategy-lines`,
      method: 'GET',
    },
  },
});

const getQueryFields = () => {
  const fields = [
    {
      name: 'category',
      type: 'object',
      label: intl.get('sagm.common.view.platformCategory').d('平台分类'),
      lovCode: 'SMPC.CATEGORY',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
    },
    {
      name: 'skuLov',
      type: 'object',
      ignore: 'always',
      label: intl.get('sagm.common.view.product').d('商品'),
      lovCode: 'SMPC.SKU_VIEW',
      lovPara: { isLov: 1, tenantId: organizationId },
    },
    {
      name: 'skuId',
      bind: 'skuLov.skuId',
    },
    {
      name: 'catalogId',
      bind: 'category.categoryId',
    },
    {
      name: 'supplier',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMAL.PRODUCT_SUPPLIER',
      lovPara: { companyId: -1, tenantId: organizationId },
      valueField: 'supplierCompanyId',
      textField: 'supplierCompanyName',
      label: intl.get('sagm.common.model.supplier').d('供应商'),
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplier.supplierCompanyId',
    },
    {
      name: 'unit',
      type: 'object',
      label: intl.get('sagm.common.view.organization').d('组织'),
      ignore: 'always',
      lovCode: 'SMAL.UNIT',
      lovPara: { enabledFlag: 1 },
    },
    {
      name: 'orgId',
      bind: 'unit.unitId',
    },
    // {
    //   name: 'dimension',
    //   type: 'object',
    //   label: intl.get('sagm.common.view.productCode').d('自定义维度'),
    //   lovCode: 'SAGM.STRATEGY_DIMENSIONS',
    //   filters: ['ec'],
    //   transformRequest: (_, record) => (record || {}).strategyDimensionId,
    // },
    {
      name: 'directory',
      label: intl.get('sagm.common.view.directory').d('目录'),
      type: 'object',
      lovCode: 'SMPC.CATALOG_THREE',
      valueField: 'catalogId',
      textField: 'catalogName',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
    },
    {
      name: 'directoryId',
      bind: 'directory.catalogId',
    },
    {
      name: 'strategyLov',
      label: intl.get('sagm.common.view.priceStragegy').d('价格策略'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SAGM.SALE_PRICE_STRATEGY',
      valueField: 'priceStrategyId',
      textField: 'strategyName',
      lovPara: { tenantId: organizationId, statusCode: 'EXECUTED' },
    },
    {
      name: 'priceStrategyId',
      bind: 'strategyLov.priceStrategyId',
    },
  ];
  return fields;
};

const saleLineQueryDs = () => ({ fields: getQueryFields() });

const saleLineDs = () => ({
  autoQuery: false,
  selection: false,
  paging: false,
  autoLocateFirst: false,
  autoLocateAfterCreate: false,
  fields: [
    // {
    //   name: 'dimension',
    //   label: intl.get('sagm.saleAgreement.view.customPriceDimension').d('自定义价格维度'),
    // },
    { name: 'supplierCompanyName', label: intl.get('sagm.common.model.supplier').d('供应商') },
    { name: 'org', label: intl.get('sagm.common.view.organization').d('组织') },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('sagm.common.view.productCode').d('商品编码'),
    },
    {
      name: 'thirdSkuId',
      label: intl.get('sagm.common.view.thirdProductCode').d('第三方商品编码'),
    },
    {
      name: 'skuName',
      label: intl.get('sagm.common.view.skuName').d('商品名称'),
    },
    {
      name: 'categoryName',
      label: intl.get('sagm.common.view.platformCategory').d('平台分类'),
    },
    {
      name: 'directoryName',
      label: intl.get('sagm.common.view.directory').d('目录'),
    },
    {
      name: 'marketPrice',
      type: 'number',
      label: intl.get('sagm.common.view.marketPrice').d('市场价'),
    },
    {
      name: 'purchasePrice',
      type: 'number',
      label: intl.get('sagm.common.view.purchasePrice').d('采购价'),
    },
    {
      name: 'priceType',
      label: intl.get('sagm.common.view.isLadderPrice').d('是否有阶梯价格'),
    },
    {
      name: 'saleAgreementLineLadders',
      label: intl.get('sagm.common.view.ladderPrice').d('阶梯价格'),
    },
    {
      name: 'sellingPrice',
      type: 'number',
      label: intl.get('sagm.common.view.salePrice').d('销售价'),
    },
    {
      name: 'currencyName',
      label: intl.get('sagm.common.view.currency').d('币种'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('sagm.common.view.taxRate').d('税率'),
    },
    {
      name: 'strategyName',
      label: intl.get('sagm.common.view.priceStragegy').d('价格策略'),
    },
    {
      name: 'addPricePercent',
      type: 'number',
      label: intl.get('sagm.common.view.addPricePercent').d('加价百分比'),
    },
    {
      name: 'option',
      label: intl.get('sagm.common.view.priceHistoryRecord').d('价格历史记录'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  // queryFields: getQueryFields(type),
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-agreement-lines`,
      method: 'GET',
    },
  },
});

const orderLimitDs = (agreementHeaderId) => ({
  // autoQuery: true,
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sagm.common.model.labelId').d('会员标签'),
      name: 'labelIdObj',
      type: 'object',
      lovCode: 'SAGM.POINTS_MEMBER_LABEL',
      textField: 'labelName',
      valueField: 'labelId',
      ignore: 'always',
      required: true,
      lovPara: {
        agreementHeaderId,
      },
    },
    {
      name: 'labelId',
      bind: 'labelIdObj.labelId',
    },
    {
      name: 'labelName',
      bind: 'labelIdObj.labelName',
    },
    {
      label: intl.get('sagm.common.model.pointsLimit').d('额度（积分/人）'),
      name: 'pointsLimit',
      type: 'number',
      min: 0,
      required: true,
      max: 10000000000000000000,
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-points-limits`,
      method: 'GET',
    },
    destroy: ({ data }) => ({
      url: `/sagm/v1/${organizationId}/sale-points-limits`,
      method: 'DELETE',
      data: data[0],
    }),
  },
});

const ladderDs = () => ({
  paging: false,
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get('sagm.common.model.lineNumber').d('行号'),
      name: 'lineNum',
    },
    {
      label: intl.get('sagm.common.model.numberFrom').d('数量从(>=)'),
      name: 'ladderFrom',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.numberTo').d('数量至(<)'),
      name: 'ladderTo',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.view.purchasePrice').d('采购价'),
      name: 'purchasePrice',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.salePrice').d('销售价'),
      name: 'salePrice',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.noTaxPrice').d('未税单价'),
      name: 'unitPrice',
      type: 'number',
    },
    {
      label: intl.get('sagm.common.model.taxPrice').d('含税单价'),
      name: 'taxPrice',
      type: 'number',
    },
  ],
});

const invoiceDs = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'membelLabelLov',
      lovCode: 'SAGM.MEMBER_LABEL',
      ignore: 'always',
      type: 'object',
      required: true,
      textField: 'labelName',
      valueField: 'labelId',
      label: intl.get('sagm.common.view.memberLabel').d('会员标签'),
    },
    { name: 'labelId', bind: 'membelLabelLov.labelId' },
    { name: 'labelName', bind: 'membelLabelLov.labelName' },
    {
      name: 'invoiceEntityLov',
      ignore: 'always',
      required: true,
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      lovPara: { tenantId: organizationId },
      label: intl.get('sagm.common.view.invoiceEntity').d('开票主体'),
      textField: 'companyName',
      valueField: 'companyId',
    },
    { name: 'companyName', bind: 'invoiceEntityLov.companyName' },
    { name: 'companyId', bind: 'invoiceEntityLov.companyId' },
    {
      name: 'inventoryLov',
      ignore: 'always',
      required: true,
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      valueField: 'organizationId',
      textField: 'organizationName',
      dynamicProps: {
        lovPara: ({ record }) => ({ companyId: record.get('companyId') }),
      },
      label: intl.get('sagm.common.model.inventory.organization').d('库存组织'),
    },
    {
      name: 'invOrganizationId',
      bind: 'inventoryLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'inventoryLov.organizationName',
    },
    {
      name: 'purchaseLov',
      ignore: 'always',
      type: 'object',
      required: true,
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      valueField: 'purchaseOrgId',
      textField: 'organizationName',
      label: intl.get('sagm.common.model.purchase.organization').d('采购组织'),
    },
    {
      name: 'purOrganizationId',
      bind: 'purchaseLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationName',
      bind: 'purchaseLov.organizationName',
    },
    { name: 'action', label: intl.get('hzero.common.action').d('操作') },
  ],
  events: {
    update: ({ record, name, value, oldValue }) => {
      // 公司变更
      if (name === 'invoiceEntityLov' && record.get('inventoryLov')) {
        if ((value && oldValue && value.companyId !== oldValue.companyId) || !value) {
          record.set('inventoryLov', null);
        }
      }
      // 库存组织变更
      if (name === 'inventoryLov' && value && !record.get('invoiceEntityLov')) {
        record.set('companyId', value.companyId);
        record.set('companyId', value.companyName);
      }
    },
  },
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-invoicing-ruless`,
      method: 'GET',
    },
    destroy: ({ data }) => ({
      url: `/sagm/v1/${organizationId}/sale-invoicing-ruless`,
      method: 'DELETE',
      data: data[0],
    }),
  },
});

export { baseInfoDs, strategyDs, saleLineDs, invoiceDs, ladderDs, saleLineQueryDs, orderLimitDs };
