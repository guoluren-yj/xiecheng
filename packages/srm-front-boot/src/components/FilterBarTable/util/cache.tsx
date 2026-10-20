import { isNil, isEmpty } from 'lodash';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { listenAfterFreeHandler } from 'hzero-front/lib/utils/menuTab';

import type { ICacheData } from './common';

// 获取当前 tab key
export function getFilterBarKey(cacheKey?: string) {
  const tabKey = getDvaApp()._store.getState().global.activeTabKey;
  if (!tabKey) {
    return null;
  }
  let filterBarKey = tabKey;
  if (!isNil(cacheKey)) {
    filterBarKey = filterBarKey.concat('/').concat(cacheKey);
  }
  return filterBarKey;
}

// 获取 cacheKey 对应的筛选器缓存
export function getFilterBarCache(cacheKey?: string) {
  if (!(window as any).filterBarCache) {
    return null;
  }
  const key = getFilterBarKey(cacheKey);
  if (!key) {
    return null;
  }
  return (window as any).filterBarCache[key] as ICacheData;
}

// 设置缓存
export function setFilterBarCache(cacheData: ICacheData, cacheKey?: string) {
  const key = getFilterBarKey(cacheKey);;
  if (key) {
    (window as any).filterBarCache = (window as any).filterBarCache || {};
    (window as any).filterBarCache[key] = cacheData;
  }
}

// 重置 cacheKey 对应的筛选器缓存
export function resetFilterBarCache(cacheKey?: string) {
  setFilterBarCache({} as ICacheData, cacheKey);
}

// 判断是否有缓存
export function hasFilterBarCache(cacheKey?: string) {
  const key = getFilterBarKey(cacheKey);
  const filterBarCache = (window as any).filterBarCache || {};
  if (isNil(key)) {
    return false;
  }
  const cache: ICacheData = filterBarCache[key];
  // 同路由下的多个筛选器单元，在路由卸载时可能导致某些筛选器单元的currentFilter值为空，故此处增加对缓存是否有效的判断
  return !isEmpty(cache);
}

export function initialFilterBarCache(cacheKey?: string) {
  const activeTabKey = getDvaApp()?._store?.getState()?.global?.activeTabKey;
  const menuTabCloseListener = ({ tabKey }) => {
    if (tabKey === activeTabKey) {
      resetFilterBarCache(cacheKey);
    }
  };
  const menuTabRefreshListener = ({ tabKey }) => {
    if (tabKey === activeTabKey) {
      pushFilterBarRefreshKey(cacheKey);
      // 刷新页面，增加延时以确保组件卸载时先执行设置缓存后重置缓存
      resetFilterBarCache(cacheKey);
    }
  };
  listenAfterFreeHandler('searchBar', 'close', menuTabCloseListener);
  listenAfterFreeHandler('searchBar', 'refresh', menuTabRefreshListener);
}

export function pushFilterBarRefreshKey(cacheKey?: string) {
  if (!(window as any).filterBarRefreshKey) {
    (window as any).filterBarRefreshKey = [];
  }
  const key = getFilterBarKey(cacheKey);
  (window as any).filterBarRefreshKey = (window as any).filterBarRefreshKey.filter(i => i !== key);
  (window as any).filterBarRefreshKey.push(key);
}

export function hasFilterBarRefreshKey(cacheKey?: string) {
  if (!(window as any).filterBarRefreshKey) {
    (window as any).filterBarRefreshKey = [];
  }
  const key = getFilterBarKey(cacheKey);
  return !!(window as any).filterBarRefreshKey.find(i => i === key);
}


export function popFilterBarRefreshKey(cacheKey?: string) {
  if (!(window as any).filterBarRefreshKey) {
    (window as any).filterBarRefreshKey = [];
  }
  const key = getFilterBarKey(cacheKey);
  (window as any).filterBarRefreshKey = (window as any).filterBarRefreshKey.filter(i => i !== key);
}