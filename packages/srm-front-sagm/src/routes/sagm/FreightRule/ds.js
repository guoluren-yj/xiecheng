import { toJS } from 'mobx';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { priceValidator, c7nBoundValidator } from '@/utils/validator';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  autoQuery: true,
  selection: false,
  pageSize: 20,
  // queryFields: [
  //   {
  //     name: 'postageName',
  //     label: intl.get('sagm.freight.view.freightRuleName').d('运费规则名称'),
  //   },
  //   {
  //     name: 'supplier',
  //     type: 'object',
  //     ignore: 'always',
  //     lovCode: 'SMAL.SUPPLIER_BY_PUR',
  //     lovPara: { tenantId: organizationId },
  //     label: intl.get('sagm.common.view.supplier').d('供应商'),
  //   },
  //   {
  //     name: 'supplierTenantId',
  //     bind: 'supplier.supplierTenantId',
  //   },
  //   {
  //     name: 'enabled',
  //     lookupCode: 'HPFM.ENABLED_FLAG',
  //     label: intl.get('hzero.common.status').d('状态'),
  //   },
  // ],
  fields: [
    {
      name: 'postageName',
      label: intl.get('sagm.freight.view.additionalName').d('附加费名称'),
    },
    {
      name: 'additionalTypeMeaning',
      label: intl.get('sagm.freight.view.additionalType').d('附加费类型'),
    },
    {
      name: 'supplierName',
      label: intl.get('sagm.common.view.supplierName').d('供应商名称'),
    },
    {
      name: 'pricingMethodMeaning',
      label: intl.get('sagm.freight.model.pricingMethod').d('计价方式'),
    },
    {
      name: 'itemName',
      label: intl.get('sagm.freight.model.additionalItem').d('附加费物料'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('sagm.common.view.tax').d('税率'),
    },
    {
      name: 'enabled',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'options',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `/sagm/v1/${organizationId}/postages/supplier`,
      method: 'GET',
      data: {
        ...data,
        customizeUnitCode: 'SAGM.FREIGHT_RULE.LIST.SEARCHBAR',
      },
    }),
  },
});

const formDs = () => ({
  fields: [
    {
      name: 'postageName',
      required: true,
      maxLength: 30,
      label: intl.get('sagm.freight.view.additionalExpenseName').d('附加费名称'),
    },
    {
      name: 'allSupplierFlag',
      label: intl.get('sagm.freight.view.allSupplierFlag').d('适用全部供应商'),
      trueValue: 1,
      falseValue: 0,
      type: 'boolean',
      defaultValue: 0,
    },
    {
      name: 'supplier',
      label: intl.get('sagm.common.view.supplier').d('供应商'),
      type: 'object',
      ignore: 'always',
      required: true,
      lovCode: 'SSLM.SUPPLIER',
      textField: 'supplierCompanyName',
      valueField: 'supplierCompanyId',
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        required: ({ record }) => !record.get('allSupplierFlag'),
        disabled: ({ record }) => record.get('allSupplierFlag'),
      },
    },
    {
      name: 'supplierTenantId',
      bind: 'supplier.supplierTenantId',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplier.supplierCompanyId',
    },
    {
      name: 'supplierName',
      bind: 'supplier.supplierCompanyName',
    },
    // 运费、安装费
    {
      name: 'additionalType',
      lookupCode: 'SAGM.ADDITIONAL_TYPE',
      required: true,
      maxLength: 30,
      defaultValue: 'FREIGHT',
      label: intl.get('sagm.freight.view.additionalType').d('附加费类型'),
    },
    {
      name: 'item',
      type: 'object',
      required: true,
      ignore: 'always',
      lovCode: 'SMAL.CUSTOMER_ITEM',
      valueField: 'itemId',
      textField: 'itemName',
      lovPara: { tenantId: organizationId },
      label: intl.get('sagm.freight.model.additionalItem').d('附加费物料'),
      dynamicProps: {
        required: ({ record }) => record.get('pricingMethod') !== 'OTHER_PAY',
      },
    },
    {
      name: 'itemId',
      bind: 'item.itemId',
    },
    {
      name: 'itemName',
      bind: 'item.itemName',
    },
    {
      name: 'tax',
      required: true,
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.TAX',
      valueField: 'taxId',
      textField: 'taxRate',
      label: intl.get('sagm.freight.view.additionalTax').d('附加费税率'),
      dynamicProps: {
        required: ({ record }) => record.get('pricingMethod') !== 'OTHER_PAY',
      },
    },
    {
      name: 'taxId',
      bind: 'tax.taxId',
    },
    {
      name: 'taxRate',
      bind: 'tax.taxRate',
    },
    {
      name: 'pricingMethod',
      required: true,
      label: intl.get('sagm.freight.model.pricingMethod').d('计价方式'),
      lookupCode: 'SMAL.AGREEMENT_PRICING_METHOD',
      defaultValue: 'ORDER_AMOUNT',
      dynamicProps: {
        disabled: ({ record }) => record.get('additionalType') === 'INSTALL',
      },
    },
    {
      name: 'description',
      label: intl.get('sagm.freight.view.pricingDescription').d('计费说明'),
      dynamicProps: {
        required: ({ record }) => record.get('pricingMethod') === 'OTHER_PAY',
      },
    },
    // 状态： 启用 || 禁用
    {
      name: 'enabled',
      label: intl.get('hzero.common.button.enable').d('启用'),
      trueValue: 1,
      falseValue: 0,
      type: 'boolean',
      defaultValue: 1,
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'item' && value && value.taxRate) {
        record.set('tax', { taxId: value.taxId, taxRate: value.taxRate });
      }
      // 安装费
      if (name === 'additionalType' && value === 'INSTALL') {
        record.set('pricingMethod', 'ORDER_AMOUNT');
      }
      if (name === 'allSupplierFlag' && value) {
        record.set('supplier', null);
      }
    },
  },
});

// a: 按订单金额
// c: 体积
// d: 重量
// b: 件数
// e: 安装费- 按订单金额
const getCommonFields = (filterKey) => {
  const allFields = [
    {
      label: intl.get('sagm.freight.model.postageRegion').d('运送区域'),
      help: intl
        .get('sagm.freight.model.postageRegionMsg')
        .d('除指定区域外，其余地区的运费按默认区域运费计算'),
      name: 'postageRegionList',
      type: 'object',
      textField: 'regionName',
      valueField: 'regionCode',
      multiple: true,
      dynamicProps: {
        required: ({ record }) => {
          return !record.get('regionDefault');
        },
        disabled: ({ record }) => {
          return record.get('regionDefault');
        },
      },
      validator: (value, name, record) => {
        if (record.get('regionDefault')) return true;
        return toJS(value)?.regionEnableFlag === 0
          ? intl
              .get('sagm.common.model.skuSalesRegions.validator')
              .d('地址库已升级，该地址已经不存在，请重新编辑。')
          : true;
      },
      transformResponse: (_, initLine) => {
        const { postageRegionList: regions, postageLineId: lineId, regionDefault } = initLine;
        const isDefault = regionDefault || (lineId && !(regions && regions.length > 0));
        return isDefault
          ? [
              {
                regionCode: 'default',
                regionName: intl.get('sagm.common.model.defaultRegion').d('默认区域'),
              },
            ]
          : regions;
      },
    },
    {
      name: 'regionDefault',
      transformResponse: (_, initLine) => {
        const { postageRegionList: regions, postageLineId: lineId, regionDefault } = initLine;
        return regionDefault || (lineId && !(regions && regions.length > 0));
      },
    },
    {
      label: intl.get('sagm.freight.model.minPackageAmount').d('最低包邮金额'),
      type: 'number',
      name: 'minPackageAmount',
      min: 0,
      // max: 99999,
      filters: ['a', 'b'],
      // 附加费用类型过滤
      validator: priceValidator,
    },
    {
      label: intl.get('sagm.freight.model.pricingType').d('计价类型'),
      name: 'pricingType',
      lookupCode: 'SMAL.AGREEMENT_PRICING_TYPE',
      required: true,
      filters: ['a', 'e'],
      lookupAxiosConfig: {
        transformResponse: (data) => {
          let _data = data || [];
          try {
            if (!Array.isArray(data)) {
              _data = JSON.parse(data).map((i) => ({ ...i, value: `${i.parentValue}_${i.value}` }));
            }
          } catch (err) {
            console.log(err);
          }
          return _data;
        },
      },
    },
    {
      label: intl.get('sagm.freight.model.freightNumber').d('数值'),
      name: 'tempererNumber',
      type: 'number',
      filters: ['a', 'e'],
      required: true,
      min: 0,
      validator(val, name, record) {
        // if (val <= 0) {
        //   return intl.get('sagm.freight.model.pricingType.minValidMsg').d('数值必须大于0。');
        // }
        if (record.get('pricingType').includes('PERCENTAGE') && val > 100) {
          return intl
            .get('sagm.freight.model.pricingType.maxPercentValidMsg')
            .d('数值必须小于等于100。');
        }
        c7nBoundValidator(val);
      },
      dynamicProps: {
        // max: ({ record }) => (record.get('pricingType')?.includes('FIXED') ? 99999 : 100),
        disabled: ({ record }) => !record.get('pricingType'),
      },
    },
    // {
    //   label: intl.get('sagm.freight.model.freightPurOrder').d('每单固定运费'),
    //   type: 'number',
    //   name: 'freightPurOrder',
    //   min: 0,
    //   max: 99999,
    //   validator: priceValidator,
    //   filters: ['a'],
    //   dynamicProps: {
    //     required: ({ record }) => {
    //       return record.get('pricingType') === 'FIXED';
    //     },
    //     disabled: ({ record }) => {
    //       return record.get('pricingType') !== 'FIXED';
    //     },
    //   },
    // },
    // {
    //   label: intl.get('sagm.freight.model.freightPercent').d('订单金额百分比（%）'),
    //   type: 'number',
    //   name: 'freightPercent',
    //   min: 0,
    //   max: 100,
    //   filters: ['a'],
    //   validator: (value) => numberValidator(value),
    //   dynamicProps: {
    //     required: ({ record }) => {
    //       return record.get('pricingType') === 'PERCENTAGE';
    //     },
    //     disabled: ({ record }) => {
    //       return record.get('pricingType') !== 'PERCENTAGE';
    //     },
    //   },
    // },
    {
      label: intl.get('sagm.freight.model.lowestAmount').d('最低金额'),
      name: 'lowestAmount',
      type: 'number',
      min: 0,
      // max: 99999,
      filters: ['a'],
      validator: priceValidator,
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('pricingType')?.includes('PERCENTAGE');
        },
      },
    },
    {
      label: intl.get('sagm.freight.model.minPackageNumber').d('最低包邮件数'),
      name: 'minPackageNumber',
      type: 'number',
      min: 1,
      // max: 9999,
      step: 1,
      filters: ['b'],
      validator: c7nBoundValidator,
    },
    {
      label: intl.get('sagm.freight.model.firstPiece').d('首件数'),
      type: 'number',
      name: 'firstPiece',
      min: 1,
      // max: 9999,
      step: 1,
      required: true,
      filters: ['b'],
      validator: c7nBoundValidator,
    },
    {
      label: intl.get('sagm.freight.model.firstFreightYuan').d('首件费'),
      type: 'number',
      name: 'firstFreight',
      required: true,
      min: 0,
      // max: 99999,
      filters: ['b'],
      validator: priceValidator,
    },
    {
      label: intl.get('sagm.freight.model.increasingNumber').d('续件'),
      name: 'increasingNumber',
      type: 'number',
      min: 1,
      // max: 9999,
      step: 1,
      required: true,
      filters: ['b'],
      validator: c7nBoundValidator,
    },
    {
      label: intl.get('sagm.freight.model.renewalYuan').d('续件费'),
      name: 'renewal',
      type: 'number',
      min: 0,
      required: true,
      validator: priceValidator,
      // max: 99999,
      filters: ['b'],
    },
    {
      label: intl.get('sagm.freight.model.volumeUnitPrice').d('体积单价（/m³）'),
      type: 'number',
      name: 'volumeUnitPrice',
      validator: priceValidator,
      required: true,
      min: 0,
      // max: 9999,
      filters: ['c'],
    },
    {
      label: intl.get('sagm.freight.model.maxPostageWeight').d('最大包邮重量（kg）'),
      type: 'number',
      name: 'maxPackageWeight',
      // validator: weightValidator,
      min: 0,
      max: 9999,
      filters: ['d'],
    },
    {
      label: intl.get('sagm.freight.model.freeWeight').d('首重（kg）'),
      type: 'number',
      name: 'firstWeight',
      min: 0,
      max: 9999,
      required: true,
      filters: ['d'],
    },
    {
      label: intl.get('sagm.freight.model.freeWeightExpense').d('首重费用（元）'),
      type: 'number',
      name: 'firstWeightPrice',
      validator: priceValidator,
      min: 0,
      // max: 9999,
      required: true,
      filters: ['d'],
    },
    {
      label: intl.get('sagm.freight.model.increasingWeight').d('续重（kg）'),
      type: 'number',
      name: 'increasingWeight',
      // min: 0,
      max: 9999,
      required: true,
      filters: ['d'],
      validator(val) {
        if (val <= 0) {
          return intl.get('sagm.freight.model.pricingType.minValidMsg').d('数值必须大于0。');
        }
      },
    },
    {
      label: intl.get('sagm.freight.model.increasingWeightPrice').d('续重费用（元）'),
      type: 'number',
      name: 'increasingWeightPrice',
      min: 0,
      // max: 9999,
      validator: priceValidator,
      required: true,
      filters: ['d'],
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'option',
    },
  ];
  return allFields.filter((f) => !f.filters || f.filters.includes(filterKey));
};

function getCommonRecordDynamicProps() {
  return {
    selectable: (record) => !record.get('regionDefault'),
  };
}

const orderAmountDs = () => ({
  paging: false,
  record: {
    dynamicProps: {
      ...getCommonRecordDynamicProps(),
    },
  },
  fields: getCommonFields('a'),
  events: {
    update: ({ record, name }) => {
      // 计价方式
      if (name === 'pricingType') {
        record.init('tempererNumber', null);
      }
    },
  },
});

const insTallOrderAmountDs = () => ({
  paging: false,
  record: {
    dynamicProps: {
      ...getCommonRecordDynamicProps(),
    },
  },
  fields: getCommonFields('e'),
  events: {
    update: ({ record, name }) => {
      // 计价方式
      if (name === 'pricingType') {
        record.init('tempererNumber', null);
      }
    },
  },
});

const piecesDs = () => ({
  paging: false,
  record: {
    dynamicProps: {
      ...getCommonRecordDynamicProps(),
    },
  },
  fields: getCommonFields('b'),
  events: {
    update: ({ record, name, value }) => {
      // 计价方式
      if (name === 'pricingType') {
        if (!value.includes('FIXED')) {
          record.init('freightPurOrder', null);
        }
        if (!value.includes('PERCENTAGE')) {
          record.init('freightPercent', null);
          record.init('lowestAmount', null);
        }
      }
    },
  },
});

const volumeDs = () => ({
  paging: false,
  record: {
    dynamicProps: {
      ...getCommonRecordDynamicProps(),
    },
  },
  fields: getCommonFields('c'),
});

const weightDs = () => ({
  paging: false,
  record: {
    dynamicProps: {
      ...getCommonRecordDynamicProps(),
    },
  },
  fields: getCommonFields('d'),
});

export { formDs, tableDs, piecesDs, volumeDs, orderAmountDs, weightDs, insTallOrderAmountDs };
