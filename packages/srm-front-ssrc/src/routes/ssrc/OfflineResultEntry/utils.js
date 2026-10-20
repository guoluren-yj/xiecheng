import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

// 获取当前 tab key
export function getCacheKey(cacheCode) {
  const tabKey = getDvaApp()._store.getState().global.activeTabKey;
  if (!tabKey) {
    return null;
  }
  const cacheKey = tabKey.concat('/').concat(cacheCode);
  return cacheKey;
}

// 获取 cacheCode 对应的缓存
export function getCacheContent(cacheCode) {
  if (!window.cacheContent) {
    return null;
  }
  const key = getCacheKey(cacheCode);
  if (!key) {
    return null;
  }
  return window.cacheContent[key];
}

// 设置缓存
export function setCacheContent(cacheCode, cacheData) {
  const key = getCacheKey(cacheCode);
  if (key) {
    window.cacheContent = window.cacheContent || {};
    window.cacheContent[key] = cacheData;
  }
}

/**
 * 通过 cacheKey 删除缓存
 * @param {String} cacheKey - 缓存的key
 */
export function deleteCache(cacheKey) {
  if (cacheKey && window.cacheContent) {
    delete window.cacheContent[cacheKey];
  }
}
