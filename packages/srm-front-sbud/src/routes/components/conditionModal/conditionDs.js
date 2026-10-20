/**
 * fx条件配置Ds
 * @date: 2021-06-15
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { DataSet } from 'choerodon-ui/pro';
import { isArray, omit } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
import { isJSON } from './util';

const organizationId = getCurrentOrganizationId();

// 特性条件 ds
export function getCondOperatorDs() {
  return [
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.equals').d('等于'),
      value: 'EQUALS',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.in').d('包含'),
      value: 'IN',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.notIn').d('不包含'),
      value: 'NOT_IN',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.notequals').d('不等于'),
      value: 'NOTEQUALS',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.exists').d('不为空'),
      value: 'EXISTS',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.not_exists').d('为空'),
      value: 'NOT_EXISTS',
    },
  ];
}

// 条件 ds
export function getConditionDs(budgetItemId) {
  const optionsDs = [];

  return {
    autoCreate: false,
    fields: [
      {
        name: 'sourceFieldCodeObj',
        type: 'object',
        lovCode: 'SBUD_CONDITION_BUDGET_ITEM',
        label: intl.get('hpfm.individual.model.config.fieldSelect').d('字段选择'),
        required: true,
        dynamicProps: {
          lovPara: () => {
            return {
              budgetItemId,
            };
          },
        },
      },
      {
        bind: 'sourceFieldCodeObj.budgetItemCode',
        name: 'sourceFieldCode',
        type: 'string',
        required: true,
      },
      {
        name: 'sourceFieldName',
        type: 'string',
        bind: 'sourceFieldCodeObj.budgetItemName',
      },
      {
        name: 'sourceFieldLovCode', // 源字段 值集编码
        bind: 'sourceFieldCodeObj.lovCode',
      },
      {
        name: 'sourceFieldComponentType', // 源字段组件类型
        bind: 'sourceFieldCodeObj.componentType',
      },
      {
        name: 'operator',
        type: 'string',
        label: intl
          .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.operator')
          .d('字段条件'),
        required: true,
        textField: 'meaning',
        options: new DataSet({
          selection: 'single',
          data: getCondOperatorDs(),
        }),
      },
      {
        dynamicProps: {
          multiple: ({ record }) => {
            return ['IN', 'NOT_IN'].includes(record.get('operator'));
          },
          lovCode: ({ record }) => {
            if (record.get('sourceFieldComponentType') === 'LOV') {
              return record.get('sourceFieldLovCode');
            } else {
              return null;
            }
          },
          //  lookupCode: ({ record }) => {
          //     if( record.get('sourceFieldComponentType') === 'SELECT' ){
          //         return record.get('sourceFieldLovCode');
          //     }else{
          //       return null
          //     }
          //  },
          type: ({ record }) => {
            return record.get('sourceFieldComponentType') === 'LOV' ? 'object' : 'string';
          },
          disabled: ({ record }) => {
            return ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },
          required: ({ record }) => {
            return !['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },

          options: ({ record }) => {
            if (record.get('sourceFieldComponentType') === 'SELECT') {
              if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(record.get('operator'))) {
                return null;
              } else {
                return (
                  optionsDs.find((od) => od.lookupCode === record.get('sourceFieldLovCode')) || {}
                ).ds;
              }
            }
          },
        },
        name: 'targetValue',
        label: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
        transformRequest: (value, record = {}) => {
          const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
            record.get('operator')
          );
          if (isNumberType) return value;
          const sourceFieldComponentType = record.get('sourceFieldComponentType');
          if (sourceFieldComponentType === 'LOV') {
            const valueField = record.get('sourceLovValueField');
            return ['IN', 'NOT_IN'].includes(record.get('operator'))
              ? JSON.stringify(value.map((v) => v[valueField]))
              : value[valueField];
          } else {
            return isArray(value) ? JSON.stringify(value) : value;
          }
        },
        transformResponse: (value, object) => {
          const {
            operator,
            sourceFieldComponentType,
            targetValueMeaning,
            sourceLovValueField,
            sourceLovMeaningField,
          } = object;
          if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(operator)) {
            return value;
          }
          if (sourceFieldComponentType === 'SELECT') {
            pushLookupCodeArray(optionsDs, object.sourceFieldLovCode);
          }

          if (sourceFieldComponentType === 'LOV') {
            return ['IN', 'NOT_IN'].includes(operator)
              ? JSON.parse(value || '[]').map((v, index) => {
                  return {
                    [sourceLovMeaningField]: JSON.parse(targetValueMeaning || '[]')[index],
                    [sourceLovValueField]: v,
                  };
                })
              : {
                  ...value,
                  [sourceLovMeaningField]: targetValueMeaning,
                  [sourceLovValueField]: value,
                };
          } else {
            return isJSON(value) ? JSON.parse(value) : value;
          }
        },
        validator: (value) => {
          if (isArray(value) && value.length === 0) {
            return intl.get('hzero.common.validation.notNull', {
              name: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
            });
          }
        },
      },
      {
        name: 'targetValueMeaning',
      },
      {
        name: 'sourceLovMeaningField',
      },
      {
        name: 'sourceLovValueField',
      },
    ],
    selection: false,
    paging: false,
    events: {
      update: ({ record, name, value }) => {
        if (name === 'sourceFieldCodeObj') {
          if (value && value.componentType === 'SELECT') {
            pushLookupCodeArray(optionsDs, value.lovCode);
          }

          record.set({
            operator: null,
            targetValueMeaning: null,
            targetValue: null,
          });
        }

        if (name === 'operator') {
          record.set('targetValue', null);
          record.set('targetValueMeaning', null);
        }

        if (name === 'targetValue') {
          const field = record.getField('targetValue');
          const sourceLovValueField = field.get('valueField');
          const sourceLovMeaningField = field.get('textField');
          if (record.get('sourceFieldComponentType') === 'LOV') {
            record.set({
              sourceLovValueField,
              sourceLovMeaningField,
            });
          } else {
            record.set({
              sourceLovMeaningField: 'meaning',
              sourceLovValueField: 'value',
            });
          }

          if (['IN', 'NOT_IN'].includes(record.get('operator'))) {
            if (record.get('sourceFieldComponentType') === 'LOV') {
              record.set({
                targetValueMeaning: JSON.stringify(
                  (value || []).map((v) => v[sourceLovMeaningField])
                ),
              });
            } else {
              record.set({
                targetValueMeaning: JSON.stringify((value || []).map((v) => field.getText(v))),
              });
            }
          } else {
            record.set({
              targetValueMeaning: field.getText(),
            });
          }
        }
      },
    },
  };
}

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

// 用户自定义条件Ds
export function getCustomizeConditionCombinationDs(validator) {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'conditionCombination',
        type: 'string',
        validator,
        pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
        required: true,
      },
    ],
  };
}
