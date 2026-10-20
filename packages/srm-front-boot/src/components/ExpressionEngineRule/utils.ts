
/**
 * utils 表达式引擎规则工具方法
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import type { FieldProps } from 'choerodon-ui/dataset/data-set/Field';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { RenderComponentConfigType } from './interface';


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
    lovPara[key] = dataSource[value as string];
  });
  return lovPara;
}

function getConfigFields(list, dataSource?) {
  return list.map( (li: RenderComponentConfigType) => {
    const { name, label, type, lovCode, lookupCode, textField, valueField, multiple, lovParas, dynamicProps, component } = li;
    const config = {
      name,
      label,
      type,
      multiple,
      required: true,
      dynamicProps,
    };
    if(lovCode) {
      Object.assign(config, {
        lovCode,
        textField,
        valueField,
        type: 'object',
        transformRequest: (value) => {
          return JSON.stringify(value);
        },
        transformResponse: (value) => {
          if(isJSON(value)) {
            return JSON.parse(value);
          } else {
            return value;
          }
        },
      });
      if(dataSource) {
        Object.assign(config, {
          lovPara: getLovPara(lovParas, dataSource),
        });
      }
    }
    if(lookupCode) {
      Object.assign(config, {
        lookupCode,
      });
    }
    if (component === 'select') {
      Object.assign(config, {
        textField,
        valueField,
      });
    }
    return config;
  });
}

function getDefaultFields(required): FieldProps[] {
  return [
    {
      name: 'expressionActionName',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.expressionActionName').d('策略名称'),
      type: FieldType.string,
      required: !!required,
    },
    {
      name: 'expressionActionDescription',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.expressionActionDescription').d('策略描述'),
      type: FieldType.string,
      required: !!required,
    },
    {
      name: 'expressionPriority',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.expressionPriority').d('优先级'),
      type: FieldType.number,
      required: !!required,
    },
    {
      name: 'conditionExpression',
      label: intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.conditionExpression').d('表达式'),
      type: FieldType.string,
    },
  ];
}

function getDataFieldsFromConfigs (configs: any[] = [], data = {}, { returnRuleDataInitHook } = {} as any) {
  let effectField = {};
  configs.forEach(config => {
    effectField[config.name] = data[config.name];
  });
  if (returnRuleDataInitHook) {
    effectField = returnRuleDataInitHook({ data: effectField, originData: data, config: configs });
  }
  return effectField;
}

export function getExpressionEngineFormConfig (
  formConfigList: RenderComponentConfigType[],
  data,
  dataSource = {},
  {
    defaultDataChangeHook,
    returnRuleDsChangeHook,
    returnRuleDataInitHook,
  } = {} as any
) {
  return {
    autoCreate: false,
    autoQuery: false,
    data: [getDataFieldsFromConfigs(formConfigList, data, { returnRuleDataInitHook })],
    fields: getConfigFields(formConfigList, dataSource),
    events: {
      update: (config) => {
        const { record } = config;
        if(defaultDataChangeHook){
          defaultDataChangeHook(record.toJSONData());
        }
        if (returnRuleDsChangeHook) {
          returnRuleDsChangeHook(config);
        }
      },
    },
  };
}

export function getExpressionRuleDs (configs = [], data = [], queryParams = {}, expressionFieldValueHook): DataSetProps {
  const organizationId = getCurrentOrganizationId();
  const defaultFields = getDefaultFields(true);
  const returnRuleFields = getConfigFields(configs);
  const actionField = {
    name: 'action',
    label: intl.get('hzero.common.button.action').d('操作'),
    type: FieldType.string,
  };
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
              let fieldValue = recordData[field.name];
              if (expressionFieldValueHook && expressionFieldValueHook[field.name]) {
                fieldValue = expressionFieldValueHook[field.name]({ value: fieldValue, config: field });
              }
              return isJSON(fieldValue) ? JSON.parse(fieldValue) : fieldValue;
            } else {
              return value;
            }
          },
        };
      }),
      actionField,
    ],
    queryFields: getDefaultFields(false).slice(0, 2).map(i => ({ ...i, display: true })),
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `/marmot/v1/${organizationId}/marmot-expression-engine/action`,
          method: 'get',
          data: { page, pagesize, ...data, ...queryParams },
        };
      },
    },
  };
}

export function getRuleBaseInfoDs (data): DataSetProps {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    data: [data],
    fields: getDefaultFields(true),
  };
}
