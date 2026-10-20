import moment from 'moment';
import intl from 'hzero-front/lib/utils/intl';
import uuid from 'uuid/v4';
import { getCurrentUser } from 'hzero-front/lib/utils/utils';

export const MarkContentItemType = {
  FIX: 'fix', // 固定字符串
  VAR: 'var', // 变量
};

export const getWatermarkFixParams = () => {
  const { loginName, realName, tenantName, timeZone } = getCurrentUser();
  return {
    '_WATER_MARK_PARAM_PRINT_DATE_': {
      getValue: () => moment().format('YYYY-MM-DD'),
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.date').d('打印时间(yyyy-mm-dd)'),
    },
    '_BUILTIN_PARAM_PRINT_DATE_1_': {
      getValue: () => moment().format('YYYY-MM-DD'),
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.date1').d('打印时间(yyyymmdd)'),
    },
    '_WATER_MARK_PARAM_PRINT_TIME_': {
      getValue: () => moment().format('YYYY-MM-DD hh:mm:ss'),
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.time').d('打印时间(yyyy-mm-dd hh:mm:ss)')
    },
    '_WATER_MARK_PARAM_PRINT_TIME_WITH_ZONE_': {
      getValue: () => `${moment().format('YYYY-MM-DD hh:mm:ss')} ${timeZone}`,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.timezone').d('打印时间(yyyy-mm-dd hh:mm:ss)带时区')
    },
    '_WATER_MARK_PARAM_PRINTER_CODE_': {
      getValue: () => loginName,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.accountCode').d('操作人账户编码')
    },
    '_WATER_MARK_PARAM_PRINTER_NAME_': {
      getValue: () => realName,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.accountName').d('操作人账户名称'),
    },
    '_WATER_MARK_PARAM_PRINTER_TENANT_NAME_': {
      getValue: () => tenantName,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.tenantName').d('操作人所属租户名称'),
    },
  };
};

export const getFixParams = () => {
  const { loginName, realName, tenantName, timeZone } = getCurrentUser();
  return {
    '_BUILTIN_PARAM_PRINT_DATE_': {
      getValue: () => moment().format('YYYY-MM-DD'),
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.date').d('打印时间(yyyy-mm-dd)'),
    },
    '_BUILTIN_PARAM_PRINT_DATE_1_': {
      getValue: () => moment().format('YYYY-MM-DD'),
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.date1').d('打印时间(yyyymmdd)'),
    },
    '_BUILTIN_PARAM_PRINT_TIME_': {
      getValue: () => moment().format('YYYY-MM-DD hh:mm:ss'),
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.time').d('打印时间(yyyy-mm-dd hh:mm:ss)')
    },
    '_BUILTIN_PARAM_PRINT_TIME_WITH_ZONE_': {
      getValue: () => `${moment().format('YYYY-MM-DD hh:mm:ss')} ${timeZone}`,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.timezone').d('打印时间(yyyy-mm-dd hh:mm:ss)带时区')
    },
    '_BUILTIN_PARAM_PRINTER_CODE_': {
      getValue: () => loginName,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.accountCode').d('操作人账户编码')
    },
    '_BUILTIN_PARAM_PRINTER_NAME_': {
      getValue: () => realName,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.accountName').d('操作人账户名称'),
    },
    '_BUILTIN_PARAM_PRINTER_TENANT_NAME_': {
      getValue: () => tenantName,
      meaning: intl.get('hrpt.reportDesign.model.waterMask.content.contextParam.tenantName').d('操作人所属租户名称'),
    },
  };
};

export const transformExpressionContent = (content) => {
  if (!content || !content.length) {
    return [{
      key: uuid(),
      type: MarkContentItemType.FIX,
      value: undefined,
      meaning: undefined,
    }];
  }
  const result = [];
  content.forEach((item, index) => {
    if (index === 0 && item.type === MarkContentItemType.VAR) {
      result.push({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
        meaning: undefined,
      });
    }
    result.push(item);
    if (content[index+1] && content[index+1].type === MarkContentItemType.VAR) {
      result.push({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
        meaning: undefined,
      });
    }
    if (index === content.length - 1 && item.type === MarkContentItemType.VAR) {
      result.push({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
        meaning: undefined,
      });
    }
  });
  return result;
};

export const parseExpression = (expression, { templateFields }) => {
  if (!expression) {
    return {
      value: [],
      meaning: '',
    }
  }
  const params = parseExpressionParams(expression, { templateFields });
  const meaning =
    params
      .map(item => item.type === MarkContentItemType.VAR ? `{${item.meaning}}` : item.value)
      .join('');
  return {
    value: params,
    meaning,
  };
};

export const parseExpressionParams = (expression, { templateFields }) => {
  const fixParams = getFixParams();
  const params = [];
  let expressionStr = expression;
  // 去掉开头的CONCAT(
  if (expression.indexOf('CONCAT(') === 0) {
    expressionStr = expressionStr.substr(7);
  }
  // 去掉结尾的)
  if (expression.substr(expression.length -1) === ')') {
    expressionStr = expressionStr.substr(0, expressionStr.length -1);
  }
  const array =
    expressionStr
      .split(',')
      .map(item => {
        if (item === '""' || item === "''") {
          return undefined;
        }
        if (item.includes("'")) {
          return {
            key: uuid(),
            value: item,
            meaning: item,
            type: MarkContentItemType.FIX,
          };
        } else {
          let meaning = item;
          if (fixParams[item]) {
            meaning = fixParams[item].meaning;
          } else {
            const target = templateFields ? templateFields.find(i => i.code === item) : undefined;
            if (target && target.name) {
              meaning = target.name;
            }
          }
          return {
            key: uuid(),
            value: item,
            meaning,
            type: MarkContentItemType.VAR,
          };
        }
      }).filter(Boolean);
  array.forEach((item, index) => {
    if (item.type === MarkContentItemType.FIX && index !== array.length -1 && array[index+1].type === MarkContentItemType.FIX) {
      array[index+1].value = item.value + ',' + array[index+1].value;
      return;
    }
    if ((item.value.startsWith("'") && item.value.endsWith("'")) || (item.value.startsWith('"') && item.value.endsWith('"'))) {
      item.value = item.value.slice(1, -1);
    }
    params.push(item);
  });
  return params;
};

export function stringToBase64InBrowser(str) {
  // 使用TextEncoder将字符串编码为UTF-8字节
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(str);

  // 创建一个Blob，其内容为Uint8Array
  const blob = new Blob([uint8Array]);

  // 创建一个FileReader来读取Blob的内容
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const [, result] = base64String && base64String.split(',') || []; 
        resolve(result);
      }; // reader.result为Base64编码的字符串
      reader.onerror = reject;
      reader.readAsDataURL(blob); // 读取Blob并返回DataURL（即Base64编码的URL）
  });
}