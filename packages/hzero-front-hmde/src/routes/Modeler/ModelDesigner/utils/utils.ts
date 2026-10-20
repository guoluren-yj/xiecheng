/* eslint-disable func-names */
import { redNameList, whoNameList, TENANT_ID, numberTypeFields } from './config';
// 判断括号是否输入正确
const isBracketsValid = function (s: string) {
  const a: number[] = []; // 存储左括号出现的地方
  const l: number = s.length;
  let k = 0;
  let flag = 1;
  for (let i = 0; i < l && flag; i++) {
    // eslint-disable-next-line default-case
    switch (s[i]) {
      case '(':
        a[k] = i;
        k++;
        break;
      case ')': {
        const j = a[k - 1];
        if (s[j] === '(') {
          a[k] = 0;
          k--;
        } else {
          flag = 0;
        }
        break;
      }
      case '{':
        a[k] = i;
        k++;
        break;
      case '}': {
        const j = a[k - 1];
        if (s[j] === '{') {
          a[k] = 0;
          k--;
        } else {
          flag = 0;
        }
        break;
      }
      case '[':
        a[k] = i;
        k++;
        break;
      case ']': {
        const j = a[k - 1];
        if (s[j] === '[') {
          a[k] = 0;
          k--;
        } else {
          flag = 0;
        }
        break;
      }
    }
  }
  if (k !== 0) {
    flag = 0;
  }
  if (flag === 0) {
    return false;
  }
  return true;
};

const [STRING, NUMBER, DATE, BOOLEAN] = ['STRING', 'NUMBER', 'DATE', 'BOOLEAN'] as const; // 第四个框的状态
const getFieldValueType = function (dataType: string) {
  let _dataType = dataType || '';
  _dataType = _dataType.toUpperCase();
  switch (_dataType) {
    case 'BOOLEAN':
      return BOOLEAN;
    case 'BYTE':
      return NUMBER;
    case 'SHORT':
      return NUMBER;
    case 'INTEGER':
      return NUMBER;
    case 'LONG':
      return NUMBER;
    case 'FLOAT':
      return NUMBER;
    case 'DOUBLE':
      return NUMBER;
    case 'STRING':
      return STRING;
    case 'DATE':
      return DATE;
    case 'TIME':
      return DATE;
    case 'TIMESTAMP':
      return DATE;
    case 'BIGDECIMAL':
      return NUMBER;
    default:
      return STRING;
  }
};

/**
 * 判断驼峰字段是否是预置字段
 * @param {String} val 需要判断的值
 * @param {Array<String>} type 需要跟哪些预置指端对比 扩展字段：redNameList whoNameList：who字段 TENANT_ID：租户ID others:其他特殊匹配['others', [xxx]] 默认匹配空
 */
const isPresetField = (val: string, type: (string | string[])[] = [], compare: string = '=') => {
  if (!val) return;
  let flag = false;
  let fields: string[] = [];
  if (type.includes('redNameList')) {
    fields = fields.concat(redNameList);
  }
  if (type.includes('whoNameList')) {
    fields = fields.concat(whoNameList);
  }
  if (type.includes('TENANT_ID')) {
    fields = fields.concat(TENANT_ID);
  }
  if (type.includes('others') && type[1]) {
    fields = fields.concat(type[1]);
  }
  if (compare === '=') {
    // 强比较
    flag = fields.some((field) => {
      if (field.replace(/_|-/g, '').toUpperCase() === val.toUpperCase()) {
        return true;
      }
      return false;
    });
  } else if (compare === 'indexOf') {
    // indexOf包含比较
    flag = fields.some((field) => {
      if (val.toUpperCase().indexOf(field.replace(/_|-/g, '').toUpperCase()) > -1) {
        return true;
      }
      return false;
    });
  }
  return flag;
};

/**
 * 判断是否有数字类型
 * @param val 需要判断的类型值
 */
const hasNumberType = (val: string) => {
  if (!val) return false;
  return numberTypeFields.some((item) => item.toUpperCase() === val.toUpperCase());
};
export { isBracketsValid, getFieldValueType, isPresetField, hasNumberType };
