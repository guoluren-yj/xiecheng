
/**
 * utils 表达式引擎规则工具方法
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { isNil } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { RenderComponentConfigType } from './interface.ts';


/**
 * 判断是否是json
 * @param {String} str
 * @returns
 */
export function isJSON (str) {
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
  } else {
    return false;
  }
};

function getLovPara(lovParas, dataSource = {}) {
  const lovPara = {};
  const paras = lovParas && isJSON(lovParas) ? JSON.parse(lovParas) : [];
  paras.forEach(para => {
    const [key, value] = Object.entries(para)[0];
    lovPara[key] = dataSource[value]
  });
  return lovPara;
}

function getConfigFields(list, dataSource) {
  let fields = list.map( (li: RenderComponentConfigType) => {
    const { name, label, type, lovCode, lookupCode, textField, valueField, multiple, lovParas } = li;
    let config = {
      name,
      label,
      type,
      multiple,
      required: true,
    }
    if(lovCode) {
      Object.assign(config, {
        lovCode,
        textField,
        valueField,
        type: 'object',
        transformRequest: (value) => {
          return JSON.stringify(isNil(value) ? {} : value)
        },
        transformResponse: (value) => {
          if(isJSON(value)) {
            return JSON.parse(value)
          } else {
            return value
          }
        },
      })
      if(dataSource) {
        Object.assign(config, {
          lovPara: getLovPara(lovParas, dataSource),
        })
      }
    }
    if(lookupCode) {
      Object.assign(config, {
        lookupCode
      })
    }
    return config
  });
  return fields;
}

function getDefaultFields(required) {
  return [
    {
      name: 'expressionActionName',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.expressionActionName').d('策略名称'),
      type: 'string',
      required: !!required,
    },
    {
      name: 'expressionActionDescription',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.expressionActionDescription').d('策略描述'),
      type: 'string',
      required: !!required,
    },
    {
      name: 'expressionPriority',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.expressionPriority').d('优先级'),
      help: intl.get('component.ExpressionEngineRule.model.expressionPriority.help').d('值越小优先级越高'),
      type: 'number',
      required: !!required,
    },
    {
      name: 'conditionExpression',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.conditionExpression').d('表达式'),
      type: 'string'
    },
  ];
}

function getDataFieldsFromConfigs (configs = [], data = {}) {
  const effectField = {};
  configs.forEach(config => {
    effectField[config.name] = data[config.name]
  });
  return effectField;
}

export function getExpressionEngineFormConfig (formConfigList: RenderComponentConfigType[], data, dataSource = {}) {
  return {
    autoCreate: false,
    autoQuery: false,
    data: [getDataFieldsFromConfigs(formConfigList, data)],
    fields: getConfigFields(formConfigList, dataSource)
  }
}

export function getExpressionRuleDs (configs = [], data = [], queryParams = {}) {
  const organizationId = getCurrentOrganizationId();
  const defaultFields = getDefaultFields(true)
  const returnRuleFields = getConfigFields(configs);
  const actionField = {
    name: 'action',
    label: intl.get('hzero.common.button.action').d('操作'),
    type: 'string'
  }
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    data,
    fields: [
      ...defaultFields,
      ...returnRuleFields.map(field => {
        return {
          ...field,
          transformResponse: (value, object) => {
            const { valueExpressionJson } = object;
            if(isJSON(valueExpressionJson)) {
              const recordData = JSON.parse(valueExpressionJson);
              const fieldValue = recordData[field.name];
              return isJSON(fieldValue) ? JSON.parse(fieldValue) : fieldValue
            } else {
              return value
            }
          },
        }
      }),
      actionField
    ],
    queryFields: getDefaultFields(false).slice(0,2),
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `/marmot/v1/${organizationId}/marmot-expression-engine/action`,
          method: 'get',
          data: { page, pagesize, ...data, ...queryParams },
        };
      },
    }
  }
}

export function getRuleBaseInfoDs (data) {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    data: [data],
    fields: getDefaultFields(true),
  }
}
