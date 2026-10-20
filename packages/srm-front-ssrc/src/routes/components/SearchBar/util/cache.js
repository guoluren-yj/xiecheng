import { isNil, isEmpty } from 'lodash';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { listenAfterFreeHandler } from 'hzero-front/lib/utils/menuTab';

// 获取当前 tab key
function getSearchBarKey(cacheCode) {
  const tabKey = getDvaApp()._store.getState().global.activeTabKey;
  if (!tabKey) {
    return null;
  }
  const searchBarKey = tabKey.concat('/').concat(cacheCode);
  return searchBarKey;
}

// 获取 searchCode 对应的筛选器缓存
export function getSearchBarCache(cacheCode) {
  if (!window.searchBarCache) {
    return null;
  }
  const key = getSearchBarKey(cacheCode);
  if (!key) {
    return null;
  }
  return window.searchBarCache[key];
}

// 设置缓存
export function setSearchBarCache(cacheCode, cacheData) {
  const key = getSearchBarKey(cacheCode);
  if (key) {
    window.searchBarCache = window.searchBarCache || {};
    window.searchBarCache[key] = cacheData;
  }
}

// 重置 searchCode 对应的筛选器缓存
export function resetSearchBarCache(cacheCode) {
  setSearchBarCache(cacheCode, {});
}

// 判断是否有缓存
export function hasSearchBarCache(cacheCode) {
  const key = getSearchBarKey(cacheCode);
  const searchBarCache = window.searchBarCache || {};
  if (isNil(key) || isEmpty(searchBarCache[key])) {
    return false;
  }
  const cache = searchBarCache[key];
  // 同路由下的多个筛选器单元，在路由卸载时可能导致某些筛选器单元的currentFilter值为空，故此处增加对缓存是否有效的判断
  return !!cache?.currentFilter?.filterCode;
}

export function initialFilterCache(cacheCode) {
  const activeTabKey = getDvaApp()?._store?.getState()?.global?.activeTabKey;
  const menuTabCloseListener = ({ tabKey }) => {
    if (tabKey === activeTabKey) {
      resetSearchBarCache(cacheCode);
    }
  };
  const menuTabRefreshListener = ({ tabKey }) => {
    if (tabKey === activeTabKey) {
      // 刷新页面，增加延时以确保组件卸载时先执行设置缓存后重置缓存
      setTimeout(() => {
        resetSearchBarCache(cacheCode);
      });
    }
  };
  listenAfterFreeHandler('searchBar', 'close', menuTabCloseListener);
  listenAfterFreeHandler('searchBar', 'refresh', menuTabRefreshListener);
}
