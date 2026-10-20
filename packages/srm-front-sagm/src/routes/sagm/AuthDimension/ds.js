// import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { CODE_UPPER } from 'utils/regExp';

// 判断是否为该值 val === 0 || val === '0'
export function valueIsNumber(val, number) {
  return [number, `${number}`].includes(val);
}

// 动态必输与显示集
export function getShowOrRequired(fieldName) {
  // 是用户范围
  const isUserRange = ({ record }) => record && record.get('dimensionType') === 'USER';
  // 是组织维度
  const isOrgDimension = ({ record }) => valueIsNumber(record.get('unitDimensionFlag'), 1);
  // 手动选择值集
  const isManualInput = ({ record }) => valueIsNumber(record.get('inputFlag'), 1);
  // sql填充
  const isValueSql = ({ record }) => valueIsNumber(record.get('inputFlag'), 0);
  const dynamicShowOrRequired = {
    unitDimensionFlag: [isUserRange],
    editFlag: [isUserRange, isOrgDimension],
    inputFlag: [isUserRange, isOrgDimension],
    lovCodeLov: [isUserRange, isOrgDimension],
    inputLov: [isUserRange, isOrgDimension, isManualInput],
    valueSql: [isUserRange, isOrgDimension, isValueSql],
  };
  const showOrRequireds = dynamicShowOrRequired[fieldName];
  return (...rest) => {
    return showOrRequireds.every(f => f(...rest));
  };
}

const tableDs = () => ({
  autoQuery: false,
  selection: false,
  queryFields: [
    {
      name: 'dimensionName',
      label: intl.get('sagm.dimension.view.dimensionName').d('维度名称'),
    },
    {
      name: 'tenantLov',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      ignore: 'always',
      label: intl.get('sagm.common.view.belongTenant').d('所属租户'),
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
  ],
  fields: [
    {
      name: 'dimensionCode',
      label: intl.get('sagm.dimension.view.dimensionCode').d('维度编码'),
      required: true,
      pattern: CODE_UPPER,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('hzero.common.validation.codeUpper')
          .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
      },
    },
    {
      name: 'dimensionName',
      label: intl.get('sagm.dimension.view.dimensionName').d('维度名称'),
      required: true,
      type: 'intl',
    },
    {
      name: 'tenantLov',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      label: intl.get('sagm.common.view.belongTenant').d('所属租户'),
      required: true,
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantLov.tenantName',
    },
    {
      name: 'orderSeq',
      label: intl.get('sagm.common.view.sortNum').d('排序号'),
      required: true,
    },
    {
      name: 'dimensionType',
      label: intl.get('sagm.dimension.view.dimensionType').d('维度类型'),
      required: true,
      lookupCode: 'SAGM.AUTH_RANGE_TYPE',
    },
    {
      name: 'unitDimensionFlag',
      label: intl.get('sagm.dimension.view.orgDimension').d('组织维度'),
      lookupCode: 'HPFM.FLAG',
      dynamicProps: {
        required: getShowOrRequired('unitDimensionFlag'),
      },
    },
    {
      name: 'editFlag',
      label: intl.get('sagm.dimension.view.editArea').d('编辑区域'),
      lookupCode: 'SAGM.AUTH_BACK_EDIT_TYPE',
      dynamicProps: {
        required: getShowOrRequired('editFlag'),
      },
    },
    {
      name: 'inputFlag',
      label: intl.get('sagm.dimension.view.inputMethod').d('录入方式'),
      lookupCode: 'SAMG.AUTH_INPUT_TYPE',
      dynamicProps: {
        required: getShowOrRequired('inputFlag'),
      },
    },
    {
      name: 'lovCodeLov',
      type: 'object',
      label: intl.get('sagm.common.view.backstageLovCode').d('后台值集'),
      lovCode: 'HPFM.LOV_VIEW.CODE',
      valueField: 'viewCode',
      textField: 'viewCode',
      dynamicProps: {
        required: getShowOrRequired('lovCodeLov'),
      },
    },
    {
      name: 'lovCode',
      bind: 'lovCodeLov.viewCode',
    },
    {
      name: 'inputLov',
      label: intl.get('sagm.dimension.view.inputLovCode').d('录入值集'),
      lookupCode: 'HPFM.FLAG',
      type: 'object',
      lovCode: 'HPFM.LOV_VIEW.CODE',
      valueField: 'viewCode',
      textField: 'viewCode',
      dynamicProps: {
        required: getShowOrRequired('inputLov'),
      },
    },
    {
      name: 'inputLovCode',
      bind: 'inputLov.viewCode',
    },
    {
      name: 'valueType',
      label: intl.get('sagm.dimension.view.lovType').d('值集类型'),
      required: true,
      lookupCode: 'SAGM.PARAM_VALUE_TYPE',
    },
    {
      name: 'componentType',
      label: intl.get('sagm.dimension.view.componentType').d('组件类型'),
      required: true,
      lookupCode: 'SAGM.AUTH_COMPONENT',
    },
    {
      name: 'channel',
      label: intl.get('sagm.common.view.belongChannel').d('所属频道'),
      lookupCode: 'SAGM.DIMENSION_CHANNEL',
      defaultValue: 'NONE',
      required: true,
    },
    {
      name: 'enabledFlag',
      label: intl.get('hzero.common.enable').d('启用'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'valueSql',
      label: intl.get('sagm.dimension.view.valueSql').d('取值SQL'),
      dynamicProps: {
        required: getShowOrRequired('valueSql'),
      },
    },
    {
      name: 'enableFlag',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `/sagm/v1/auth-dimensions`,
      method: 'GET',
    },
  },
});

export { tableDs };
