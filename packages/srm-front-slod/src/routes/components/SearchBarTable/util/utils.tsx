/* eslint-disable no-new-func */
/* eslint-disable eqeqeq */
import moment from 'moment';
import { isEmpty } from 'lodash';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';

export function eatChar(str) {
  const dataArr: string[][] = [];
  let currentLine: string[] = [];
  let currentShort: string = '';
  let lock;
  for (let i = 0; i < str.length; i++) {
    const cur = str[i];
    const preChar = str[i > 1 ? i : 0];
    switch (cur) {
      case "'":
      case '"':
      case '`':
        if (!lock && preChar !== '\\') {
          currentShort += cur;
          lock = cur;
        } else if (preChar === '\\' || cur !== lock) {
          currentShort += cur;
        } else {
          currentShort += cur;
          currentLine.push(currentShort);
          currentShort = '';
          lock = undefined;
        }
        break;
      case ';':
        if (!lock) {
          currentLine.push(currentShort);
          dataArr.push(currentLine);
          currentLine = [];
          currentShort = '';
        } else {
          currentShort += cur;
        }
        break;
      case ' ':
        if (!lock) {
          currentLine.push(currentShort);
          currentShort = '';
        } else {
          currentShort += cur;
        }
        break;
      default:
        currentShort += cur;
    }
  }
  return dataArr;
}
export function* eatShort(shorts) {
  for (let offset = 0; offset < shorts.length; offset++) {
    const current = shorts[offset];
    if (current) {
      yield current;
    }
  }
}
export function statementToJs(str) {
  if (!(window as any).moment) {
    (window as any).moment = moment;
  }
  const dataArr: string[] = [];
  Object.keys(innerFunctionMap).forEach(funName => {
    dataArr.push(`var ${funName} = innerFunctionMap.${funName};`);
  });
  dataArr.push(
    'var getFieldValueFunc = getFieldValue || new Function();',
    'return function inner(){',
    'try {'
  );
  let finsh;
  let uniqueKey;
  let varType;
  let source;
  let sourceField;
  const statementArr = eatChar(str);
  for (let offset = 0; offset < statementArr.length; offset++) {
    let currentData = '';
    const shorts = eatShort(statementArr[offset]);
    let tmp2 = shorts.next();
    if (tmp2.value === 'THEN') {
      dataArr[dataArr.length - 1] += '{';
      // eslint-disable-next-line no-continue
      continue;
    }
    if (tmp2.value === 'DONE') {
      dataArr.push('}');
      // eslint-disable-next-line no-continue
      continue;
    }
    while (!tmp2.done) {
      finsh = false;
      uniqueKey = undefined;
      varType = undefined;
      source = undefined;
      sourceField = undefined;
      switch (tmp2.value) {
        case 'DEF':
          uniqueKey = shorts.next().value;
          varType = shorts.next().value;
          source = shorts.next().value;
          sourceField = shorts.next().value;
          if (varType === 'FUN') {
            currentData = `function ${uniqueKey}(${source})`;
            finsh = true;
          } else {
            currentData = `var ${uniqueKey} = ${getValue(varType, source, sourceField)};`;
          }
          tmp2 = shorts.next();
          break;
        case 'EXEC':
          do {
            tmp2 = shorts.next();
            currentData += `${tmp2.value || ''}`;
          } while (!tmp2.done);
          currentData = ';';
          break;
        case 'RES':
          currentData = `return `;
          do {
            tmp2 = shorts.next();
            currentData += `${tmp2.value || ''}`;
          } while (!tmp2.done);
          currentData += ';';
          break;
        default:
          tmp2 = shorts.next();
      }
      if (finsh) break;
    }
    dataArr.push(currentData);
  }
  dataArr.push('} catch(e) {console.error(e)}');
  dataArr.push('}');
  return dataArr;
}
function getValue(type, source, sourceField) {
  /**
   * source可对应valueType/source/unit
   * sourceField可对应sourceField/unitField
   */
  switch (type) {
    case 'CTX':
      return `ctx["${ctxMap[source]}"].${sourceField}`;
    case 'UNIT':
      return `getFieldValueFunc("${sourceField}")`;
    case 'VAR':
      return `${source === 'DEFAULT' ? 'undefined' : '{}'}`;
    case 'SPEC':
      return `${(specMap[source] || {})[sourceField]}`;
    default:
      return 'undefined';
  }
}

const ctxMap = {
  ACC: 'ctx',
  URL: 'url',
  CUS: 'self',
};
export const specMap = {
  DATE: {
    FIRST_MON_DAY_END:
      'moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format("YYYY-MM-DD 23:59:59")',
    FIRST_MON_DAY:
      'moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format("YYYY-MM-DD 00:00:00")',
    LAST_MON_DAY:
      'moment(new Date(new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getTime()-86400000)).format("YYYY-MM-DD 00:00:00")',
    LAST_MON_DAY_END:
      'moment(new Date(new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getTime()-86400000)).format("YYYY-MM-DD 23:59:59")',
    NOW: 'moment(new Date()).format("YYYY-MM-DD hh:mm:ss")',
    NOW_DAY: 'moment(new Date()).format("YYYY-MM-DD")',
  },
};
export const innerFunctionMap = {
  OFFSET_DATE(date) {
    const argsLength = arguments.length;
    if (argsLength < 2) throw new Error('this function of delay need two arguments at least!');
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments, 1);
    const reg = /(-?\d+)([s|m|h|D|W|M|Y])/;
    // eslint-disable-next-line one-var
    let s = 0,
      mon = 0,
      year = 0;
    args.forEach(offset => {
      const [, value, unit] = offset.match(reg);
      switch (unit) {
        case 's':
          s += Number(value);
          break;
        case 'm':
          s += 60 * Number(value);
          break;
        case 'h':
          s += 3600 * Number(value);
          break;
        case 'D':
          s += Number(value) * 86400;
          break;
        case 'W':
          s += Number(value) * 604800;
          break;
        case 'M':
          mon += Number(value);
          break;
        case 'Y':
          year += Number(value);
          break;
        default:
      }
    });
    if (!date) return undefined;
    const originDate = new Date(date);
    const newYear = originDate.getFullYear() + year;
    const newMon = (12 + originDate.getMonth() + mon) % 12;
    originDate.setFullYear(newYear);
    originDate.setMonth(newMon);
    originDate.setTime(originDate.getTime() + s * 1000);
    return (window as any).moment
      ? (window as any).moment(originDate).format('YYYY-MM-DD hh:mm:ss')
      : originDate.toISOString();
  },
};

export function getContext() {
  return {
    ...getCurrentUser(),
    organizationId: getCurrentOrganizationId(),
    tenantId: getUserOrganizationId(),
  };
}



export function getFieldWidget(field: any){
  if(field.get("type") === "object"){
    return "LOV";
  }

  if(field.get("type") === "number"){
    return "INPUT_NUMBER";
  }

  if(["date", "dateTime"].includes(field.get("type"))){
    return "DATE_PICKER";
  }

  if(!isEmpty(field.get("lookupCode"))){
    return "SELECT";
  }

  return "INPUT";
}