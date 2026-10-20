import { isNil, isEmpty } from 'lodash';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
// import { listenAfterFreeHandler } from 'hzero-front/lib/utils/menuTab';

// 获取当前 tab key
export function getFilterBarKey(cacheKey) {
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
export function getFilterBarCache(cacheKey) {
  if (!window.filterBarCache) {
    return null;
  }
  const key = getFilterBarKey(cacheKey);
  if (!key) {
    return null;
  }
  return window.filterBarCache[key];
}

// 设置缓存
export function setFilterBarCache(cacheData, cacheKey) {
  const key = getFilterBarKey(cacheKey);
  if (key) {
    window.filterBarCache = window.filterBarCache || {};
    window.filterBarCache[key] = cacheData;
  }
}

// 重置 cacheKey 对应的筛选器缓存
export function resetFilterBarCache(cacheKey) {
  setFilterBarCache({}, cacheKey);
}

// 判断是否有缓存
export function hasFilterBarCache(cacheKey) {
  const key = getFilterBarKey(cacheKey);
  const filterBarCache = window.filterBarCache || {};
  if (isNil(key)) {
    return false;
  }
  const cache = filterBarCache[key];
  // 同路由下的多个筛选器单元，在路由卸载时可能导致某些筛选器单元的currentFilter值为空，故此处增加对缓存是否有效的判断
  return !isEmpty(cache);
}

// export function initialFilterBarCache(cacheKey?: string) {
// const activeTabKey = getDvaApp()?._store?.getState()?.global?.activeTabKey;
// const menuTabCloseListener = ({ tabKey }) => {
//   if (tabKey === activeTabKey) {
//     resetFilterBarCache(cacheKey);
//   }
// };
// const menuTabRefreshListener = ({ tabKey }) => {
//   if (tabKey === activeTabKey) {
//     pushFilterBarRefreshKey(cacheKey);
//     // 刷新页面，增加延时以确保组件卸载时先执行设置缓存后重置缓存
//     resetFilterBarCache(cacheKey);
//   }
// };
// listenAfterFreeHandler('searchBar', 'close', menuTabCloseListener);
// listenAfterFreeHandler('searchBar', 'refresh', menuTabRefreshListener);
// }

export function pushFilterBarRefreshKey(cacheKey) {
  if (!window.filterBarRefreshKey) {
    window.filterBarRefreshKey = [];
  }
  const key = getFilterBarKey(cacheKey);
  window.filterBarRefreshKey = window.filterBarRefreshKey.filter((i) => i !== key);
  window.filterBarRefreshKey.push(key);
}

export function hasFilterBarRefreshKey(cacheKey) {
  if (!window.filterBarRefreshKey) {
    window.filterBarRefreshKey = [];
  }
  const key = getFilterBarKey(cacheKey);
  return !!window.filterBarRefreshKey.find((i) => i === key);
}

export function popFilterBarRefreshKey(cacheKey) {
  if (!window.filterBarRefreshKey) {
    window.filterBarRefreshKey = [];
  }
  const key = getFilterBarKey(cacheKey);
  window.filterBarRefreshKey = window.filterBarRefreshKey.filter((i) => i !== key);
}
