import moment from 'moment';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { maxSMPCMessageValidator } from '@/utils/validator';

import { precisionUpdate } from '../../utilsApi/precision';

const organizationId = getCurrentOrganizationId();

// 阶梯价格
const ladderDs = (readOnly) => ({
  paging: false,
  selection: readOnly ? false : 'multiple',
  fields: [
    {
      name: 'number',
      label: intl.get('smpc.product.view.lineNum').d('行号'),
    },
    {
      name: 'ladderFrom',
      label: intl.get('smpc.product.view.ladderFrom').d('数量从>='),
      required: true,
      type: 'number',
      min: 1,
      // max: '99999999999999999999',
      // step: 1,
      validator: (value, name, record) => {
        const quantityTo = record.get('ladderTo');
        if (math.gte(value, '100000000000000000000')) {
          return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
        }
        if (quantityTo && math.lte(quantityTo, value)) {
          return intl.get('smpc.product.view.ladderFromMsg').d('数量从必须小于数量至');
        }
      },
    },
    {
      name: 'ladderTo',
      label: intl.get('smpc.product.view.ladderTo').d('数量至<'),
      type: 'number',
      // step: 1,
      // max: '99999999999999999999',
      // min: 'ladderFrom',
      validator: (value, name, record) => {
        const quantityFrom = record.get('ladderFrom');
        if (math.gte(value, '100000000000000000000')) {
          return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
        }
        if (quantityFrom && value && math.gte(quantityFrom, value)) {
          return intl.get('smpc.product.view.ladderToMsg').d('数量至必须大于数量从');
        }
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      label: intl.get('smpc.product.view.price.noTax').d('单价(不含税)'),
      min: 0,
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
      required: true,
    },
    {
      name: 'taxPrice',
      type: 'number',
      label: intl.get('smpc.product.view.price.tax').d('单价(含税)'),
      min: 0,
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
      required: true,
    },
  ],
});

// 商品评价
const evaluateDs = () => ({
  selection: false,
  autoQuery: false,
  queryFields: [
    {
      label: intl.get('smpc.product.model.assessTimeFrom').d('评价时间从'),
      type: 'dateTime',
      name: 'assessDateFrom',
      max: 'assessDateTo',
    },
    {
      label: intl.get('smpc.product.model.assessTimeTo').d('评价时间至'),
      name: 'assessDateTo',
      type: 'dateTime',
      min: 'assessDateFrom',
    },
  ],
  fields: [
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'evaluate',
      label: intl.get('smpc.product.view.evaluate').d('评价'),
    },
    {
      name: 'assessmentDate',
      type: 'dateTime',
      label: intl.get('smpc.product.view.evaluateTime').d('评价时间'),
    },
    {
      name: 'imageView',
      label: intl.get('smpc.product.view.imagePreview').d('图片预览'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/smpc/v1/${organizationId}/assessments/sku-all-assessment`,
        method: 'GET',
        data: { ...data, ...params, tenantId: organizationId },
      };
    },
  },
});

// 维护商品信息
const skuInfoDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('smpc.product.model.mapCatalog').d('映射目录'),
      name: 'catalogLov',
      type: 'object',
      lovCode: 'SMPC.CATALOG_THREE',
      textField: 'catalogName',
      valueField: 'catalogId',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
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
      label: intl.get('smpc.product.model.mapItem').d('映射物料'),
      name: 'itemLov',
      type: 'object',
      lovCode: 'SMAL.CUSTOMER_ITEM',
      textField: 'itemCode',
      valueField: 'id',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
    },
    {
      label: intl.get('smpc.product.model.itemName').d('物料名称'),
      name: 'itemName',
      bind: 'itemLov.itemName',
      disabled: true,
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
    },
    {
      label: intl.get('smpc.product.model.mapItemCategory').d('映射物料品类'),
      name: 'itemCategoryLov',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryName',
      valueField: 'categoryCode',
      ignore: 'always',
      computedProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          itemId: record.get('itemId'),
          businessObjectCode: 'SRM_C_SRM_PRODUCT_DASHBOARD',
          enabledFlag: 1,
          hzeroUIFlag: 0,
        }),
      },
      optionsProps: {
        // 根据业务规则 - 品类值集选择范围， 判断数据是否能选中
        record: {
          dynamicProps: {
            // 预定义不能启用禁用（头上按钮）
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
    },
    {
      name: 'itemCategoryId',
      type: 'string',
      bind: 'itemCategoryLov.categoryId',
    },
    {
      name: 'itemCategoryCode',
      type: 'string',
      bind: 'itemCategoryLov.categoryCode',
    },
    {
      name: 'itemCategoryName',
      type: 'string',
      bind: 'itemCategoryLov.categoryName',
    },
    {
      name: 'stockOpt',
      label: intl.get('hzero.common.action').d('操作'),
      lookupCode: 'SMPC.STOCK_OPT',
      defaultValue: 'INC',
    },
    {
      name: 'replenishmentStock',
      label: intl.get('smpc.product.model.stock').d('库存'),
      min: 0,
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
    },
    {
      name: 'warningStock',
      label: intl.get('smpc.product.model.warnStock').d('预警库存'),
      min: 0,
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
    },
    {
      name: 'weightScore',
      label: intl.get('smpc.product.modal.weightScore').d('权重分'),
      type: 'number',
      min: 0,
      max: 1000000,
    },
    {
      name: 'newCustomFlag',
      label: intl.get('smpc.product.view.customSku').d('定制品'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'customTemplateCode',
      label: intl.get('smpc.product.view.customTemplate').d('定制模版'),
      lookupCode: 'SMPC.CUSTOM_TEMPLATE',
      valueField: 'templateCode',
      textField: 'templateName',
      computedProps: {
        required: ({ record }) => +record.get('newCustomFlag'),
      },
    },
    {
      name: 'shelfRemark',
      label: intl.get('smpc.workbench.model.remark').d('备注'),
      maxLength: 30,
    },
    {
      name: 'labels',
      type: 'object',
      textField: 'labelName',
      valueField: 'labelId',
      multiple: true,
      label: intl.get('smpc.product.model.productLabel').d('商品标签'),
    },
    {
      name: 'ecValidDateTo',
      type: 'date',
      min: moment(moment().format(DATETIME_MIN)),
      label: intl.get('smpc.product.model.dateTo').d('有效期至'),
      transformRequest: (value) => value?.format(DATETIME_MAX),
    },
  ],
  events: {
    update: ({ record, value, name }) => {
      if (name === 'itemLov' && value) {
        const { categoryId, categoryCode, categoryName } = value;
        record.set(
          'itemCategoryLov',
          categoryId ? { categoryId, categoryCode, categoryName } : null
        );
      }
    },
  },
});

const priceValidator = (val, field, record) => {
  if (!record.get('currencyId') && record.get('editMode') !== 'update') {
    return intl.get('smpc.product.view.chooseCurrency').d('请先维护币种');
  }
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
  }
};

const quantityValidator = (val, field, record) => {
  if (!record.get('uomId') && record.get('editMode') !== 'update') {
    return intl.get('smpc.product.view.chooseUom').d('请先维护单位');
  }
  if (val === 0) {
    return intl.get('smpc.product.view.message.numberNotZero').d('数量不能为0');
  }
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
  }
};

// 价格信息
const saleInfoDs = (supplierTenantId) => ({
  paging: false,
  selection: false,
  fields: [
    { name: 'editMode' },
    {
      name: 'skuPriceStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'shelfErrorMessageMeaning',
      label: intl.get('smpc.product.model.shelfErrorMessage').d('失败原因'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'priceType',
      label: intl.get('smpc.product.model.priceType').d('价格类型'),
      lookupCode: 'SMAL.AGREEMENT_PRICE_TYPE',
      computedProps: {
        required: ({ record }) => {
          return record.get('editMode') !== 'update';
        },
      },
    },
    {
      name: 'priceHiddenFlag',
      lookupCode: 'HPFM.FLAG',
      // defaultValue: 0,
      computedProps: {
        defaultValue: ({ record }) => {
          return record.get('editMode') !== 'update' ? 0 : undefined;
        },
      },
      label: intl.get('smpc.product.model.priceHidden').d('是否隐藏价格'),
    },
    {
      name: 'skuSalesLadders',
      // 个性化加lable
      // label: intl.get('smpc.product.model.ladderPrice').d('阶梯价格'),
    },
    {
      name: 'agreementTaxedPrice',
      type: 'number',
      label: intl.get('smpc.product.model.taxAgreementPrice').d('协议价格(含税)'),
      min: 0,
      // max: '99999999999999999999',
      validator: priceValidator,
      dynamicProps: {
        disabled: ({ record }) =>
          !record.get('currencyId') || record.get('priceType') === 'LADDER_PRICE',
        required: ({ record }) =>
          record.get('currencyId') &&
          record.get('priceType') === 'REGULAR_PRICE' &&
          record.get('editMode') !== 'update',
      },
    },
    {
      name: 'agreementPrice',
      type: 'number',
      label: intl.get('smpc.product.model.noTaxPlatPrice').d('协议价格(不含税)'),
      min: 0,
      // max: '99999999999999999999',
      validator: priceValidator,
      dynamicProps: {
        disabled: ({ record }) =>
          !record.get('currencyId') || record.get('priceType') === 'LADDER_PRICE',
        required: ({ record }) =>
          record.get('currencyId') &&
          record.get('priceType') === 'REGULAR_PRICE' &&
          record.get('editMode') !== 'update',
      },
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get('smpc.product.model.priceBatchQuantity').d('价格批量'),
      min: 1,
      step: 1,
      validator: maxSMPCMessageValidator,
    },
    {
      label: intl.get('sagm.common.model.dateFrom').d('有效期从'),
      type: 'date',
      name: 'validDateFrom',
    },
    {
      label: intl.get('sagm.common.model.dateTo').d('有效期至'),
      type: 'date',
      name: 'validDateTo',
      min: moment().format(DATETIME_MIN),
    },
    {
      name: 'uomLov',
      label: intl.get('smpc.product.model.unit').d('单位'),
      type: 'object',
      ignore: 'always',
      textField: 'uomCodeAndName',
      valueField: 'uomId',
      lovCode: 'SMDM.UOM',
      computedProps: {
        required: ({ record }) => {
          return record.get('editMode') !== 'update';
        },
      },
    },
    {
      name: 'uomName',
      bind: 'uomLov.uomCodeAndName',
    },
    {
      name: 'uomId',
      bind: 'uomLov.uomId',
    },
    {
      name: 'uomPrecision',
      bind: 'uomLov.uomPrecision',
    },
    {
      name: 'taxLov',
      label: intl.get('smpc.product.model.tax').d('税率'),
      type: 'object',
      ignore: 'always',
      textField: 'taxRate',
      valueField: 'taxId',
      lovCode: 'SMDM.TAX',
      computedProps: {
        required: ({ record }) => {
          return record.get('editMode') !== 'update';
        },
      },
    },
    {
      name: 'tax',
      bind: 'taxLov.taxRate',
    },
    {
      name: 'taxId',
      bind: 'taxLov.taxId',
    },
    {
      name: 'currencyLov',
      type: 'object',
      ignore: 'always',
      textField: 'currencyName',
      valueField: 'currencyId',
      lovCode: 'SMDM.CURRENCY',
      label: intl.get('smpc.product.model.currency').d('币种'),
      computedProps: {
        required: ({ record }) => {
          return record.get('editMode') !== 'update';
        },
      },
    },
    {
      name: 'currencyName',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'currencyId',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'defaultPrecision',
      bind: 'currencyLov.defaultPrecision',
    },
    // {
    //   name: 'freeShippingFlag',
    //   label: intl.get('smpc.product.model.isFree').d('是否包邮'),
    //   lookupCode: 'HPFM.FLAG',
    //   type: 'number',
    //   disabled: !supplierTenantId,
    //   computedProps: {
    //     defaultValue: ({ record }) => {
    //       return record.get('editMode') !== 'update' ? 1 : undefined;
    //     },
    //   },
    // },
    {
      name: 'freightLov',
      label: intl.get('smpc.product.model.freightRule').d('运费规则'),
      type: 'object',
      ignore: 'always',
      textField: 'postageName',
      valueField: 'postageId',
      lovCode: 'SMAL.POSTAGE_SUPPLIER',
      lovPara: { enabled: 1, additionalType: 'FREIGHT' },
      required: true,
      computedProps: {
        disabled: () => {
          return !supplierTenantId;
        },
        required: ({ record }) => record.get('editMode') !== 'update',
      },
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
      transformResponse: (_, data) =>
        data.shippingRuleId === -1
          ? {
              postageId: -1,
              postageName: intl.get('small.common.view.free').d('包邮'),
            }
          : null,
    },
    {
      name: 'shippingRuleId',
      bind: 'freightLov.postageId',
    },
    {
      name: 'shippingRuleName',
      bind: 'freightLov.postageName',
    },
    {
      label: intl.get('smpc.product.view.installExpense').d('安装费'),
      name: 'installLov',
      type: 'object',
      textField: 'postageName',
      valueField: 'postageId',
      lovCode: 'SMAL.INSTALL_SUPPLIER',
      lovPara: { enabled: 1, additionalType: 'INSTALL' },
      lovQueryAxiosConfig: (code, _, { data }) => {
        return {
          url: `/sagm/v1/${organizationId}/postages/supplier/${supplierTenantId}?lovCode=${code}`,
          method: 'GET',
          data,
        };
      },
      dynamicProps: {
        disabled: () => {
          return !supplierTenantId;
        },
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
      name: 'installId',
      bind: 'installLov.postageId',
    },
    {
      name: 'installName',
      bind: 'installLov.postageName',
    },
    {
      name: 'orderQuantity',
      type: 'number',
      label: intl.get('smpc.product.view.orderQuantity').d('起订量'),
      // defaultValue: 1,
      // min: 1,
      // max: '99999999999999999999',
      validator: quantityValidator,
      dynamicProps: {
        min: ({ record }) => record.get('minPackageQuantity'),
        disabled: ({ record }) => !record.get('uomId') && record.get('editMode') !== 'update',
        required: ({ record }) => record.get('uomId') && record.get('editMode') !== 'update',
      },
      defaultValidationMessages: {
        rangeUnderflow: intl
          .get('small.common.view.minOrderQuantityHelp')
          .d('起订量应大于等于最小包装量'),
      },
    },
    {
      name: 'minPackageQuantity',
      type: 'number',
      label: intl.get('smpc.product.view.minPackageQuantity').d('最小包装量'),
      // defaultValue: 1,
      // min: 1,
      // max: '99999999999999999999',
      validator: quantityValidator,
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('small.common.view.minPackageQuantityOverMax')
          .d('最小包装量应小于等于起订量'),
      },
      dynamicProps: {
        min: ({ record }) => (record.get('uomPrecision') === 1 ? 1 : 0),
        max: ({ record }) => {
          return record.get('orderQuantity');
        },
        disabled: ({ record }) => !record.get('uomId') && record.get('editMode') !== 'update',
        required: ({ record }) => record.get('uomId') && record.get('editMode') !== 'update',
      },
    },
    {
      name: 'skuSalesRegions',
      type: 'object',
      textField: 'regionName',
      valueField: 'regionCode',
      multiple: true,
      required: true,
      transformResponse: (_, record) => {
        const { allRegionFlag, skuSalesRegions } = record;
        const all = {
          regionCode: 'ALL',
          regionName: intl.get('smpc.product.model.allRegion').d('所有区域'),
        };
        const list = allRegionFlag === 1 ? [all] : skuSalesRegions;
        return list;
      },
      label: intl.get('smpc.product.model.postRegion').d('送货区域'),
      computedProps: {
        required: ({ record }) => {
          return record.get('editMode') !== 'update';
        },
      },
    },
    {
      name: 'skuSalesUnits',
      type: 'object',
      textField: 'unitCodeName',
      valueField: 'unitId',
      multiple: true,
      required: true,
      transformResponse: (_, record) => {
        const { allUnitFlag, skuSalesUnits } = record;
        const allUnit = {
          unitId: 'ALL',
          unitName: intl.get('smpc.product.model.allOrg').d('所有组织'),
        };
        const list = allUnitFlag === 1 ? [allUnit] : skuSalesUnits;
        return list
          ? list.map((m) => ({
              ...m,
              unitCodeName: m.unitCode ? `${m.unitCode}-${m.unitName}` : m.unitName,
            }))
          : list;
      },
      computedProps: {
        required: ({ record }) => {
          return record.get('editMode') !== 'update';
        },
      },
      label: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
    },
    {
      name: 'priceSourceFromNum',
      label: intl.get('smpc.product.model.sourceFromNum').d('合同号'),
    },
    {
      name: 'priceSourceFromLnNum',
      label: intl.get('smpc.product.model.sourceFromLnNum').d('合同行号'),
    },
    {
      label: intl.get('smpc.product.model.deliveryDay').d('供货周期（天）'),
      name: 'deliveryDay',
      type: 'number',
      step: 1,
      min: 0,
      max: 999999999,
    },
    {
      label: intl.get('smpc.product.model.guaranteeDay').d('质保期（天）'),
      name: 'guaranteeDay',
      type: 'number',
      step: 1,
      min: 0,
      max: 999999999,
    },
    {
      label: intl.get('smpc.product.model.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.remark').d('备注'),
      name: 'remarkMeaning',
      type: 'string',
    },
  ],
  events: {
    update: (para) => {
      // const { name, value, record } = para;
      // if (name === 'freeShippingFlag' && value) {
      //   record.set('freightLov', null);
      //   record.set('shippingRuleId', null);
      // }

      const quantityNames = ['orderQuantity', 'minPackageQuantity'];
      const priceNames = ['agreementTaxedPrice', 'agreementPrice'];

      precisionUpdate({
        ...para,
        updateField: 'uomLov',
        precisionField: 'uomPrecision',
        changeFields: quantityNames,
      });
      precisionUpdate({
        ...para,
        type: 'currency',
        updateField: 'currencyLov',
        precisionField: 'defaultPrecision',
        changeFields: priceNames,
      });
    },
  },
  transport: {
    read: {
      url: `/smpc/v1/${organizationId}/pur-skus/fetch-sales-info`,
      method: 'GET',
    },
  },
});

const stockDs = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'warningStock',
      type: 'number',
      label: intl.get('smpc.product.model.warningStock').d('提醒阈值'),
    },
    {
      name: 'consumedStock',
      type: 'number',
      label: intl.get('smpc.product.model.consumeStock').d('消耗库存'),
    },
    {
      name: 'surplusStock',
      type: 'number',
      label: intl.get('smpc.product.model.surplusStock').d('可用库存'),
    },
    {
      name: 'totalStock',
      type: 'number',
      label: intl.get('smpc.product.model.totalStock').d('总库存'),
    },
    {
      name: 'inventoryName',
      label: intl.get('smpc.product.view.storeroom').d('库房'),
    },
  ],
});

// 权限信息
const authDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'authorityListCode',
      label: intl.get('smpc.workbench.view.authCode').d('权限编码'),
    },
    {
      name: 'authorityListName',
      label: intl.get('smpc.workbench.view.authName').d('权限名称'),
    },
    {
      name: 'agreementTypeMeaning',
      label: intl.get('smpc.workbench.view.dataFrom').d('数据来源'),
    },
    {
      name: 'agreementHeaderNum',
      type: 'string',
      label: intl.get('smpc.workbench.model.sourceNum').d('来源单号'),
    },
    {
      name: 'controlWayCodeMeaning',
      type: 'string',
      label: intl.get('smpc.workbench.model.controlMethod').d('控制方式'),
    },
    {
      name: 'controlRangeMeaning',
      label: intl.get('sagm.common.view.controlRange').d('控制范围'),
    },
    {
      name: 'remarkMeaning',
      type: 'string',
      label: intl.get('smpc.workbench.model.remark').d('备注'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('smpc.workbench.model.createBy').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get('smpc.workbench.model.creationDate').d('创建时间'),
    },
    {
      name: 'statusCodeMeaning',
      label: intl.get('smpc.workbench.view.enableStatus').d('状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/authority-lists/sku`,
      method: 'GET',
    },
  },
});

// 历史版本
const versionDs = () => ({
  selection: false,
  autoQuery: false,
  queryFields: [
    {
      name: 'creatimeDateFrom',
      type: 'dateTime',
      max: 'creatimeDateTo',
      label: intl.get('smpc.workbench.model.creationDateFrom').d('创建日期从'),
    },
    {
      name: 'creatimeDateTo',
      type: 'dateTime',
      min: 'creatimeDateFrom',
      label: intl.get('smpc.workbench.model.creationDateTo').d('创建日期至'),
    },
  ],
  fields: [
    {
      name: 'version',
      label: intl.get('smpc.workbench.view.versionNum').d('版本号'),
    },
    {
      name: 'skuName',
      label: intl.get('smpc.product.view.skuName').d('商品名称'),
    },
    {
      name: 'creationDate',
      label: intl.get('smpc.workbench.view.creationDate').d('创建日期'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `/smpc/v1/${organizationId}/sku-historys`,
      method: 'GET',
    },
  },
});

const getRecordQueryFields = (isStock, isStockPur) => {
  const queryFields = [
    {
      name: 'creatimeDateFrom',
      type: 'dateTime',
      max: 'creatimeDateTo',
      label: intl.get('smpc.workbench.model.operateTimeFrom').d('操作时间从'),
    },
    {
      name: 'creatimeDateTo',
      type: 'dateTime',
      min: 'creatimeDateFrom',
      label: intl.get('smpc.workbench.model.operateTimeTo').d('操作时间至'),
    },
    // 库存记录采 为文本库, 不可放在lov形式后面，会覆盖
    {
      name: 'operate',
      type: 'string',
      label: intl.get('smpc.workbench.model.operatedBy').d('操作人'),
      isFilter: !isStock && !isStockPur,
    },
    {
      name: 'operate',
      type: 'object',
      ignore: 'always',
      label: intl.get('smpc.workbench.model.operatedBy').d('操作人'),
      lovCode: 'HIAM.TENANT.USER',
      lovPara: { organizationId },
      valueField: 'id',
      textField: 'realName',
      isFilter: isStock && isStockPur,
    },
    {
      name: 'operationUser',
      bind: 'operate.id',
    },
    {
      name: 'operationCode',
      label: intl.get('smpc.workbench.model.operateType').d('操作类型'),
      lookupCode: 'SMPC.OPERATION_CODE',
      isFilter: isStock,
    },
  ];
  return queryFields.filter((f) => f.isFilter !== true);
};

// 操作记录
const recordDs = (url, isStockPur) => ({
  selection: false,
  autoQuery: false,
  queryFields: getRecordQueryFields(!!url, isStockPur),
  fields: [
    {
      name: 'realName',
      label: intl.get('smpc.workbench.model.operatedBy').d('操作人'),
    },
    {
      name: 'operationCodeMeaning',
      label: intl.get('smpc.workbench.model.operateType').d('操作类型'),
    },
    {
      name: 'operationContentMeaning',
      label: intl.get('smpc.workbench.view.operateContent').d('操作内容'),
    },
    {
      name: 'availableStock',
      label: intl.get('smpc.product.view.availableStock').d('当前可用库存'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smpc.product.model.remark').d('备注'),
    },
    {
      name: 'operationTime',
      type: 'dateTime',
      label: intl.get('smpc.workbench.view.operateTime').d('操作时间'),
    },
  ],
  transport: {
    read: {
      url: url || `/smpc/v1/${organizationId}/sku-operation-records`,
      method: 'GET',
    },
  },
});

const copyDs = () => ({
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'supplierLov',
      type: 'object',
      label: intl.get('smpc.workbench.model.supplier').d('供应商'),
      textField: 'supplierCompanyName',
      valueField: 'supplierCompanyId',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierLov.supplierTenantId',
    },
    {
      name: 'priceCopyFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('smpc.workbench.model.copySkuPriceInfo').d('复制商品价格信息'),
    },
  ],
});

export {
  ladderDs,
  evaluateDs,
  skuInfoDs,
  saleInfoDs,
  stockDs,
  authDs,
  versionDs,
  recordDs,
  copyDs,
};
