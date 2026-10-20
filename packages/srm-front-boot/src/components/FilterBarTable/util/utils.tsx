/* eslint-disable no-new-func */
/* eslint-disable eqeqeq */
import { parse } from 'querystring';

import { decodeString } from '../../../utils/utils';

export function parseUrlParams(urlSearch: string, paramKey: string) {
  try {
    // 解决url参数中带+号会被querystring解析成空格的问题
    const urlParams = parse(urlSearch.replace(/\+/g, '%2B').substr(1));
    if (!urlParams || !urlParams[paramKey]) {
      return undefined;
    }
    let params = {};
    const paramsStr = decodeString(urlParams[paramKey]);
    if (paramsStr) {
      params = JSON.parse(paramsStr);
    }
    return params;
  } catch (e) {
    console.warn(e);
    return undefined;
  }

}