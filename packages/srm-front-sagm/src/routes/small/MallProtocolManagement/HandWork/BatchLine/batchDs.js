import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { precisionUpdate } from '@/utils/precision';
import { maxSAGMMessageValidator } from '@/utils/validator';

const organizationId = getCurrentOrganizationId();

//  disabled 引用价格库不可编辑
export default function getBatchDs(disabled, supplierTenantId) {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'catalogLov',
        type: 'object',
        textField: 'catalogName',
        valueField: 'catalogId',
        label: intl.get('sagm.common.model.catalog').d('目录'),
      },
      {
        name: 'catalogId',
        bind: 'catalogLov.catalogId',
      },
      {
        name: 'catalogName',
        bind: 'catalogLov.catalogName',
      },
      {
        name: 'validDateFrom',
        type: 'date',
        label: intl.get('small.common.model.dateFrom').d('有效期从'),
      },
      {
        name: 'validDateTo',
        type: 'date',
        label: intl.get('small.common.model.dateTo').d('有效期至'),
      },
      {
        name: 'uomLov',
        type: 'object',
        disabled,
        lovCode: 'SMDM.UOM',
        valueField: 'uomId',
        textField: 'uomCodeAndName',
        label: intl.get('small.common.model.uom').d('单位'),
      },
      {
        name: 'uomId',
        bind: 'uomLov.uomId',
      },
      {
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        bind: 'uomLov.uomCodeAndName',
      },
      {
        name: 'uomPrecision',
        bind: 'uomLov.uomPrecision',
      },
      {
        name: 'taxLov',
        type: 'object',
        textField: 'taxRate',
        valueField: 'taxId',
        lovCode: 'SMDM.TAX',
        disabled,
        label: intl.get('small.common.model.tax').d('税率'),
        dynamicProps: {
          required: ({ record }) => record.get('priceType'),
        },
      },
      {
        name: 'taxId',
        bind: 'taxLov.taxId',
      },
      {
        name: 'tax',
        bind: 'taxLov.taxRate',
      },
      {
        name: 'currencyLov',
        type: 'object',
        textField: 'currencyName',
        valueField: 'currencyId',
        lovCode: 'SMDM.CURRENCY',
        disabled,
        label: intl.get('small.common.model.currency').d('币种'),
      },
      {
        name: 'currencyId',
        bind: 'currencyLov.currencyId',
      },
      {
        name: 'currencyCode',
        bind: 'currencyLov.currencyCode',
      },
      {
        name: 'currencyName',
        bind: 'currencyLov.currencyName',
      },
      {
        name: 'defaultPrecision',
        bind: 'currencyLov.defaultPrecision',
      },
      {
        name: 'financialPrecision',
        bind: 'currencyLov.financialPrecision',
      },
      {
        name: 'priceType',
        lookupCode: 'SMAL.AGREEMENT_PRICE_TYPE',
        disabled,
        label: intl.get('small.common.model.priceType').d('价格类型'),
      },
      {
        label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
        name: 'unitPrice',
        type: 'number',
        min: 0,
        // max: '99999999999999999999',
        dynamicProps: {
          required: ({ record }) => record.get('priceType') === 'REGULAR_PRICE',
          disabled: ({ record }) => disabled || record.get('priceType') === 'LADDER_PRICE',
        },
        validator: maxSAGMMessageValidator,
      },
      {
        label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
        name: 'taxPrice',
        type: 'number',
        min: 0,
        // max: '99999999999999999999',
        dynamicProps: {
          required: ({ record }) => record.get('priceType') === 'REGULAR_PRICE',
          disabled: ({ record }) => disabled || record.get('priceType') === 'LADDER_PRICE',
        },
        validator: maxSAGMMessageValidator,
      },
      {
        name: 'priceBatchQuantity',
        type: 'number',
        label: intl.get('sagm.common.model.priceBatchQuantity').d('价格批量'),
        min: 1,
        step: 1,
        disabled,
        validator: maxSAGMMessageValidator,
      },
      {
        name: 'agreementLadders',
        type: 'object',
      },
      {
        name: 'agreementQuantity',
        type: 'number',
        min: 0,
        label: intl.get('small.common.model.agreementQuantity').d('协议数量'),
        validator: maxSAGMMessageValidator,
      },
      {
        name: 'orderQuantity',
        type: 'number',
        min: 0,
        dynamicProps: {
          max: ({ record }) => {
            return record.get('purchaseQuantityLimit');
          },
          min: ({ record }) => record.get('minPackageQuantity'),
        },
        validator: maxSAGMMessageValidator,
        defaultValidationMessages: {
          rangeOverflow: intl
            .get('small.common.view.orderQuantityOverMax')
            .d('起订量不能大于最大购买量'),
          rangeUnderflow: intl
            .get('small.common.view.minOrderQuantityHelp')
            .d('起订量应大于等于最小包装量'),
        },
        label: intl.get('small.common.model.orderQuantity').d('起订量'),
      },
      {
        name: 'minPackageQuantity',
        type: 'number',
        min: 0,
        dynamicProps: {
          max: ({ record }) => {
            return record.get('orderQuantity');
          },
        },
        label: intl.get('small.common.model.minPackageQuantity').d('最小包装量'),
        validator: maxSAGMMessageValidator,
        defaultValidationMessages: {
          rangeOverflow: intl
            .get('small.common.view.minPackageQuantityOverMax')
            .d('最小包装量应小于等于起订量'),
        },
      },
      {
        name: 'purchaseQuantityLimit',
        type: 'number',
        min: 0,
        validator: maxSAGMMessageValidator,
        dynamicProps: {
          min: ({ record }) => {
            return record.get('orderQuantity') || 1;
          },
        },
        defaultValidationMessages: {
          rangeUnderflow: intl
            .get('small.common.view.purchaseQuantityLimitUnderMin')
            .d('最大购买量不能小于起订量'),
        },
        label: intl.get('small.common.model.purchaseQuantityLimit').d('最大购买量'),
      },
      {
        name: 'purchaseAmountLimit',
        type: 'number',
        min: 1,
        // max: '99999999999999999999',
        validator: maxSAGMMessageValidator,
        label: intl.get('small.common.model.purchaseAmountLimit').d('采购额上限'),
      },
      {
        name: 'deliverRegionLov',
        type: 'object',
        textField: 'regionName',
        valueField: 'regionId',
        multiple: true,
        label: intl.get('small.common.model.postRegion').d('送货区域'),
      },
      {
        name: 'buyOrganizationLov',
        type: 'object',
        textField: 'unitCodeName',
        valueField: 'unitId',
        multiple: true,
        label: intl.get('small.common.model.canBuyOrganization').d('可采买组织'),
      },
      {
        name: 'priceSourceFromNum',
        label: intl.get('sagm.common.model.sourceFromNum').d('合同号'),
        disabled,
        maxLength: 100,
      },
      {
        name: 'priceSourceFromLnNum',
        label: intl.get('sagm.common.model.sourceFromLnNum').d('合同行号'),
        disabled,
        maxLength: 100,
      },
      {
        name: 'deliveryDay',
        type: 'number',
        step: 1,
        min: 0,
        label: intl.get('small.common.model.deliveryDay').d('供货周期（天）'),
      },
      {
        name: 'guaranteeDay',
        type: 'number',
        step: 1,
        min: 0,
        label: intl.get('small.common.model.guaranteeDay').d('质保期（天）'),
      },
      {
        name: 'remark',
        label: intl.get('small.common.model.remark').d('备注'),
      },
      // {
      //   name: 'isFree',
      //   type: 'boolean',
      //   label: intl.get('small.common.model.isFree').d('是否包邮'),
      // },
      {
        name: 'postageLov',
        label: intl.get('small.common.view.freightRule').d('运费规则'),
        type: 'object',
        // disabled,
        textField: 'postageName',
        valueField: 'postageId',
        lovCode: 'SMAL.POSTAGE_SUPPLIER',
        lovPara: { supplierTenantId, enabled: 1, additionalType: 'FREIGHT' },
        lovQueryAxiosConfig: (code, _, { data }) => {
          return {
            url: `/sagm/v1/${organizationId}/postages/supplier/${supplierTenantId}?lovCode=${code}`,
            method: 'GET',
            data,
          };
        },
        optionsProps: {
          modifiedCheck: false,
          events: {
            load: ({ dataSet }) => {
              if (dataSet.currentPage === 1) {
                dataSet.create(
                  {
                    postageId: -1,
                    postageName: intl.get('small.common.view.free').d('包邮'),
                  },
                  0
                );
              }
              // 翻页清除缓存
              dataSet.clearCachedRecords();
            },
          },
        },
      },
      {
        name: 'postageId',
        bind: 'postageLov.postageId',
      },
      {
        name: 'postageName',
        bind: 'postageLov.postageName',
      },
      {
        label: intl.get('small.common.view.installExpense').d('安装费'),
        name: 'installLov',
        type: 'object',
        textField: 'postageName',
        valueField: 'postageId',
        lovCode: 'SMAL.INSTALL_SUPPLIER',
        dynamicProps: {
          lovPara: () => ({
            supplierTenantId,
            enabled: 1,
            additionalType: 'INSTALL',
          }),
        },
        transformResponse: (_, record) => {
          const { install } = record;
          return install
            ? {
                postageId: install.postageId,
                postageName: install.postageName,
              }
            : null;
        },
      },
      {
        name: 'priceHiddenFlag',
        // lookupCode: 'HPFM.FLAG',
        type: 'boolean',
        label: intl.get('sagm.common.model.isHiddenPrice').d('隐藏价格'),
      },
    ],
    events: {
      update: (para) => {
        const { name, value, record, oldValue } = para;
        if (name === 'priceType' && oldValue === 'LADDER_PRICE' && value !== 'LADDER_PRICE') {
          record.set('agreementLadders', null);
        }
        if (name === 'remark') {
          record.set('remarkMeaning', value);
        }
        const quantityNames = [
          'agreementQuantity',
          'orderQuantity',
          'minPackageQuantity',
          'purchaseQuantityLimit',
        ];
        precisionUpdate({
          ...para,
          changeFields: quantityNames,
          updateField: 'uomLov',
          precisionField: 'uomPrecision',
        });
        // const priceNames = ['unitPrice', 'taxPrice'];
        // precisionUpdate({
        //   ...para,
        //   type: 'currency',
        //   updateField: 'currencyLov',
        //   precisionField: 'defaultPrecision',
        //   changeFields: priceNames,
        // });
        precisionUpdate({
          ...para,
          type: 'currency',
          updateField: 'currencyLov',
          precisionField: 'financialPrecision',
          changeFields: ['purchaseAmountLimit'],
        });
      },
    },
  };
}
