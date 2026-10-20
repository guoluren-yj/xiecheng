import intl from 'utils/intl';
import { isNumber } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import { precisionUpdate } from '@/utils/precision';
import { END_TIME_DEFAULT_FORMAT } from '@/utils/const';
import { DATETIME_MIN } from 'utils/constants';
import { maxSAGMMessageValidator } from '@/utils/validator';

const SRM_AGM = '/sagm';
const organizationId = getCurrentOrganizationId();

const uomDpmic = () => ({
  disabled: ({ record }) => {
    return !record.get('uomId');
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

const dpDisable = ({ record }) => record.get('sourceFrom') === 'PRICE' || record.get('agreementId');

// 基本信息
const baseInfoDs = ({ isHistory, queryParams } = {}) => {
  return {
    autoQuery: false,
    autoCreate: true,
    // ...dsProps,
    fields: [
      {
        name: 'agreementNumber',
        disabled: true,
        label: intl.get('sagm.common.model.agreementCode').d('协议编码'),
      },
      {
        name: 'agreementName',
        label: intl.get('sagm.common.model.agreementName').d('协议名称'),
        required: true,
        type: 'intl',
      },
      {
        name: 'versionNum',
        label: intl.get('sagm.common.model.version').d('版本'),
        disabled: true,
      },
      {
        name: 'sourceFrom',
        label: intl.get('sagm.common.model.sourceFrom').d('单据来源'),
        type: 'string',
        required: true,
        disabled: true,
        defaultValue: 'MANUAL',
        lookupCode: 'SMAL.AGREEMENT_FROM',
      },
      {
        name: 'agreementStatus',
      },
      {
        name: 'agreementStatusMeaning',
        label: intl.get('sagm.common.model.agreementStatusMeaning').d('协议状态'),
        disabled: true,
        ignore: 'always',
        transformResponse: (_, record) =>
          record.agreementStatusMeaning || intl.get('small.common.model.create').d('新建'),
      },
      {
        name: 'creationDate',
        label: intl.get('sagm.common.model.creationDateTime').d('创建时间'),
        type: 'dateTime',
        disabled: true,
      },
      {
        name: 'company',
        label: intl.get('sagm.common.model.company').d('公司'),
        type: 'object',
        required: true,
        valueField: 'companyId',
        textField: 'companyName',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        dynamicProps: { disabled: dpDisable },
        ignore: 'always',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'companyId',
        bind: 'company.companyId',
      },
      {
        name: 'companyName',
        bind: 'company.companyName',
      },
      {
        name: 'supplier',
        label: intl.get('sagm.common.model.supplier').d('供应商'),
        type: 'object',
        required: true,
        lovCode: 'SSLM.SUPPLIER',
        textField: 'supplierCompanyName',
        valueField: 'supplierCompanyId',
        cascadeMap: { value: 'company' },
        ignore: 'always',
        dynamicProps: {
          disabled: dpDisable,
          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              companyId: record.get('companyId'),
            };
          },
        },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplier.supplierCompanyId',
      },
      {
        name: 'supplierCompanyName',
        bind: 'supplier.supplierCompanyName',
      },
      {
        name: 'supplierTenantId',
        bind: 'supplier.supplierTenantId',
      },
      {
        name: 'remark',
        label: intl.get('sagm.common.model.remark').d('备注'),
        type: 'string',
        maxLength: 60,
        transformResponse: (_, record) => record.remarkMeaning || record.remark,
      },
      {
        name: 'uuid',
        type: 'attachment',
        label: intl.get('hzero.common.view.title.attachmentList').d('内部附件'),
      },
    ],
    transport: {
      read({ data }) {
        const url = isHistory
          ? `${SRM_AGM}/v1/${organizationId}/agreement-hiss`
          : `${SRM_AGM}/v1/${organizationId}/agreements`;

        return {
          url,
          method: 'GET',
          data: { tenantId: organizationId, ...data, ...queryParams },
        };
      },
    },
    events: {
      update({ record }) {
        if (!record.get('company')) {
          record.set('supplier', null);
        }
      },
    },
  };
};

/**
 * @param {*} isPrice 是否来源于价格库
 * @returns
 */
const lineDs = (isPrice, isHistory) => ({
  primaryKey: 'agreementLineId',
  // table表单显示的字段
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
      disabled: isPrice,
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
      type: 'string',
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
      // disabled: isPrice,
      dynamicProps: {
        disabled: ({ record }) => record.get('itemCode') || isPrice,
      },
    },
    {
      label: intl.get('small.common.model.itemCategory').d('物料分类'),
      name: 'itemCategoryLov',
      type: 'object',
      ignore: 'always',
      disabled: isPrice,
      textField: 'categoryName',
      valueField: 'categoryCode',
      // lovCode: 'SMDM.ITEM_CATEGORY_BY_ITEM_ID',
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
      label: intl.get('sagm.common.model.catalog').d('目录'),
      name: 'catalogLov',
      type: 'object',
      ignore: 'always',
      textField: 'catalogName',
      valueField: 'catalogId',
      // readOnly: true, // 导致必输样式问题，暂时注释
      required: true,
      transformResponse: (_, record) => {
        return record.catalogId
          ? {
              catalogId: record.catalogId,
              catalogName: record.catalogName,
            }
          : null;
      },
    },
    {
      name: 'catalogId',
      type: 'string',
      bind: 'catalogLov.catalogId',
    },
    {
      name: 'catalogName',
      type: 'string',
      bind: 'catalogLov.catalogName',
    },
    {
      label: intl.get('small.common.model.status').d('状态'),
      name: 'effectiveFlag',
      type: 'string',
    },
    // {
    //   name: 'validDate',
    //   label: intl.get('sagm.common.view.validDate').d('有效期'),
    //   type: 'date',
    //   range: ['start', 'end'],
    //   ignore: 'always',
    //   validator: (value, name, record) => {
    //     if (record.get('priceValidDateFrom') && !value) {
    //       return intl.get('sagm.common.view.enterValidDateFrom').d('请输入有效期从');
    //     }
    //     if (record.get('priceValidDateTo') && !value) {
    //       return intl.get('sagm.common.view.enterValidDateTo').d('请输入有效期至');
    //     }
    //   },
    // },
    {
      label: intl.get('small.common.model.dateFrom').d('有效期从'),
      type: 'date',
      name: 'validDateFrom',
      bind: 'validDate.start',
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
    },
    {
      label: intl.get('small.common.model.dateTo').d('有效期至'),
      type: 'date',
      name: 'validDateTo',
      bind: 'validDate.end',
      dynamicProps: {
        required: ({ record }) => !!record.get('priceValidDateTo'),
        // 来源于价格库有效期只能在原范围内修改
        min: ({ record }) =>
          record.get('validDateFrom') || record.get('priceValidDateFrom') || moment(),
        max: ({ record }) => {
          const max = record.get('priceValidDateTo');
          return max || undefined;
        },
      },
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
      disabled: isPrice,
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
      disabled: isPrice,
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
      disabled: isPrice,
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
      disabled: isPrice,
    },
    {
      label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
      name: 'unitPrice',
      type: 'number',
      min: 0,
      dynamicProps: {
        required: ({ record }) =>
          record.get('priceType') === 'REGULAR_PRICE' && record.get('currencyCode'),
        disabled: ({ record }) =>
          isPrice || !record.get('currencyCode') || record.get('priceType') === 'LADDER_PRICE',
      },
      validator: priceValidator,
    },
    {
      label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
      name: 'taxPrice',
      type: 'number',
      min: 0,
      dynamicProps: {
        required: ({ record }) =>
          record.get('priceType') === 'REGULAR_PRICE' && record.get('currencyCode'),
        disabled: ({ record }) =>
          isPrice || !record.get('currencyCode') || record.get('priceType') === 'LADDER_PRICE',
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
      // lookupCode: 'HPFM.FLAG',
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
      // disabled: isPrice,
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
      ignore: 'always',
      type: 'object',
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
      defaultValue: 9999999999,
      validator: quantityValidator,
      dynamicProps: {
        ...uomDpmic(),
      },
    },
    {
      label: intl.get('small.common.model.orderQuantity').d('起订量'),
      name: 'orderQuantity',
      type: 'number',
      required: true,
      defaultValue: 1,
      validator: quantityValidator,
      dynamicProps: {
        ...uomDpmic(),
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
      defaultValue: 1,
      validator: quantityValidator,
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('small.common.view.minPackageQuantityOverMax')
          .d('最小包装量应小于等于起订量'),
      },
      dynamicProps: {
        ...uomDpmic(),
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
      defaultValue: '99999999999999999999',
      validator: quantityValidator,
      dynamicProps: {
        ...uomDpmic(),
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
      // max: '99999999999999999999',
      defaultValue: '99999999999999999999',
      dynamicProps: {
        required: ({ record }) => record.get('currencyCode'),
        disabled: ({ record }) => !record.get('currencyCode'),
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
      dynamicProps: {
        disabled: ({ record }) => {
          const effectiveFlag = record.get('effectiveFlag');
          return effectiveFlag === -1;
        },
      },
      validator: (value, name, record) => {
        if (record.get('allRegionFlag')) return true;
        return value?.regionEnableFlag === 0
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
      dynamicProps: {
        readOnly: ({ record }) => {
          const editFlag = record.get('companyAssignEditFlag');
          const effectiveFlag = record.get('effectiveFlag');
          return effectiveFlag === -1 || (isPrice && editFlag !== -1);
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
      disabled: isPrice,
      maxLength: 100,
    },
    {
      name: 'priceSourceFromLnNum',
      label: intl.get('sagm.common.model.sourceFromLnNum').d('合同行号'),
      disabled: isPrice,
      maxLength: 100,
    },
    {
      label: intl.get('small.common.model.deliveryDay').d('供货周期(天)'),
      name: 'deliveryDay',
      type: 'number',
      step: 1,
      min: 0,
    },
    {
      label: intl.get('small.common.model.guaranteeDay').d('质保期(天)'),
      name: 'guaranteeDay',
      type: 'number',
      step: 1,
      min: 0,
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
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operation',
    },
    {
      name: 'editUnitRegionFlag',
    },
  ].filter((s) => s.show !== false),
  events: {
    // load: ({ dataSet }) => {
    //   dataSet.validate(); // 触发页面初次加载区域失效校验
    // },
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
    read: () => {
      const url = isHistory
        ? `/sagm/v1/${organizationId}/agreement-line-hiss`
        : `/sagm/v1/${organizationId}/agreement-lines`;

      return {
        url,
        method: 'GET',
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

/**
 * 物料
 */
const itemProductDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('small.common.model.productIntroTemp').d('商品介绍模板'),
      name: 'details',
      type: 'object',
      textField: 'templateName',
      valueField: 'templateId',
      options: new DataSet({
        autoQuery: true,
        transport: {
          read: ({ data }) => {
            return {
              url: `/smpc/v1/${organizationId}/sku-detail-templates`,
              method: 'GET',
              data: {
                enabledFlag: 1,
                size: 0,
                ...data,
              },
            };
          },
        },
      }),
    },
    {
      name: 'content',
      type: 'string',
      bind: 'details.content',
    },
    {
      label: intl.get('small.common.model.platformCategory').d('平台分类'),
      name: 'categoryLov',
      type: 'object',
      ignore: 'always',
      required: true,
      textField: 'categoryName',
      valueField: 'categoryId',
      // lovCode: 'SMPC.CATEGORY',
      lovPara: { supplierTenantId: organizationId },
    },
    {
      name: 'categoryId',
      type: 'string',
      bind: 'categoryLov.categoryId',
    },
    {
      name: 'categoryName',
      type: 'string',
      bind: 'categoryLov.categoryName',
    },
  ],
  // transport: {
  //   read: () => {
  //     return {
  //       url: `/sagm/v1/${organizationId}/agreement-lines`,
  //       method: 'GET',
  //     };
  //   },
  // },
});

export { baseInfoDs, lineDs, itemProductDs };
