/**
 * fx条件配置Ds
 * @date: 2021-06-15
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { DataSet } from 'choerodon-ui/pro';
import { isArray, omit } from 'lodash';
import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';

// import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { isJSON } from './util';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
// const requestUrlPre = tenantFlag
//   ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
//   : `${SRM_DATA_PROCESS}/v1`;

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
export function getConditionDs({ nodeDefCode }) {
  const optionsDs = [];
  return {
    autoCreate: false,
    fields: [
      {
        name: 'leftValue',
        type: 'object',
        lovCode: tenantFlag ? 'DOCF.LINK_RULE_FIELD_URL' : 'DOCF.LINK_RULE_FIELD_SITE',
        lovPara: { tenantId: organizationId, nodeDefCode },
        label: intl.get('hpfm.individual.model.config.fieldSelect').d('字段选择'),
        required: true,
      },
      {
        name: 'leftValueMeaning',
        type: 'string',
        bind: 'leftValue.label',
      },
      {
        name: 'lovCode', // 源字段 值集编码
        bind: 'leftValue.lovCode',
      },
      {
        name: 'componentType', // 源字段组件类型
        bind: 'leftValue.type',
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('sbdm.common.model.common.fieldCondition').d('字段条件'),
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
            if (record.get('leftValue')?.type === 'LOV') {
              return record.get('lovCode') || record.get('leftValue').lovCode;
            } else {
              return null;
            }
          },
          lookupCode: ({ record }) => {
            if (record.get('leftValue')?.type === 'SINGLE_SELECT') {
              return record.get('lovCode');
            } else {
              return null;
            }
          },
          type: ({ record }) => {
            return record.get('leftValue')?.type === 'LOV' ? 'object' : 'string';
          },
          disabled: ({ record }) => {
            return ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },
          required: ({ record }) => {
            return !['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },
          // options: ({ record }) => {
          //   if (record.get('componentType') === 'SINGLE_SELECT') {
          //     if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(record.get('operator'))) {
          //       return null;
          //     } else {
          //       return (optionsDs.find((od) => od.lookupCode === record.get('lovCode')) || {}).ds;
          //     }
          //   }
          // },
        },
        name: 'rightValue',
        label: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
        transformRequest: (value, record = {}) => {
          const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
            record.get('operator')
          );
          if (isNumberType) return value;
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            const valueField = record.get('rightLovValueField');
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
            componentType,
            rightValueMeaning,
            rightLovValueField,
            rightLovMeaningField,
          } = object;
          if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(operator)) {
            return value;
          }
          if (componentType === 'SINGLE_SELECT') {
            pushLookupCodeArray(optionsDs, object.lovCode);
          }

          if (componentType === 'LOV') {
            return ['IN', 'NOT_IN'].includes(operator)
              ? JSON.parse(value || '[]').map((v, index) => {
                  return {
                    [rightLovMeaningField]: JSON.parse(rightValueMeaning || '[]')[index],
                    [rightLovValueField]: v,
                  };
                })
              : {
                  ...value,
                  [rightLovMeaningField]: rightValueMeaning,
                  [rightLovValueField]: value,
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
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'rightValueMeaning',
      },
      {
        name: 'rightLovMeaningField',
      },
      {
        name: 'rightLovValueField',
      },
    ],
    selection: false,
    paging: false,
    events: {
      update: ({ record, name, value }) => {
        if (name === 'leftValue') {
          if (value && value.componentType === 'SELECT') {
            pushLookupCodeArray(optionsDs, value.lovCode);
          }

          record.set({
            operator: null,
            rightValueMeaning: null,
            rightValue: null,
          });
        }

        if (name === 'operator') {
          record.set('rightValue', null);
          record.set('rightValueMeaning', null);
        }

        if (name === 'rightValue') {
          const field = record.getField('rightValue');
          const rightLovValueField = field.get('valueField');
          const rightLovMeaningField = field.get('textField');
          if (record.get('componentType') === 'LOV') {
            record.set({
              rightLovValueField,
              rightLovMeaningField,
            });
          } else {
            record.set({
              rightLovMeaningField: 'meaning',
              rightLovValueField: 'value',
            });
          }

          if (['IN', 'NOT_IN'].includes(record.get('operator'))) {
            if (record.get('componentType') === 'LOV') {
              record.set({
                rightValueMeaning: JSON.stringify(
                  (value || []).map((v) => v[rightLovMeaningField])
                ),
              });
            } else {
              record.set({
                rightValueMeaning: JSON.stringify((value || []).map((v) => field.getText(v))),
              });
            }
          } else {
            record.set({
              rightValueMeaning: field.getText(),
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
          update: ({ params }) => {
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

// 用户自定义租户Ds
export function getCustomizeConditionCombinationDs() {
  return {
    fields: [
      {
        name: 'conditionCombination',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.view.select.customize').d('自定义组合规则'),
        validator: (value) => {
          if (/^[A-Z0-9 )(]+$/.test(value)) {
            return /^((AND)|(OR)|[0-9 )(]+)+$/.test(value);
          } else if (value) {
            return intl.get('spfm.rulesDefinition.validator.pattern_mismatch').d('请输入有效的值');
          } else {
            return true;
          }
        },
        required: true,
        help: intl
          .get('hpfm.individual.view.message.title.tips3')
          .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3'),
      },
    ],
  };
}
