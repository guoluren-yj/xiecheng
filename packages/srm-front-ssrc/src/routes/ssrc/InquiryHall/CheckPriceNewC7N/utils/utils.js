import { isObject } from 'lodash';
import { getCurrentUserId, getResponse } from 'utils/utils';

import { saveNewCheckPriceUserMemory } from '@/services/checkPriceNewService';

const userId = getCurrentUserId();

const TagStyleMap = {
  itemCategoryName: {
    border: 0,
    lineHeight: '.22rem',
    color: '#000000',
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginRight: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemSelected: {
    border: 0,
    lineHeight: '.22rem',
    color: '#47B881',
    backgroundColor: 'rgba(71,184,129,0.10)',
  },
};

/**
 * 生成查询参数
 */
export const generateQueryParams = (queryData) => {
  const queryParams = {};
  for (const key in queryData) {
    // 日期数字 特殊处理
    // if (queryData[key]?.start || queryData[key]?.end) {
    if (key.includes('_range')) {
      Object.assign(queryParams, {
        [key.split('_')?.[0]]: JSON.stringify({
          from: queryData[key].split(',')?.[0],
          to: queryData[key].split(',')?.[1],
        }),
      });
    } else if (Array.isArray(queryData[key])) {
      // 下拉框 值集 多选处理
      Object.assign(queryParams, { [key]: queryData[key].toString() });
    } else if (!isObject(queryData[key])) {
      Object.assign(queryParams, { [key]: queryData[key] });
    }
  }
};

// 计算 Tag style
const getComputedTagStyle = (type) => {
  return TagStyleMap[type];
};

/**
 * 保存用户记忆
 * @param {*} param0 {lastMemoObj, value, key}
 * @returns result{}
 */
const saveMemo = async ({ lastMemoObj, value, key }) => {
  const params = {
    ...((lastMemoObj && lastMemoObj[key]) || {}),
    userId,
    enabledFlag: 1,
    configValue: value,
    configKey: key,
    configDesc: key,
  };
  const result = getResponse(await saveNewCheckPriceUserMemory(params));
  return result;
};

export { getComputedTagStyle, saveMemo };
