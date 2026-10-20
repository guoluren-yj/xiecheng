import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import { isArray, omit } from 'lodash';
import { HZERO_PLATFORM } from 'utils/config';
import { isJSON } from './util';

const organizationId = getCurrentOrganizationId();

const tableDS = ({
  targetName = '',
  businessKey = '',
  type = 'edit',
  metaBusinessKey = '',
  documentType = '',
}) => {
  return {
    selection: type === 'edit' ? 'multiple' : false,
    pageSize: 20,
    primaryKey: 'actionId',
    fields: [
      {
        name: 'actionName',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.actionName').d('策略名称'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl
          .get('ssrc.rulesDefinition.model.rulesDefinition.actionDescription')
          .d('策略描述'),
      },
      {
        name: 'priority',
        type: 'number',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.priority').d('优先级'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.action').d('操作'),
      },
    ],
    transport: {
      read: ({ data, params }) => ({
        url: `${SRM_SSRC}/v2/${organizationId}/cnf-actions/page`,
        method: 'POST',
        params,
        data: {
          ...data,
          targetField: targetName,
          fullPathCode: ['RFI', 'RFP'].includes(documentType)
            ? 'SSRC.RF_TEMPLSTE_DEFINE_V2'
            : 'SSRC.SOURCE_TEMPLATE_DEFINE_V2',
          businessKey,
          metaBusinessKey,
        },
      }),
      destroy: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v2/${organizationId}/cnf-actions/delete`,
          method: 'POST',
          data: {
            actionIdList: data.map((item) => item.actionId),
          },
        };
      },
    },
  };
};

// 策略服务 头数据 ds
const getPolicyConfigDataDs = () => {
  return {
    fields: [
      {
        name: 'actionName',
        type: 'intl',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.actionName').d('策略名称'),
        required: true,
      },
      {
        name: 'description',
        type: 'intl',
        label: intl
          .get('ssrc.rulesDefinition.model.rulesDefinition.actionDescription')
          .d('策略描述'),
        required: true,
      },
      {
        name: 'priority',
        type: 'number',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.priority').d('优先级'),
        required: true,
        min: 0,
        step: 1,
      },
      {
        name: 'conditionExpression',
        type: 'string',
        label: intl
          .get('ssrc.rulesDefinition.model.rulesDefinition.conditionExpression')
          .d('表达式'),
        disabled: true,
      },
      {
        name: 'conditionType',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.conditionType').d('策略逻辑'),
        required: true,
        defaultValue: 'TRUE',
      },
    ],
    selection: false,
    paging: false,
  };
};

// 策略服务条件 ds
const getConditionJsonDs = () => {
  let __valueOption;
  let __newOption;
  let optionsDs = [];
  return {
    fields: [
      {
        name: 'leftValue',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.leftValue').d('特性'),
        textField: 'label',
        valueField: 'name',
        required: true,
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.operator').d('特性条件'),
        required: true,
        textField: 'meaning',
      },
      {
        dynamicProps: {
          multiple: ({ record }) => {
            const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
              record.get('operator')
            );
            return isNumberType ? false : !!['IN', 'NOT_IN'].includes(record.get('operator'));
          },
          lovCode: ({ dataSet, record }) => {
            const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
              record.get('operator')
            );
            const options =
              (dataSet.getField('leftValue').get('options') &&
                dataSet.getField('leftValue').get('options').toData()) ||
              [];
            const leftValueOption =
              options.find((option) => option.name === record.get('leftValue')) || {};
            if (leftValueOption.lovCode) {
              __valueOption = leftValueOption.valueField;
              __newOption = leftValueOption;
            } else {
              __valueOption = undefined;
              __newOption = undefined;
            }
            return isNumberType ? null : leftValueOption.lovCode ? leftValueOption.lovCode : null;
          },
          type: ({ dataSet, record }) => {
            const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
              record.get('operator')
            );
            const options =
              (dataSet.getField('leftValue').get('options') &&
                dataSet.getField('leftValue').get('options').toData()) ||
              [];
            const leftValueOption =
              options.find((option) => option.name === record.get('leftValue')) || {};
            if (leftValueOption.lovCode) {
              __valueOption = leftValueOption.valueField;
              __newOption = leftValueOption;
            } else {
              __valueOption = undefined;
              __newOption = undefined;
            }
            return isNumberType ? 'number' : leftValueOption.lovCode ? 'object' : 'string';
          },
          disabled: ({ record }) => {
            return ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },
          required: ({ record }) => {
            return !['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },
          textField: ({ record }) => {
            const fieldDefinition = record.get('fieldDefinition') || {};
            return fieldDefinition.textField || 'meaning';
          },
          valueField: ({ record }) => {
            const fieldDefinition = record.get('fieldDefinition') || {};
            return fieldDefinition.valueField || 'value';
          },
          options: ({ dataSet, record }) => {
            const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
              record.get('operator')
            );
            const options =
              (dataSet.getField('leftValue').get('options') &&
                dataSet.getField('leftValue').get('options').toData()) ||
              [];
            const leftValueOption =
              options.find((option) => option.name === record.get('leftValue')) || {};
            if (leftValueOption.lovCode) {
              __valueOption = leftValueOption.valueField;
              __newOption = leftValueOption;
            } else {
              __valueOption = undefined;
              __newOption = undefined;
            }
            return isNumberType
              ? null
              : leftValueOption.lookupCode
              ? (optionsDs.find((od) => od.lookupCode === leftValueOption.lookupCode) || {}).ds
              : null;
          },
        },
        optionsProps: {
          paging: 'server',
        },
        name: 'rightValue',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.rightValue').d('特性值'),
        transformRequest: (value, record = {}) => {
          if (!value) return value;
          const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
            record.get('operator')
          );
          if (isNumberType) return value;
          const fieldDefinition = record.get('fieldDefinition');
          if (fieldDefinition && fieldDefinition.lovCode) {
            return ['IN', 'NOT_IN'].includes(record.get('operator'))
              ? JSON.stringify(value.map((v) => v[fieldDefinition.valueField]))
              : value[fieldDefinition.valueField];
          } else if (__valueOption) {
            return ['IN', 'NOT_IN'].includes(record.get('operator'))
              ? JSON.stringify(value.map((v) => v[__valueOption]))
              : value[__valueOption];
          } else {
            return isArray(value) ? JSON.stringify(value) : value;
          }
        },
        transformResponse: (value, object) => {
          const { fieldDefinition = {}, rightValueMeaning, operator } = object;
          if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(operator)) {
            return value;
          }
          if (object.fieldDefinition && object.fieldDefinition.lookupCode) {
            optionsDs = pushLookupCodeArray(optionsDs, object.fieldDefinition.lookupCode);
          }
          if (fieldDefinition && fieldDefinition.lovCode) {
            return ['IN', 'NOT_IN'].includes(object.operator)
              ? JSON.parse(value || '[]').map((v, index) => {
                  return {
                    ...v,
                    [fieldDefinition.textField]: JSON.parse(rightValueMeaning || '[]')[index],
                    [fieldDefinition.valueField]: v,
                  };
                })
              : {
                  ...value,
                  [fieldDefinition.textField]: rightValueMeaning,
                  [fieldDefinition.valueField]: value,
                };
          } else {
            return isJSON(value) ? JSON.parse(value) : value;
          }
        },
      },
      {
        name: 'fieldDefinition',
      },
    ],
    selection: false,
    paging: false,
    events: {
      update: ({ dataSet, record, name }) => {
        const options =
          (dataSet.getField('leftValue').get('options') &&
            dataSet.getField('leftValue').get('options').toData()) ||
          [];
        const leftValueOption =
          options.find((option) => option.name === record.get('leftValue')) || {};

        if (leftValueOption.lovCode) {
          __valueOption = leftValueOption.valueField;
          __newOption = leftValueOption;
        } else {
          __valueOption = undefined;
          __newOption = undefined;
        }

        if (name === 'leftValue') {
          record.set('operator', '');
          record.init('rightValue', undefined);
          record.set('fieldDefinition', __newOption);
        }
        if (name === 'operator') {
          record.set('rightValue', undefined);
          // 判断是否已经有 __newOption ,如果存在的话，二次设定值保证获取到的是最新数据，如果没有数据，可能是二次编辑操作，不对值进行修改
          if (__newOption) {
            record.set('fieldDefinition', __newOption);
          }
        }

        if (leftValueOption.lookupCode) {
          optionsDs = pushLookupCodeArray(optionsDs, leftValueOption.lookupCode);
        }
      },
    },
  };
};

// 如果渲染的是 lookup 下拉框，查询下拉框数据，放到数组中
function pushLookupCodeArray(optionsDs, lookupCode) {
  if (optionsDs.filter((ds) => ds.lookupCode === lookupCode).length <= 0) {
    optionsDs.push({
      lookupCode,
      ds: new DataSet({
        selection: 'single',
        autoQuery: true,
        paging: false,
        transport: {
          read: ({ params }) => {
            return {
              url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/data?lovCode=${lookupCode}`,
              method: 'GET',
              params: omit(params, ['page', 'size']),
            };
          },
        },
      }),
    });
  }
  return optionsDs;
}

// 参数服务表格 ds
const getParamTableDs = () => {
  return {
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.paramName').d('字段名'),
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.paramType').d('类型'),
      },
      {
        name: 'label',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.paramLabel').d('字段描述'),
      },
      {
        name: 'lookupCode',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.paramLookupCode').d('值集'),
      },
      {
        name: 'lovCode',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.paramLovCode').d('值集视图'),
      },
      {
        name: 'textField',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.paramTextField').d('显示值'),
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.paramValueField').d('存储值'),
      },
    ],
    paging: false,
    selection: false,
  };
};

const getReturnValueTableDs = () => {
  return {
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.returnValueName').d('参数名'),
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.returnValueType').d('类型'),
      },
      {
        name: 'label',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.model.rulesDefinition.returnValueLabel').d('名称'),
      },
      {
        name: 'lookupCode',
        type: 'string',
        label: intl
          .get('ssrc.rulesDefinition.model.rulesDefinition.returnValueLookupCode')
          .d('值集Code'),
      },
      {
        name: 'lovCode',
        type: 'string',
        label: intl
          .get('ssrc.rulesDefinition.model.rulesDefinition.returnValueLovCode')
          .d('Lov值集Code'),
      },
      {
        name: 'textField',
        type: 'string',
        label: intl
          .get('ssrc.rulesDefinition.model.rulesDefinition.returnValueTextField')
          .d('显示值'),
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl
          .get('ssrc.rulesDefinition.model.rulesDefinition.valueFieldValueField')
          .d('存储值'),
      },
    ],
    paging: false,
    selection: false,
  };
};

// 用户自定义租户Ds
const getCustomizeConditionCombinationDs = () => {
  return {
    fields: [
      {
        name: 'customizeConditionCombination',
        type: 'string',
        label: intl.get('ssrc.rulesDefinition.view.select.customize').d('自定义组合规则'),
        validator: (value) => {
          if (/^[A-Z0-9 )(]+$/.test(value)) {
            return /^((AND)|(OR)|[0-9 )(]+)+$/.test(value);
          } else {
            return intl.get('ssrc.rulesDefinition.validator.pattern_mismatch').d('请输入有效的值');
          }
        },
        required: true,
      },
    ],
  };
};

// 特性条件 ds
const getCondOperatorDs = () => {
  return [
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.less').d('小于'),
      value: 'LESS',
      type: 'number',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.lessOrEqual').d('小于等于'),
      value: 'LESSOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.equals').d('等于'),
      value: 'EQUALS',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.more').d('大于等于'),
      value: 'MOREOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.moreOrEqual').d('大于'),
      value: 'MORE',
      type: 'number',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.in').d('包含'),
      value: 'IN',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.notIn').d('不包含'),
      value: 'NOT_IN',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.notequals').d('不等于'),
      value: 'NOTEQUALS',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.exists').d('不为空'),
      value: 'EXISTS',
    },
    {
      meaning: intl.get('ssrc.rulesDefinition.model.rulesDefinition.not_exists').d('为空'),
      value: 'NOT_EXISTS',
    },
  ];
};

const getReturnFieldTableDs = () => {
  return {
    selection: false,
    paging: false,
  };
};

export {
  tableDS,
  getPolicyConfigDataDs,
  getConditionJsonDs,
  getParamTableDs,
  getReturnValueTableDs,
  getCustomizeConditionCombinationDs,
  getCondOperatorDs,
  getReturnFieldTableDs,
};
