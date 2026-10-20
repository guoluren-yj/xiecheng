import { isNumber } from 'lodash';
import { toJS } from 'mobx';
import { math } from 'choerodon-ui/dataset';

// import { SRM_MALL } from '_utils/config';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
// import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import intl from 'utils/intl';

import { DATETIME_MIN } from 'utils/constants';
import { precisionUpdate } from '@/utils/precision';
import { END_TIME_DEFAULT_FORMAT } from '@/utils/const';
import { maxSAGMMessageValidator } from '@/utils/validator';

const organizationId = getCurrentOrganizationId();

// const flatTree = (tree = []) => {
//   let flat = [];
//   const fn = list => {
//     flat = [...flat, ...list];
//     list.forEach(item => {
//       if (item.children && item.children.length > 0) {
//         fn(item.children);
//       }
//     });
//   };
//   fn(tree);
//   return flat;
// };

const uomDpmic = (invalidFlag) => ({
  disabled: ({ record }) => {
    return invalidFlag || !record.get('uomId');
  },
  required: ({ record }) => record.get('uomId'),
});

const priceValidator = (val, field, record) => {
  if (!record.get('currencyCode')) {
    return intl.get('small.common.view.chooseCurrency').d('请先维护币种');
  }
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('small.common.view.maxMessage').d('值必须小于100000000000000000000');
  }
};

const quantityValidator = (val, field, record) => {
  if (!record.get('uomId')) {
    return intl.get('small.common.view.chooseUom').d('请先维护单位');
  }
  if (Number(val) === 0) {
    return intl.get('sagm.common.view.message.numberNotZero').d('数量不能为零');
  }
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('small.common.view.maxMessage').d('值必须小于100000000000000000000');
  }
};

const agreementLineDS = (isDisabled = false, invalidFlag = false) => ({
  primaryKey: 'agreementLineId',
  modifiedCheck: false,
  cacheModified: true,
  cacheSelection: true,
  pageSize: 20,
  forceValidate: true,
  fields: [
    {
      label: intl.get('small.common.model.lineNum').d('行号'),
      name: 'lineNum',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.item.code').d('物料编码'),
      name: 'itemLov',
      type: 'object',
      ignore: 'always',
      disabled: isDisabled || invalidFlag,
      textField: 'itemCode',
      valueField: 'id',
      lovCode: 'SMAL.CUSTOMER_ITEM',
      lovPara: { tenantId: organizationId },
      transformResponse: (_, record) => {
        return record.itemCode
          ? {
              id: `${record.itemId}-${record.itemCategoryId}`,
              itemId: record.itemId,
              itemCode: record.itemCode,
            }
          : null;
      },
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemCode',
      type: 'string',
      bind: 'itemLov.itemCode',
    },
    {
      label: intl.get('small.common.model.item.name').d('物料名称'),
      name: 'itemName',
      type: 'string',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('itemCode') || isDisabled || invalidFlag,
      },
    },
    {
      label: intl.get('small.common.model.itemCategory').d('物料分类'),
      name: 'itemCategoryLov',
      type: 'object',
      ignore: 'always',
      disabled: isDisabled || invalidFlag,
      textField: 'categoryName',
      valueField: 'categoryCode',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          itemId: record.get('itemId'),
          businessObjectCode: 'SRM_C_SRM_AGREEMENT',
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
      label: intl.get('sagm.common.model.catalog').d('目录'),
      name: 'catalogLov',
      type: 'object',
      ignore: 'always',
      textField: 'catalogName',
      valueField: 'catalogId',
      // readOnly: true, // 导致必输样式问题，暂时注释
      required: true,
      disabled: invalidFlag,
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
      label: intl.get('small.common.model.status').d('状态'),
      name: 'effectiveFlag',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.dateFrom').d('有效期从'),
      type: 'date',
      name: 'validDateFrom',
      dynamicProps: {
        required: ({ record }) => !!record.get('priceValidDateFrom'),
        min: ({ record }) => {
          const min = record.get('priceValidDateFrom');
          return min ? moment(moment(min).format(DATETIME_MIN)) : undefined;
        },
        max: ({ record }) => {
          const max = record.get('validDateTo') || record.get('priceValidDateTo');
          return max || undefined;
        },
      },
      // required: true,
      // disabled: isDisabled,
    },
    {
      label: intl.get('small.common.model.dateTo').d('有效期至'),
      type: 'date',
      name: 'validDateTo',
      dynamicProps: {
        required: ({ record }) => !!record.get('priceValidDateTo'),
        min: ({ record }) =>
          record.get('validDateFrom') || record.get('priceValidDateFrom') || moment(),
        max: ({ record }) => {
          const max = record.get('priceValidDateTo');
          return max || undefined;
        },
      },
      // required: true,
      // disabled: isDisabled,
      transformRequest(_, record) {
        const to = record.get('validDateTo');
        return to && to.format(END_TIME_DEFAULT_FORMAT);
      },
    },
    {
      label: intl.get('small.common.model.uom').d('单位'),
      name: 'uomLov',
      type: 'object',
      ignore: 'always',
      textField: 'uomCodeAndName',
      valueField: 'uomId',
      lovCode: 'SMDM.UOM',
      required: true,
      disabled: isDisabled || invalidFlag,
    },
    {
      name: 'uomId',
      type: 'string',
      bind: 'uomLov.uomId',
    },
    {
      name: 'uomCode',
      type: 'string',
      bind: 'uomLov.uomCode',
    },
    {
      name: 'uomName',
      type: 'string',
      bind: 'uomLov.uomCodeAndName',
    },
    {
      name: 'uomPrecision',
      bind: 'uomLov.uomPrecision',
    },
    {
      label: intl.get('small.common.model.tax').d('税率'),
      name: 'taxLov',
      type: 'object',
      ignore: 'always',
      textField: 'taxRate',
      valueField: 'taxId',
      lovCode: 'SMDM.TAX',
      required: true,
      disabled: isDisabled || invalidFlag,
      transformResponse: (_, record) => {
        return record.tax
          ? {
              taxId: record.taxId,
              taxRate: math.floor(record.tax),
            }
          : null;
      },
    },
    {
      name: 'taxId',
      type: 'string',
      bind: 'taxLov.taxId',
    },
    {
      name: 'tax',
      type: 'number',
      bind: 'taxLov.taxRate',
    },
    {
      label: intl.get('small.common.model.currency').d('币种'),
      name: 'currencyLov',
      type: 'object',
      ignore: 'always',
      textField: 'currencyName',
      valueField: 'currencyId',
      lovCode: 'SMDM.CURRENCY',
      required: true,
      disabled: isDisabled || invalidFlag,
    },
    {
      name: 'currencyId',
      type: 'string',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyCode',
      type: 'string',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'currencyName',
      type: 'string',
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
      label: intl.get('small.common.model.priceType').d('价格类型'),
      name: 'priceType',
      type: 'string',
      defaultValue: 'REGULAR_PRICE',
      lookupCode: 'SMAL.AGREEMENT_PRICE_TYPE',
      required: true,
      disabled: isDisabled || invalidFlag,
    },
    {
      label: intl.get('small.common.model.noTaxPrice').d('未税单价'),
      name: 'unitPrice',
      type: 'number',
      min: 0,
      // max: '99999999999999999999',
      dynamicProps: {
        required: ({ record }) =>
          record.get('priceType') === 'REGULAR_PRICE' && record.get('currencyCode'),
        disabled: ({ record }) =>
          !record.get('currencyCode') ||
          isDisabled ||
          invalidFlag ||
          record.get('priceType') === 'LADDER_PRICE',
      },
      validator: priceValidator,
    },
    {
      label: intl.get('small.common.model.taxPrice').d('含税单价'),
      name: 'taxPrice',
      type: 'number',
      min: 0,
      // max: '99999999999999999999',
      dynamicProps: {
        required: ({ record }) =>
          record.get('priceType') === 'REGULAR_PRICE' && record.get('currencyCode'),
        disabled: ({ record }) =>
          !record.get('currencyCode') ||
          isDisabled ||
          invalidFlag ||
          record.get('priceType') === 'LADDER_PRICE',
      },
      validator: priceValidator,
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get('sagm.common.model.priceBatchQuantity').d('价格批量'),
      min: 1,
      defaultValue: 1,
      step: 1,
      required: true,
      disabled: isDisabled,
      validator: maxSAGMMessageValidator,
    },
    {
      label: intl.get('small.common.model.ladderPrice').d('阶梯价格'),
      name: 'ladderFlag',
      // dynamicProps: ({ record }) => ({
      //   required: record.get('priceType') === 'LADDER_PRICE',
      // }),
    },
    {
      name: 'agreementLadders', // 阶梯价格列表
      type: 'object',
      // validator: (value, name, record) => {
      //   const { priceType, agreementLadders } = record.toData();
      //   const ladders = agreementLadders || [];
      //   if (priceType === 'LADDER_PRICE' && ladders.length === 0) {
      //     return '请维护阶梯价格';
      //   }
      //   return true;
      // },
    },
    {
      label: intl.get('sagm.common.model.isHiddenPrice').d('隐藏价格'),
      name: 'priceHiddenFlag',
      type: 'boolean',
      required: true,
      defaultValue: 0,
      transformResponse(value) {
        return Boolean(value);
      },
      transformRequest(value) {
        return Number(value);
      },
    },
    {
      label: intl.get('small.common.view.freightRule').d('运费规则'),
      name: 'postageLov',
      type: 'object',
      ignore: 'always',
      // disabled: isDisabled || invalidFlag,
      textField: 'postageName',
      valueField: 'postageId',
      lovCode: 'SMAL.POSTAGE_SUPPLIER',
      defaultValue: {
        postageId: -1,
        postageName: intl.get('small.common.view.free').d('包邮'),
      },
      dynamicProps: {
        lovPara: ({ record }) => ({
          supplierTenantId: record.get('supplierTenantId'),
          enabled: 1,
          additionalType: 'FREIGHT',
        }),
      },
      transformResponse: (_, record) => {
        const { postage } = record;
        return postage && postage.postageId !== -1
          ? {
              postageId: postage.postageId,
              postageName: postage.postageName,
            }
          : {
              postageId: -1,
              postageName: intl.get('small.common.view.free').d('包邮'),
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
      label: intl.get('small.common.view.installExpense').d('安装费'),
      name: 'installLov',
      type: 'object',
      ignore: 'always',
      textField: 'postageName',
      valueField: 'postageId',
      lovCode: 'SMAL.INSTALL_SUPPLIER',
      dynamicProps: {
        lovPara: ({ record }) => ({
          supplierTenantId: record.get('supplierTenantId'),
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
      name: 'installId',
      bind: 'installLov.postageId',
      transformResponse: (value) => (value === -1 ? null : value),
    },
    {
      label: intl.get('small.common.model.agreementQuantity').d('协议数量'),
      name: 'agreementQuantity',
      type: 'number',
      required: true,
      disabled: invalidFlag,
      defaultValue: 9999999999,
      validator: quantityValidator,
      dynamicProps: {
        ...uomDpmic(invalidFlag),
      },
    },
    {
      label: intl.get('small.common.model.orderQuantity').d('起订量'),
      name: 'orderQuantity',
      type: 'number',
      required: true,
      disabled: invalidFlag,
      defaultValue: 1,
      validator: quantityValidator,
      dynamicProps: {
        ...uomDpmic(invalidFlag),
        max: ({ record }) => {
          return record.get('purchaseQuantityLimit');
        },
        min: ({ record }) => record.get('minPackageQuantity'),
      },
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('small.common.view.orderQuantityOverMax')
          .d('起订量不能大于最大购买量'),
        rangeUnderflow: intl
          .get('small.common.view.minOrderQuantityHelp')
          .d('起订量应大于等于最小包装量'),
      },
    },
    {
      label: intl.get('small.common.model.minPackageQuantity').d('最小包装量'),
      name: 'minPackageQuantity',
      type: 'number',
      required: true,
      disabled: invalidFlag,
      defaultValue: 1,
      validator: quantityValidator,
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('small.common.view.minPackageQuantityOverMax')
          .d('最小包装量应小于等于起订量'),
      },
      dynamicProps: {
        ...uomDpmic(invalidFlag),
        max: ({ record }) => {
          return record.get('orderQuantity');
        },
      },
    },
    {
      label: intl.get('small.common.model.purchaseQuantityLimit').d('最大购买量'),
      name: 'purchaseQuantityLimit',
      type: 'number',
      required: true,
      disabled: invalidFlag,
      defaultValue: '99999999999999999999',
      validator: quantityValidator,
      dynamicProps: {
        ...uomDpmic(invalidFlag),
        min: ({ record }) => {
          return record.get('orderQuantity') || 1;
        },
      },
      defaultValidationMessages: {
        rangeUnderflow: intl
          .get('small.common.view.purchaseQuantityLimitUnderMin')
          .d('最大购买量不能小于起订量'),
      },
    },
    {
      label: intl.get('small.common.model.purchaseAmountLimit').d('采购额上限'),
      name: 'purchaseAmountLimit',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: '99999999999999999999',
      dynamicProps: {
        required: ({ record }) => record.get('currencyCode'),
        disabled: ({ record }) => !record.get('currencyCode') || invalidFlag,
      },
      validator: priceValidator,
    },
    {
      name: 'allRegionFlag',
      defaultValue: 1,
      type: 'number',
    },
    {
      label: intl.get('small.common.model.postRegion').d('送货区域'),
      name: 'deliverRegionLov',
      type: 'object',
      // ignore: 'always',
      // idField: 'regionId',
      // parentField: 'parentRegionId',
      textField: 'regionName',
      valueField: 'regionId',
      required: true,
      multiple: true,
      // lovCode: 'SMAL.REGION',
      disabled: invalidFlag,
      dynamicProps: {
        readOnly: ({ record }) => {
          const effectiveFlag = record.get('effectiveFlag');
          return invalidFlag || effectiveFlag === -1;
        },
      },
      validator: (value, name, record) => {
        if (record.get('allRegionFlag')) return true;
        return toJS(value)?.regionEnableFlag === 0
          ? intl
              .get('sagm.common.model.skuSalesRegions.validator')
              .d('地址库已升级，该地址已经不存在，请重新编辑。')
          : true;
      },
      transformResponse: (_, record) => {
        const { allRegionFlag, agreementRegionDTOList } = record;
        const flag = isNumber(allRegionFlag);
        const allRegion = {
          regionId: 'ALL',
          regionCode: 'ALL',
          regionName: intl.get('small.common.model.allAreas').d('所有区域'),
        };
        const list = flag ? (allRegionFlag === 1 ? [allRegion] : agreementRegionDTOList) : null;
        return list;
      },
    },
    {
      name: 'allUnitFlag',
      defaultValue: 1,
      type: 'number',
    },
    {
      label: intl.get('small.common.model.canBuyOrganization').d('可采买组织'),
      name: 'buyOrganizationLov',
      type: 'object',
      // ignore: 'always',
      textField: 'unitCodeName',
      valueField: 'unitId',
      required: true,
      multiple: true,
      // lovCode: 'SMAL.UNIT',
      disabled: invalidFlag,
      dynamicProps: {
        readOnly: ({ record }) => {
          const editFlag = record.get('companyAssignEditFlag');
          const effectiveFlag = record.get('effectiveFlag');
          return effectiveFlag === -1 || (isDisabled && editFlag !== -1);
        },
      },
      transformResponse: (_, record) => {
        const { allUnitFlag, agreementUnits, agreementUnitDTOList } = record;
        const _list = agreementUnits || agreementUnitDTOList;
        const flag = isNumber(allUnitFlag);
        const allUnit = {
          unitId: 'ALL',
          // unitCode: 'ALL',
          unitName: intl.get('small.common.model.allOrganizations').d('所有组织'),
        };
        const list = flag ? (allUnitFlag === 1 ? [allUnit] : _list) : null;
        return list
          ? list.map((m) => ({
              ...m,
              unitCodeName: m.unitCode ? `${m.unitCode}-${m.unitName}` : m.unitName,
            }))
          : list;
      },
    },
    {
      name: 'priceSourceFromNum',
      label: intl.get('sagm.common.model.sourceFromNum').d('合同号'),
      disabled: isDisabled,
      maxLength: 100,
    },
    {
      name: 'priceSourceFromLnNum',
      label: intl.get('sagm.common.model.sourceFromLnNum').d('合同行号'),
      disabled: isDisabled,
      maxLength: 100,
    },
    {
      label: intl.get('small.common.model.deliveryDay').d('供货周期（天）'),
      name: 'deliveryDay',
      type: 'number',
      step: 1,
      min: 0,
      disabled: invalidFlag,
    },
    {
      label: intl.get('small.common.model.guaranteeDay').d('质保期（天）'),
      name: 'guaranteeDay',
      type: 'number',
      step: 1,
      min: 0,
      disabled: invalidFlag,
    },
    {
      label: intl.get('small.common.model.priceFromNum').d('价格编号'),
      name: 'priceLibNumber',
      type: 'string',
    },
    {
      label: intl.get('small.common.model.remark').d('备注'),
      name: 'remarkMeaning',
      type: 'string',
      disabled: invalidFlag,
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operation',
    },
    {
      name: 'editUnitRegionFlag',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.validate(); // 触发页面初次加载区域失效校验
    },
    update: (para) => {
      const { name, value, record, oldValue } = para;
      if (name === 'priceType' && oldValue === 'LADDER_PRICE' && value !== 'LADDER_PRICE') {
        record.set('agreementLadders', null);
      }
      // 组织、区域以及自定义维度发生变更
      if (
        (['deliverRegionLov', 'buyOrganizationLov'].includes(name) || name.includes('custDim_')) &&
        record.get('editUnitRegionFlag') !== 1
      ) {
        record.set('editUnitRegionFlag', 1);
      }
      if (name === 'remarkMeaning') {
        record.set('remark', value);
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
      precisionUpdate({
        ...para,
        type: 'currency',
        updateField: 'currencyLov',
        precisionField: 'financialPrecision',
        changeFields: ['purchaseAmountLimit'],
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `/sagm/v1/${organizationId}/agreement-lines`,
        method: 'GET',
        data: {
          ...data,
          deleteFlag: 0,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `/sagm/v1/${organizationId}/agreement-lines`,
        data,
        method: 'DELETE',
      };
    },
  },
});

export { agreementLineDS };
