import { camelCase, toString } from 'lodash';

/**
 * 处理属性转化
 * @param {*} originConfig 对象，原组件必填等属性, 例如: {required: true, disabled: false,}
 * @param {*} fieldProperty 数组，例如：[{fieldPropertyCode: 'required', fieldPropertyValue: '', lines: [{}]}]
 * @param {*} config 对象，{
      record, // 当前数据源
      targetForm: form, // 当前form对象
    }
 * @returns
 */
export function coverConfig(originConfig = {}, fieldProperty = [], config = {}) {
  const newConfig = originConfig;
  if (fieldProperty) {
    fieldProperty.forEach(i => {
      newConfig[i.fieldPropertyCode] = !!Number(i.fieldPropertyValue);
      let { conExpression = '' } = i;
      if (conExpression !== '') {
        const isErr = isErrConExpression(conExpression);
        if (!isErr) {
          const conNoReg = /(\d+)/g;
          const result = calculateExpression(i.lines || [], config);
          if ((i.lines || []).length > 0) {
            conExpression = conExpression.replace(conNoReg, (_, m) => result[m] || false);
            conExpression = conExpression.replace(/AND/g, '&&').replace(/OR/g, '||');
            // eslint-disable-next-line no-new-func
            newConfig[i.fieldPropertyCode] = new Function(`return ${conExpression};`)() ? 1 : 0;
          }
        }
      }
    });
  }
  return newConfig;
}

// 校验筛选逻辑是否合法
function isErrConExpression(exp) {
  const leftBracketNum = (exp.match(/\(/g) || []).length;
  const rightBracketNum = (exp.match(/\)/g) || []).length;
  // 暂时不支持10个以上条件配置
  const ruleConNo = /\s*\d+\s*\d+\s*/g.test(exp);
  const ruleConLogic = /\s*(AND|OR)\s*(AND|OR)\s*/g.test(exp);
  const illegalChar = /^(?!AND|OR|\(|\)|\d)/g.test(exp);
  if (leftBracketNum !== rightBracketNum || ruleConNo || ruleConLogic || illegalChar) return true;
  return false;
}

// 拆分条件
function calculateExpression(conditionList, { targetForm, record = {} } = {}) {
  const result = {};
  conditionList.forEach(i => {
    const { conCode, sourceFieldCode = '', conExpression, targetFieldCode = '', targetValue } = i;
    // 转化小驼峰
    const newSourceFieldCode = camelCase(sourceFieldCode);

    let right = targetValue;
    const targetAllValue = {
      ...record,
      ...(targetForm ? (targetForm.getFieldsValue && targetForm.getFieldsValue()) || {} : {}),
    };
    const left = targetAllValue[newSourceFieldCode];
    // 方便以后使用, 暂时无用
    if (targetFieldCode) {
      right = targetAllValue[targetFieldCode];
    }
    result[conCode] = logicCompute(conExpression, left, right);
  });
  return result;
}

// 条件拼接
function logicCompute(type, left, right) {
  // 转化为字符串比较
  const newLeft = isToString(left) ? toString(left) : left;
  switch (type) {
    case '=':
      return newLeft === right;
    case '>=':
      return newLeft >= right;
    case '<=':
      return newLeft <= right;
    case '!=':
      return newLeft !== right;
    case '>':
      return newLeft > right;
    case '<':
      return newLeft < right;
    // case 'ISNULL':
    //   return left === undefined || left === null;
    case 'NOTNULL':
      return left !== undefined && left !== null;
    // case 'BEFORE':
    //   return moment(left).isBefore(moment(right));
    // case 'SAME':
    //   return moment(left).isSame(moment(right));
    // case 'NOTSAME':
    //   return !moment(left).isSame(moment(right));
    // case 'AFTER':
    //   return moment(left).isAfter(moment(right));
    // case '~BEFORE':
    //   return !moment(left).isBefore(moment(right));
    // case '~AFTER':
    //   return !moment(left).isAfter(moment(right));
    // case 'LIKE':
    //   return new RegExp(right, 'g').test(String(left));
    // case 'UNLIKE':
    //   return !new RegExp(right, 'g').test(String(left));
    // case '~LIKE':
    //   return new RegExp(right, 'g').test(String(left));
    // case '~UNLIKE':
    //   return !new RegExp(right, 'g').test(String(left));
    default:
      return false;
  }
}

/**
 * 判断是否可以转化为string
 * @param {String} str
 */
function isToString(str) {
  try {
    toString(str);
    return true;
  } catch (e) {
    return false;
  }
}
