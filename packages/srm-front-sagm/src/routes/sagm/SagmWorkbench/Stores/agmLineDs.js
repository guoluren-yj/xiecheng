import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { maxSAGMMessageValidator } from '@/utils/validator';

export default function getAgmLineDs(config = {}, dsProps = {}) {
  const organizationId = getCurrentOrganizationId();
  const { url, queryParams = {} } = config;
  return {
    autoQuery: false,
    selection: 'multiple',
    primaryKey: 'agreementLineId',
    cacheSelection: true,
    ...dsProps,
    fields: [
      { name: 'effectiveFlag' },
      {
        name: 'supplierCompanyName',
        bind: 'skuLov.supplierCompanyName',
        label: intl.get('sagm.common.model.supplier').d('供应商'),
      },
      { name: 'orgId', label: intl.get('sagm.common.view.organization').d('组织') },
      {
        name: 'skuLov',
        type: 'object',
        ignore: 'always',
        required: true,
        lovCode: 'SMPC.PUR_SKU_URL',
        valueField: 'skuId',
        textField: 'skuCode',
        lovPara: {
          tenantId: organizationId,
          agreementHeaderId: queryParams.agreementHeaderId,
        },
        label: intl.get('sagm.common.view.productCode').d('商品编码'),
      },
      {
        name: 'skuId',
        bind: 'skuLov.skuId',
      },
      {
        name: 'skuCode',
        type: 'string',
        bind: 'skuLov.skuCode',
        label: intl.get('sagm.common.view.productCode').d('商品编码'),
      },
      {
        name: 'thirdSkuId',
        bind: 'skuLov.thirdSkuCode',
        label: intl.get('sagm.common.view.thirdProductCode').d('第三方商品编码'),
      },
      {
        name: 'skuName',
        bind: 'skuLov.skuName',
        label: intl.get('sagm.common.view.skuName').d('商品名称'),
      },
      {
        name: 'categoryName',
        bind: 'skuLov.categoryName',
        label: intl.get('sagm.common.view.platformCategory').d('平台分类'),
      },
      {
        name: 'directoryName',
        bind: 'skuLov.catalogName',
        label: intl.get('sagm.common.model.catalog').d('目录'),
      },
      {
        name: 'marketPrice',
        type: 'number',
        bind: 'skuLov.marketPrice',
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
        name: 'priceBatchQuantity',
        type: 'number',
        label: intl.get('sagm.common.model.priceBatchQuantity').d('价格批量'),
        min: 1,
        defaultValue: 1,
        step: 1,
        required: true,
        validator: maxSAGMMessageValidator,
      },
      {
        name: 'currencyName',
        bind: 'skuLov.currencyName',
        label: intl.get('sagm.common.view.currency').d('币种'),
      },
      {
        name: 'taxRate',
        type: 'number',
        bind: 'skuLov.taxRate',
        label: intl.get('sagm.common.view.taxRate').d('税率'),
      },
      {
        name: 'uomName',
        bind: 'skuLov.uomName',
        label: intl.get('sagm.common.model.uom').d('单位'),
      },
      {
        name: 'strategyName',
        label: intl.get('sagm.common.view.priceStragegy').d('价格策略'),
      },
      {
        name: 'versionNum',
        label: intl.get('sagm.common.view.priceStragegyVersion').d('策略版本号'),
      },
      {
        name: 'addPricePercent',
        type: 'number',
        label: intl.get('sagm.common.view.addPricePercent').d('加价百分比'),
      },
      {
        name: 'adjustDetailsMeaning',
        label: intl.get('sagm.common.view.adjustDirection').d('调价方向'),
      },
      {
        name: 'overlinePriceEnableMeaning',
        label: intl.get('sagm.common.model.overlinePriceEnable').d('可超过划线价'),
      },
      {
        name: 'records',
        label: intl.get('sagm.common.view.priceHistoryRecord').d('价格历史记录'),
      },
      {
        name: 'agreementHeaderNum',
        label: intl.get('sagm.common.model.agreementCode').d('协议编码'),
      },
      {
        name: 'agreementHeaderName',
        label: intl.get('sagm.saleAgreement.model.agreementName').d('协议名称'),
      },
      {
        name: 'proxyCompanyName',
        label: intl.get('sagm.saleAgreement.view.saleMainBody').d('销售主体'),
      },
      {
        name: 'agreementHeaderTypeMeaning',
        label: intl.get('sagm.saleAgreement.model.agreementType').d('协议类型'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('sagm.common.view.creationDate').d('创建时间'),
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'skuLov') {
          const {
            priceType,
            sourceFrom,
            categoryId: catalogId,
            agreementLineId: purAgreementLineId,
          } = value || {};
          record.set({
            catalogId,
            purAgreementLineId,
            priceType: sourceFrom === 'CATA' ? priceType : 'REAL_TIME_PRICE',
          });
        }
      },
    },
    transport: {
      read: ({ data }) => ({
        url: url || `/sagm/v1/${organizationId}/sale-agreement-lines`,
        method: 'GET',
        data: { ...data, ...queryParams },
      }),
      submit: {
        url: `/sagm/v1/${organizationId}/sale-agreement-lines`,
        method: 'POST',
      },
      destroy: () => ({
        url: `/sagm/v1/${organizationId}/sale-agreement-lines`,
        method: 'DELETE',
      }),
    },
  };
}
