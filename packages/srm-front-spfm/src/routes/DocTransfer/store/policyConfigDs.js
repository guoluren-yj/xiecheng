/**
 * 策略配置Ds
 * @date: 2020-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { DataSet } from 'choerodon-ui/pro';
import { isArray, omit } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
// import { isJSON } from '../util';

const organizationId = getCurrentOrganizationId();

// 特性条件 ds
export function getCondOperatorDs() {
  return [
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.less').d('小于'),
      value: 'LESS',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.lessOrEqual').d('小于等于'),
      value: 'LESSOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.equals').d('等于'),
      value: 'EQUALS',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.more').d('大于等于'),
      value: 'MORE',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.moreOrEqual').d('大于'),
      value: 'MOREOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.in').d('包含'),
      value: 'IN',
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

// 单据转交配置 头数据 ds
export function getPolicyConfigDataDs() {
  return {
    fields: [
      {
        name: 'conditionType',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.conditionType').d('策略逻辑'),
        required: true,
        defaultValue: 'TRUE',
      },
    ],
    selection: false,
    paging: false,
  };
}

// 单据转交配置 条件 ds
export function getConditionJsonDs(isAgent, userId) {
  let __valueOption;
  let __newOption;
  let optionsDs = [];
  return {
    fields: [
      {
        name: 'leftValue',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.leftValue').d('特性'),
        textField: 'label',
        valueField: 'name',
        required: true,
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.operator').d('特性条件'),
        required: true,
        textField: 'meaning',
      },
      {
        dynamicProps: ({ dataSet, record }) => {
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
          const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS'].includes(record.get('operator'));
          return {
            multiple: isNumberType ? false : !!(record.get('operator') === 'IN'),
            lovCode: isNumberType ? null : leftValueOption.lovCode ? leftValueOption.lovCode : null,
            type: isNumberType ? 'number' : leftValueOption.lovCode ? 'object' : 'string',
            disabled: ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator')),
            required: !['EXISTS', 'NOT_EXISTS'].includes(record.get('operator')),
            options: isNumberType
              ? null
              : leftValueOption.lookupCode
              ? (optionsDs.find((od) => od.lookupCode === leftValueOption.lookupCode) || {}).ds
              : null,
            lovPara: isAgent ? { purchaseAgentId: userId } : { createdBy: userId },
          };
        },
        name: 'rightValue',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.rightValue').d('特性值'),
        transformRequest: (value, record = {}) => {
          const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS'].includes(record.get('operator'));
          if (isNumberType) return value;
          if (!value) return value;
          const fieldDefinition = record.get('fieldDefinition');
          const valueField = record.getField('rightValue').get('valueField');
          if (fieldDefinition && fieldDefinition.lovCode) {
            return record.get('operator') === 'IN'
              ? JSON.stringify(value.map((v) => v[valueField]))
              : value[valueField];
          } else if (__valueOption) {
            return record.get('operator') === 'IN'
              ? JSON.stringify(value.map((v) => v[__valueOption]))
              : value[__valueOption];
          } else {
            return isArray(value) ? JSON.stringify(value) : value;
          }
        },
        // transformResponse: (value, object) => {
        //   console.log(value,object)
        //   // const { fieldDefinition = {}, rightValueMeaning, operator } = object;
        //   // if (!['EQUALS', 'IN', 'NOTEQUALS'].includes(operator)) {
        //   //   return value;
        //   // }
        //   // if (object.fieldDefinition && object.fieldDefinition.lookupCode) {
        //   //   optionsDs = pushLookupCodeArray(optionsDs, object.fieldDefinition.lookupCode);
        //   // }
        //   // if (fieldDefinition && fieldDefinition.lovCode) {
        //   //   return object.operator === 'IN'
        //   //     ? JSON.parse(value || '[]').map((v, index) => {
        //   //         return {
        //   //           ...v,
        //   //           [fieldDefinition.textField]: JSON.parse(rightValueMeaning || '[]')[index],
        //   //           [fieldDefinition.valueField]: v,
        //   //         };
        //   //       })
        //   //     : {
        //   //         ...value,
        //   //         [fieldDefinition.textField]: rightValueMeaning,
        //   //         [fieldDefinition.valueField]: value,
        //   //       };
        //   // } else {
        //   //   return isJSON(value) ? JSON.parse(value) : value;
        //   // }
        // },
      },
      {
        name: 'fieldDefinition',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    selection: false,
    paging: false,
    events: {
      update: ({ dataSet, record, name }) => {
        if (name === 'leftValue') {
          record.set('operator', '');
          record.init('rightValue', undefined);
          record.set('fieldDefinition', __newOption);
        }
        if (name === 'operator') {
          record.set('rightValue', undefined);
        }
        const options =
          (dataSet.getField('leftValue').get('options') &&
            dataSet.getField('leftValue').get('options').toData()) ||
          [];

        const leftValueOption =
          options.find((option) => option.name === record.get('leftValue')) || {};

        if (leftValueOption.lookupCode) {
          optionsDs = pushLookupCodeArray(optionsDs, leftValueOption.lookupCode);
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

// 用户自定义组合Ds
export function getCustomizeConditionCombinationDs() {
  return {
    fields: [
      {
        name: 'customizeConditionCombination',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.view.select.customize').d('自定义组合规则'),
        pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
        required: true,
      },
    ],
  };
}

export function getReturnFieldTableDs(isAgent) {
  return {
    fields: [
      {
        name: 'subObject',
        type: 'object',
        label: isAgent
          ? intl.get('spfm.docTransfer.model.view.agent').d('采购员')
          : intl.get('spfm.docTransfer.model.view.subObject').d('转交人'),
        required: true,
        ignore: true,
        lovCode: isAgent ? 'HPFM.ORGANIZATION_PURCHASE_AGENT' : 'HIAM.USER_ACCOUNT',
        lovPara: { tenantId: getCurrentOrganizationId() },
        noCache: true,
        // transformRequest: (value) => value && value.id,
      },
      {
        name: 'deliverToId',
        required: true,
        bind: isAgent ? 'subObject.purchaseAgentId' : 'subObject.id',
      },
      {
        name: 'deliverTo',
        required: true,
        bind: isAgent ? 'subObject.purchaseAgentName' : 'subObject.loginName',
      },
    ],
    selection: false,
    paging: false,
  };
}

// 参数服务表格 ds
export function getParamTableDs() {
  return {
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramName').d('字段名'),
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramType').d('类型'),
      },
      {
        name: 'label',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramLabel').d('字段描述'),
      },
      {
        name: 'lookupCode',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramLookupCode').d('值集'),
      },
      {
        name: 'lovCode',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramLovCode').d('值集视图'),
      },
      {
        name: 'textField',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramTextField').d('显示值'),
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramValueField').d('存储值'),
      },
    ],
    paging: false,
    selection: false,
  };
}
