import intl from 'hzero-front/lib/utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import { isArray, omit, isString, isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

/**
 * 判断是否是json数据
 * @param {String} str
 */
const isJSON = str => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
};

const getConditionRuleDs = () => ({
  autoCreate: false,
  fields: [
    {
      name: 'conditionType',
      type: 'string',
      label: intl.get('sslm.common.model.rulesDefinition.conditionType').d('策略逻辑'),
      required: true,
      defaultValue: 'TRUE',
    },
  ],
});

// 策略服务条件 ds
const getConditionJsonDs = ({ queryParams } = {}) => {
  let __valueOption;
  let __newOption;
  let optionsDs = [];
  return {
    fields: [
      {
        name: 'leftValue',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.leftValue').d('特性'),
        textField: 'label',
        valueField: 'name',
        required: true,
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.operator').d('特性条件'),
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
                dataSet
                  .getField('leftValue')
                  .get('options')
                  .toData()) ||
              [];
            const leftValueOption =
              options.find(option => option.name === record.get('leftValue')) || {};
            if (leftValueOption.lovCode) {
              __valueOption = leftValueOption.valueField;
              __newOption = leftValueOption;
            } else {
              __valueOption = undefined;
              __newOption = undefined;
            }
            return isNumberType ? null : leftValueOption.lovCode ? leftValueOption.lovCode : null;
          },
          lovPara: ({ dataSet, record }) => {
            const options =
              (dataSet.getField('leftValue').get('options') &&
                dataSet
                  .getField('leftValue')
                  .get('options')
                  .toData()) ||
              [];
            const leftValueOption =
              options.find(option => option.name === record.get('leftValue')) || {};
            let lovParams = {};
            if (leftValueOption.lovCode || leftValueOption.lookupCode) {
              lovParams = queryParams[leftValueOption.lovCode || leftValueOption.lookupCode] || {};
            }
            return {
              tenantId: organizationId,
              ...lovParams,
            };
          },
          type: ({ dataSet, record }) => {
            const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
              record.get('operator')
            );
            const options =
              (dataSet.getField('leftValue').get('options') &&
                dataSet
                  .getField('leftValue')
                  .get('options')
                  .toData()) ||
              [];
            const leftValueOption =
              options.find(option => option.name === record.get('leftValue')) || {};
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
                dataSet
                  .getField('leftValue')
                  .get('options')
                  .toData()) ||
              [];
            const leftValueOption =
              options.find(option => option.name === record.get('leftValue')) || {};
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
              ? (optionsDs.find(od => od.lookupCode === leftValueOption.lookupCode) || {}).ds
              : null;
          },
          optionsProps: ({ dataSet, record }) => {
            const options =
              (dataSet.getField('leftValue').get('options') &&
                dataSet
                  .getField('leftValue')
                  .get('options')
                  .toData()) ||
              [];
            const leftValueOption =
              options.find(option => option.name === record.get('leftValue')) || {};
            return leftValueOption.lovCode
              ? {
                  paging: leftValueOption.pageFlag === false ? false : 'server',
                  childrenField: 'children',
                  parentField: 'parentCategoryId',
                  idField: 'categoryId',
                }
              : {};
          },
        },
        name: 'rightValue',
        label: intl.get('sslm.common.model.rulesDefinition.rightValue').d('特性值'),
        transformRequest: (value, record = {}) => {
          if (!value) return value;
          const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
            record.get('operator')
          );
          if (isNumberType) return value;
          const fieldDefinition = record.get('fieldDefinition');
          if (fieldDefinition && fieldDefinition.lovCode) {
            return ['IN', 'NOT_IN'].includes(record.get('operator'))
              ? JSON.stringify(value.map(v => v[fieldDefinition.valueField]).join(','))
              : value[fieldDefinition.valueField];
          } else if (__valueOption) {
            return ['IN', 'NOT_IN'].includes(record.get('operator'))
              ? JSON.stringify(value.map(v => v[__valueOption]).join(','))
              : value[__valueOption];
          } else {
            return isArray(value) ? JSON.stringify(value.join(',')) : value;
          }
        },
        transformResponse: (value, object) => {
          const { fieldDefinition = {}, rightValueMeaning, operator } = object;
          if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(operator)) {
            return value;
          }
          if (object.fieldDefinition && object.fieldDefinition.lookupCode) {
            optionsDs = pushLookupCodeArray(
              optionsDs,
              object.fieldDefinition.lookupCode,
              queryParams[object.fieldDefinition.lookupCode]
            );
            if (['IN', 'NOT_IN'].includes(object.operator)) {
              const values = isArray(JSON.parse(value))
                ? JSON.parse(value)
                : isString(JSON.parse(value))
                ? JSON.parse(value).split(',')
                : [];
              return values;
            }
          }
          if (fieldDefinition && fieldDefinition.lovCode) {
            if (['IN', 'NOT_IN'].includes(object.operator)) {
              const values = isArray(JSON.parse(value))
                ? JSON.parse(value)
                : isString(JSON.parse(value))
                ? JSON.parse(value).split(',')
                : [];
              if (!isEmpty(values)) {
                return values.map((v, index) => {
                  return {
                    ...v,
                    [fieldDefinition.textField]: JSON.parse(rightValueMeaning || '[]')[index],
                    [fieldDefinition.valueField]: v,
                  };
                });
              } else {
                return [];
              }
            } else {
              return {
                ...value,
                [fieldDefinition.textField]: rightValueMeaning,
                [fieldDefinition.valueField]: value,
              };
            }
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
      update: ({ dataSet, record, name, value }) => {
        const options =
          (dataSet.getField('leftValue').get('options') &&
            dataSet
              .getField('leftValue')
              .get('options')
              .toData()) ||
          [];
        const leftValueOption =
          options.find(option => option.name === record.get('leftValue')) || {};

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
        if (name === 'rightValue') {
          // 处理生命周期策略值集未保存再次打开弹框，未翻译问题
          if (leftValueOption && leftValueOption.lovCode) {
            if (value) {
              const meaning = isArray(value)
                ? value.map(n => n[leftValueOption.textField])
                : value[leftValueOption.textField];
              record.set('rightValueMeaning', isArray(value) ? JSON.stringify(meaning) : meaning);
            } else {
              record.set('rightValueMeaning', null);
            }
          }
        }

        if (leftValueOption.lookupCode) {
          optionsDs = pushLookupCodeArray(
            optionsDs,
            leftValueOption.lookupCode,
            queryParams[leftValueOption.lookupCode] || {}
          );
        }
      },
    },
  };
};

// 如果渲染的是 lookup 下拉框，查询下拉框数据，放到数组中
function pushLookupCodeArray(optionsDs, lookupCode, lookupCodeParams) {
  if (optionsDs.filter(ds => ds.lookupCode === lookupCode).length <= 0) {
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
              params: omit({ ...params, ...lookupCodeParams }, ['page', 'size']),
            };
          },
        },
      }),
    });
  }
  return optionsDs;
}

// 用户自定义租户Ds
const getCustomizeConditionCombinationDs = () => {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'customizeConditionCombination',
        type: 'string',
        label: intl.get('sslm.common.view.select.customize').d('自定义组合规则'),
        pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
        required: true,
      },
    ],
  };
};

// 特性条件 ds
const getCondOperatorDs = () => {
  return [
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.less').d('小于'),
      value: 'LESS',
      type: 'number',
    },
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.lessOrEqual').d('小于等于'),
      value: 'LESSOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.equals').d('等于'),
      value: 'EQUALS',
    },
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.more').d('大于等于'),
      value: 'MOREOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.moreOrEqual').d('大于'),
      value: 'MORE',
      type: 'number',
    },
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.in').d('包含'),
      value: 'IN',
    },
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.notIn').d('不包含'),
      value: 'NOT_IN',
    },
    {
      meaning: intl.get('sslm.common.model.rulesDefinition.notequals').d('不等于'),
      value: 'NOTEQUALS',
    },
    // {
    //   meaning: intl.get('sslm.common.model.rulesDefinition.exists').d('不为空'),
    //   value: 'EXISTS',
    // },
    // {
    //   meaning: intl.get('sslm.common.model.rulesDefinition.not_exists').d('为空'),
    //   value: 'NOT_EXISTS',
    // },
  ];
};

const getParamTableQueryPath = sourceKey => {
  switch (sourceKey) {
    case 'KPI_TEMPLATE':
      return 'kpi-eval-tpl-strategys/lov-config';
    case 'TOTAL_POINTS_LEVEL':
      return 'kpi-level-strategy/lov-config';
    default:
      return 'life-cycle-strategys/lov-config';
  }
};

// 参数服务表格 ds
const getParamTableDs = ({ type, sourceKey }) => {
  return {
    // autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.paramName').d('字段名'),
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.paramType').d('类型'),
      },
      {
        name: 'label',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.paramLabel').d('字段描述'),
      },
      {
        name: 'lookupCode',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.paramLookupCode').d('值集'),
      },
      {
        name: 'lovCode',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.paramLovCode').d('值集视图'),
      },
      {
        name: 'textField',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.paramTextField').d('显示值'),
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl.get('sslm.common.model.rulesDefinition.paramValueField').d('存储值'),
      },
    ],
    transport: {
      read: () => {
        const queryPath = getParamTableQueryPath(sourceKey);
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/${queryPath}`,
          method: 'GET',
          data: { type },
        };
      },
    },
  };
};

export {
  isJSON,
  getConditionRuleDs,
  getConditionJsonDs,
  getCustomizeConditionCombinationDs,
  getCondOperatorDs,
  getParamTableDs,
};
