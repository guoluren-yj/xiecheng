/*
 * @Description: 通用工具方法
 * @Date: 2020-07-24 11:09:36
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import BigNumber from 'bignumber.js';
import { getCurrentOrganizationId } from 'utils/utils';

// 行条件判断
const lineCondition = (record, condition) => {
  const { sourceFieldCode, operator, targetValue } = condition;
  // 目前不支持多选的判断
  const value = record.toData()[sourceFieldCode];

  let result = false;
  switch (operator) {
    case 'IN': // 包含
      result = (JSON.parse(targetValue) || []).includes(value);
      break;
    case 'NOT_IN': // 不包含
      result = !(JSON.parse(targetValue) || []).includes(value);
      break;
    case 'EXISTS': // 不为空
      result = !!value;
      break;
    case 'NOT_EXISTS': // 为空
      result = !value;
      break;
    case 'EQUALS': // 相等
      result = value === targetValue;
      break;
    case 'NOTEQUALS': // 不等于
      result = value !== targetValue;
      break;
    default:
      result = false;
  }

  return result;
};

// 获取是否必输
const getRequired = (requiredCondition, record) => {
  const { conditionCombination, conditionLines } = requiredCondition;
  const conditionMaps = conditionLines.map((condition) => lineCondition(record, condition));

  const combination = conditionCombination.replace(/(AND)|(OR)|(\d+)/g, (str) => {
    if (str === 'AND') {
      return '&&';
    } else if (str === 'OR') {
      return '||';
    } else {
      return conditionMaps[str - 1];
    }
  });

  /* eslint no-new-func: 0 */

  const required = Function(`return ${combination} `);
  return required();
};

/**
 * 获取指定格式的日期
 * @param {要转换的日期} date
 * @param {日期格式} format
 */
export function getMomentDate(date = new Date(), format = 'YYYY-MM-DD hh:mm:ss') {
  return moment(date).format(format);
}

/**
 * 处理数据
 */
export function getDatas(data) {
  const itemData = {};
  for (const key in data) {
    // 日期数字 特殊处理
    if (key.lastIndexOf('LOV') !== -1 || key.lastIndexOf('MapList') !== -1) {
      Object.assign(itemData, {});
    } else if (Array.isArray(data[key])) {
      Object.assign(itemData, { [key]: data[key].join(',') });
    } else if (data[key] instanceof Object && key.includes('Date')) {
      Object.assign(itemData, data[key]);
    } else if (data[key] instanceof Object && !BigNumber.isBigNumber(data[key])) {
      Object.assign(itemData, { ...data[key] });
    } else {
      Object.assign(itemData, { [key]: data[key] });
    }
  }
  return itemData;
}

/**
 * 获取时间周期维度动态字段属性
 * @param {} item
 */

export function getFieldsConfig(item) {
  const {
    enabledFlag = 0, // 是否启用
    queryFlag = 0, // 是否作为查询条件
    requiredFlag = 0, // 是否必输
    componentType = 'INPUT', // 组件类型
    gridWidth = '240', // 列宽
    multipleFlag = 0, // 是否多选
    budgetItemCode = '', // 字段名
    budgetItemName, // 列名
    gridSeq = 0, // 位置
    displayField,
    valueField,
  } = item;
  const label = intl.get(`sbud.budgeting.model.budgeting.${budgetItemCode}`).d(budgetItemName);
  const name = budgetItemCode;
  let gridField = {};
  let queryField = {};
  const columnsConfig = {
    name,
    width: gridWidth,
    gridSeq,
  };

  if (!enabledFlag) {
    return {};
  }

  switch (componentType) {
    case 'LOV':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'object',
          required: requiredFlag,
          valueField,
          textField: displayField,
          lovCode,
          multiple: Number(multipleFlag) === 1,
          transformRequest: (value) =>
            value
              ? Number(multipleFlag) === 1
                ? value.map((i) => i[budgetItemCode]).join(',')
                : value[budgetItemCode]
              : null,
          transformResponse: (value, record) => {
            const {
              [valueField]: budgetItemCodes = null,
              [displayField]: budgetItemCodeMeaning = null,
            } = record;
            if (budgetItemCodes && budgetItemCodeMeaning) {
              return { [valueField]: budgetItemCodes, [displayField]: budgetItemCodeMeaning };
            } else {
              return null;
            }
          },
          dynamicProps: {
            lovPara: () => ({
              tenantId: getCurrentOrganizationId(),
            }),
          },
        };
        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'object',
            lovCode,
            multiple: false,
            transformRequest: (value) => (value ? value[budgetItemCode] : null),
            dynamicProps: {
              lovPara: () => ({
                tenantId: getCurrentOrganizationId(),
              }),
            },
          };
        }
      }
      break;
    case 'SELECT':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'string',
          required: requiredFlag,
          lookupCode: lovCode,
          multiple: Number(multipleFlag) === 1,
        };
        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'string',
            lookupCode: lovCode,
            multiple: false,
          };
        }
      }
      break;
    default:
      gridField = {
        name,
        label,
        type: 'string',
      };
      if (queryFlag) {
        queryField = {
          name,
          label,
          type: 'string',
        };
      }
      break;
  }

  return {
    gridField,
    queryField,
    columnsConfig,
  };
}

/**
 * 获取预算编制动态字段属性
 * @param {} item
 */

export function getBugetFieldsConfig(item) {
  const {
    enabledFlag = 0, // 是否启用
    queryFlag = 0, // 是否作为查询条件
    requiredFlag = 0, // 是否必输
    requiredCondition, // 必输条件
    componentType = 'INPUT', // 组件类型
    gridWidth = '240', // 列宽
    multipleFlag = 0, // 是否多选
    valueField, // 值字段
    budgetItemCode = '', // 字段名
    budgetItemName, // 列名
    gridSeq = 0, // 位置
    budgetFlag = 1,
    displayField,
  } = item;
  const label = budgetItemName;
  const name = budgetItemCode;
  let gridField = {};
  let queryField = {};
  const columnsConfig = {
    name,
    width: gridWidth,
    gridSeq,
  };

  if (!enabledFlag) {
    return {};
  }

  switch (componentType) {
    case 'LOV':
      {
        const { lovCode } = item;
        gridField = {
          name: `${name}LOV`,
          label,
          type: 'object',
          valueField,
          textField: displayField,
          // required: Number(budgetFlag) === 1 && Number(requiredFlag) === 1,
          lovCode,
          multiple: Number(multipleFlag) === 1 ? ',' : false,
          dynamicProps: {
            lovPara: ({ record }) => {
              const { companyId } = record.toData();
              // if (name === 'budgetAccountNum') {
              // 都需要公司Id
              return {
                tenantId: getCurrentOrganizationId(),
                companyId,
              };
              // }
              // return {
              //   tenantId: getCurrentOrganizationId(),
              // };
            },

            required: ({ record }) => {
              if (requiredCondition) {
                return getRequired(requiredCondition, record);
              } else {
                return Number(budgetFlag) === 1 && Number(requiredFlag) === 1;
              }
            },
          },
        };

        columnsConfig.name = `${name}LOV`;

        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'object',
            lovCode,
            multiple: false,
            transformRequest: (value) => (value ? value[budgetItemCode] : null),
            dynamicProps: {
              lovPara: () => ({
                tenantId: getCurrentOrganizationId(),
              }),
            },
          };
        }
      }
      break;
    case 'SELECT':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'string',
          // required: Number(budgetFlag) === 1 && Number(requiredFlag) === 1,
          lookupCode: lovCode,
          multiple: Number(multipleFlag) === 1,
          dynamicProps: {
            required: ({ record }) => {
              if (requiredCondition) {
                return getRequired(requiredCondition, record);
              } else {
                return Number(budgetFlag) === 1 && Number(requiredFlag) === 1;
              }
            },
          },
        };
        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'string',
            lookupCode: lovCode,
            multiple: false,
          };
        }
      }
      break;
    default:
      gridField = {
        name,
        label,
        type: 'string',
      };
      if (queryFlag) {
        queryField = {
          name,
          label,
          type: 'string',
        };
      }
      break;
  }

  return {
    gridField,
    queryField,
    columnsConfig,
  };
}
