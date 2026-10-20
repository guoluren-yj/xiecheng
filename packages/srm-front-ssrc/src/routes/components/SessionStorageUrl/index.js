/**
 * 组件-页面跳转存储数据
 * @date: 2019-12-20
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import querystring from 'querystring';
// import moment from 'moment';

const URLKEY = 'sourceRouter';
class SessionStorageUrl {
  // constructor() {}

  clear() {
    sessionStorage.removeItem(URLKEY);
  }

  getSearchUrl() {
    const routerParams = querystring.parse(window.location.search.substr(1));
    return routerParams;
  }

  jsonStringify(obj = {}) {
    const strings = querystring.stringify(obj);
    return strings;
  }

  storeUrl(label = '', url = '', key = '', ...others) {
    if (!label || !url) {
      return;
    }

    this.clear();

    const source = { label, url, ...others };
    const urlKey = label === 'recommend' ? `${URLKEY}+${key}` : `${label}+${key}`;
    sessionStorage.setItem(key ? urlKey : URLKEY, JSON.stringify(source));
  }

  getStorageUrl() {
    const storedDate = sessionStorage.getItem(URLKEY);
    const obj = JSON.parse(storedDate) || {};
    return obj;
  }

  getBackPath(path = '') {
    const { backRecommend = '' } = this.getSearchUrl();

    if (!backRecommend) {
      return path;
    }

    const { label = '', url = '' } = this.getStorageUrl();

    if (backRecommend === label) {
      return url;
    } else {
      return path;
    }
  }
}

const SSU = new SessionStorageUrl();

export default SSU;
