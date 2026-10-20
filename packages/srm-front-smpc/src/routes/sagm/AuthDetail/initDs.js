import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { isCustomNumber } from '@/utils/precision';

const organizationId = getCurrentOrganizationId();

// 详情formDs
const formDs = () => ({
  fields: [
    {
      name: 'authorityListCode',
      type: 'string',
      disabled: true,
      label: intl.get('sagm.common.model.authorityCode').d('权限编码'),
    },
    {
      name: 'authorityListName',
      type: 'string',
      required: true,
      label: intl.get('sagm.common.model.authorityName').d('权限名称'),
    },
    {
      name: 'agreementTypeMeaning',
      type: 'string',
      disabled: true,
      label: intl.get('sagm.common.model.dataFrom').d('数据来源'),
    },
    {
      name: 'agreementHeaderNum',
      type: 'string',
      disabled: true,
      label: intl.get('sagm.common.model.sourceNum').d('来源单号'),
    },
    {
      name: 'realName',
      type: 'string',
      disabled: true,
      label: intl.get('sagm.common.model.createBy').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      disabled: true,
      label: intl.get('sagm.common.model.creationDate').d('创建时间'),
    },
    {
      name: 'statusCodeMeaning',
      type: 'string',
      disabled: true,
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'controlWayCodeMeaning',
      type: 'string',
      required: true,
      label: intl.get('sagm.common.model.controlMethod').d('控制方式'),
    },
    {
      name: 'controlRangeMeaning',
      required: true,
      label: intl.get('sagm.common.view.controlRange').d('控制范围'),
    },
    {
      name: 'operationAuthMeaning',
      type: 'string',
      label: intl.get('sagm.common.view.operationAuth').d('操作权限'),
    },
    {
      name: 'effectiveDate',
      label: intl.get('sagm.common.view.validDate').d('有效期'),
      type: 'date',
      ignore: 'always',
      range: ['start', 'end'],
    },
    {
      name: 'effectiveStartDate',
      bind: 'effectiveDate.start',
      type: 'date',
      label: intl.get('sagm.common.model.dateFrom').d('有效期从'),
    },
    {
      name: 'effectiveEndDate',
      bind: 'effectiveDate.end',
      type: 'date',
      label: intl.get('sagm.common.model.dateTo').d('有效期至'),
    },
    {
      name: 'remarkMeaning',
      type: 'string',
      label: intl.get('sagm.common.model.remark').d('备注'),
    },
    {
      name: 'enableFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      required: true,
      readOnly: true,
      label: intl.get('hzero.common.button.enable').d('启用'),
    },
    {
      name: 'allUserEnable',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      readOnly: true,
      label: intl.get('sagm.common.model.allUser').d('全部用户'),
    },
    {
      name: 'allSkuEnable',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      readOnly: true,
      label: intl.get('sagm.common.model.allSku').d('全部商品'),
    },
  ],
});

const validatePrice = (price) => {
  let integarFlag = false;
  let decimalFlag = false;
  if (isCustomNumber(price)) {
    const prevLength = math.floor(price).toLocaleString().replace(/,/g, '').length;
    const nextLength = math.dp(price) || 0;
    if (prevLength > 20) {
      integarFlag = true;
    }
    if (nextLength > 10) {
      decimalFlag = true;
    }
  }
  return [integarFlag, decimalFlag];
};

const tableDs = () => ({
  paging: false,
  selection: false,
  autoLocateFirst: false,
  autoLocateAfterCreate: false,
  fields: [
    {
      name: 'dimension',
      label: intl.get('sagm.common.view.dimension').d('维度'),
    },
    {
      name: 'dimensionCode',
      type: 'string',
      required: true,
      label: intl.get('sagm.common.view.dimension').d('维度'),
      dynamicProps: ({ record }) => ({
        disabled: record.get('_status') === 'update',
      }),
    },
    {
      name: 'dimensionValue',
      label: intl.get('sagm.common.view.value').d('值'),
    },
    {
      name: 'customDimension',
      label: intl.get('sagm.common.view.value').d('值'),
      multiple: true,
      type: 'object',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'customSelect',
      label: intl.get('sagm.common.view.value').d('值'),
      multiple: true,
      type: 'string',
    },
    {
      name: 'ORG',
      label: intl.get('sagm.common.model.organization').d('组织'),
      multiple: true,
      type: 'object',
      textField: 'unitName',
      valueField: 'unitId',
      dynamicProps({ record }) {
        return {
          required: record.get('dimensionCode') === 'ORG' && !record.getState('customDimension'),
        };
      },
      transformResponse: (_, record) => {
        return (record.ORG || []).map((m) => ({
          ...m,
          unitName: m.unitName || m.orgName,
          unitId: m.unitId || m.orgId,
          key: m.key || m.orgId,
          levelPath: m.levelPath || m.orgLevelPath,
        }));
      },
    },
    {
      name: 'ROLE',
      label: intl.get('sagm.common.model.role').d('角色'),
      multiple: true,
      type: 'object',
      lovCode: 'HIAM.USER_ROLE_MANAGER',
      textField: 'name',
      valueField: 'id',
      dynamicProps({ record }) {
        return {
          required: record.get('dimensionCode') === 'ROLE' && !record.getState('customDimension'),
        };
      },
      transformResponse: (_, record) => {
        return (record.ROLE || []).map((m) => ({
          ...m,
          name: m.name || m.roleName,
          code: m.code || m.roleCode,
          id: m.id || m.roleId,
        }));
      },
    },
    {
      name: 'USER',
      label: intl.get('sagm.common.model.subAccount').d('子账户'),
      multiple: true,
      type: 'object',
      lovCode: 'HIAM.USER_ACCOUNT',
      textField: 'realName',
      valueField: 'id',
      dynamicProps({ record }) {
        return {
          required: record.get('dimensionCode') === 'USER' && !record.getState('customDimension'),
        };
      },
      transformResponse: (_, record) => {
        return (record.USER || []).map((m) => ({
          ...m,
          realName: m.realName || m.userName,
          id: m.id || m.userId,
        }));
      },
    },
    {
      name: 'AREA',
      label: intl.get('sagm.common.model.area').d('区域'),
      multiple: true,
      type: 'object',
      textField: 'regionName',
      valueField: 'regionCode',
      dynamicProps({ record }) {
        return {
          required: record.get('dimensionCode') === 'AREA' && !record.getState('customDimension'),
        };
      },
      transformResponse: (_, record) => {
        return (record.AREA || []).map((m) => ({
          ...m,
          key: m.key || m.regionCode,
          regionName: m.regionName || m.areaName,
          levelPath: m.levelPath || m.areaLevelPath,
          // regionCode: m.unitId || m.orgId,
        }));
      },
    },
    {
      name: 'CATALOG',
      label: intl.get('sagm.common.model.category').d('分类'),
      multiple: true,
      type: 'object',
      textField: 'categoryName',
      valueField: 'categoryId',
      dynamicProps({ record }) {
        return {
          required:
            record.get('dimensionCode') === 'CATALOG' && !record.getState('customDimension'),
        };
      },
      transformResponse: (_, record) => {
        return (record.CATALOG || []).map((m) => ({
          ...m,
          categoryName: m.categoryName || m.name,
          categoryId: m.catgegoryId || m.catalogId,
          key: m.key || m.catalogId,
        }));
      },
    },
    {
      name: 'DIRECTORY',
      label: intl.get('sagm.common.model.catalog').d('目录'),
      multiple: true,
      type: 'object',
      textField: 'catalogName',
      valueField: 'catalogId',
      dynamicProps({ record }) {
        return {
          required:
            record.get('dimensionCode') === 'DIRECTORY' && !record.getState('customDimension'),
        };
      },
      transformResponse: (_, record) => {
        return (record.DIRECTORY || []).map((m) => ({
          ...m,
          catalogCode: m.directoryCode,
          catalogName: m.directoryName,
          catalogId: m.directoryId,
          key: m.directoryId,
        }));
      },
    },
    {
      name: 'PRICE_RANGE',
      label: intl.get('sagm.common.model.priceRange').d('价格范围'),
      type: 'number',
      range: ['priceFrom', 'priceTo'],
      min: 0,
      multiple: false,
      // range: true,
      dynamicProps({ record }) {
        return {
          required:
            record.get('dimensionCode') === 'PRICE_RANGE' && !record.getState('customDimension'),
        };
      },
      validator: (value, name, record) => {
        const { priceFrom, priceTo } = value || {};
        const code = record.get('dimensionCode');
        if (code !== name) {
          return true;
        }
        if (!isCustomNumber(priceFrom) && !isCustomNumber(priceTo)) {
          return intl.get('sagm.common.view.priceRange.notNull').d('请输入价格范围');
        }
        if (!isCustomNumber(priceFrom)) {
          return intl.get('sagm.common.view.priceFrom.notNull').d('请输入价格从');
        }
        if (!isCustomNumber(priceTo)) {
          return intl.get('sagm.common.view.priceTo.notNull').d('请输入价格至');
        }
        let priceValidates = validatePrice(priceFrom);
        if (priceValidates[0]) {
          return intl
            .get('sagm.common.view.priceFrom.integarOverLength')
            .d('价格从整数位不能超过二十位');
        }
        if (priceValidates[1]) {
          return intl
            .get('sagm.common.view.priceFrom.decimalOverLength')
            .d('价格从小数位不能超过十位');
        }
        priceValidates = validatePrice(priceTo);
        if (priceValidates[0]) {
          return intl
            .get('sagm.common.view.priceTo.integarOverLength')
            .d('价格至整数位不能超过二十位');
        }
        if (priceValidates[1]) {
          return intl
            .get('sagm.common.view.priceTo.decimalOverLength')
            .d('价格至小数位不能超过十位');
        }
      },
    },
    {
      name: 'SUPPLIER',
      label: intl.get('sagm.common.model.supplier').d('供应商'),
      multiple: true,
      type: 'object',
      lovCode: 'SMAL.SUPPLIER_BY_PUR',
      lovPara: { tenantId: organizationId },
      textField: 'supplierName',
      valueField: 'supplierId',
      dynamicProps({ record }) {
        return {
          required:
            record.get('dimensionCode') === 'SUPPLIER' && !record.getState('customDimension'),
        };
      },
      transformResponse: (_, record) => {
        return (record.SUPPLIER || []).map((m) => ({
          ...m,
          supplierName: m.supplierName || m.supplierCompanyName,
          supplierId: m.supplierId || m.supplierCompanyId,
          supplierNum: m.supplierNum || m.supplierCompanyNum,
        }));
      },
    },
    {
      name: 'SKU_LABEL',
      label: intl.get('sagm.common.model.skuLabel').d('商品标签'),
      multiple: true,
      type: 'object',
      lovCode: 'SMPC.SKU_LABEL',
      lovPara: { tenantId: organizationId, enabledFlag: 1 },
      textField: 'labelName',
      valueField: 'labelId',
    },
    {
      name: 'MEMBER',
      label: intl.get('sagm.common.view.member').d('会员'),
      multiple: true,
      type: 'object',
      lovCode: 'SIGL.MEMBER',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'MEMBER_LABEL',
      label: intl.get('sagm.common.view.memberLabel').d('会员标签'),
      multiple: true,
      type: 'object',
      lovCode: 'SIGL.MEMBER_LABEL',
      lovPara: { tenantId: organizationId },
      transformResponse: (_, record) => {
        return (record.MEMBER_LABEL || []).map((m) => ({
          ...m,
          labelId: m.memberLabelId,
          labelCode: m.memberLabelCode,
          labelName: m.memberLabelName,
        }));
      },
    },
    {
      name: 'COMMODITY_SOURCE',
      label: intl.get('sagm.common.model.skuSource').d('商品来源'),
      lookupCode: 'SMAL.PRODUCT_SOURCE_FROM',
      transformResponse: (_, record) => record.COMMODITY_SOURCE?.skuType,
    },
    {
      name: 'hasSku',
      defaultValue: 0,
    },
  ],
});

export { formDs, tableDs };
