/**
 * MarmotScript/util.js
 * MarmotScript 通用方法
 * @date: 2021-11-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

// localStorage 中脚本编辑器整体存储key
const LOCAL_STORAGE_KEY = 'marmotScriptCache';
// 单个类型的脚本缓存队列最大数量为 5
const MARMOTSCRIPT_QUEUE = 5;

/**
 * 向 localStorage 中临时存储脚本
 * 判断是否有缓存，没有的话就进行添加，如果已经存在的对应的脚本分类，判断是否已经存过该key对应的脚本，如果存储过就进行替换。
 * 如果没有存储过，判断当前的数组长度是否等于5，如果大于等于5，当前脚本入队列，头部第一个数据出队列。
 * 如果小于5，直接入队列。
 * @param {String} scriptCacheKey 脚本分类key
 * @param {Object} saveData 存储数据
 */
export function setMarmotScriptCache(scriptCacheKey, saveData) {
  const marmotScriptCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  let cacheTarget = marmotScriptCache[scriptCacheKey];
  if (cacheTarget) {
    if (cacheTarget.find((n) => n.key === saveData.key)) {
      cacheTarget = cacheTarget.map((arr) => {
        return {
          ...arr,
          script: arr.key === saveData.key ? saveData.script : arr.script,
        };
      });
    } else {
      if (marmotScriptCache[scriptCacheKey].length >= MARMOTSCRIPT_QUEUE) {
        cacheTarget.splice(0, 1);
      }
      cacheTarget.push(saveData);
    }
  } else {
    cacheTarget = [saveData];
  }
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      ...marmotScriptCache,
      [scriptCacheKey]: cacheTarget,
    })
  );
}

/**
 *
 * @param {String} scriptCacheKey 脚本分类key
 * @param {String} targetKey 要获取的目标key
 * @returns 脚本数据
 */
export function getMarmotScriptCache(scriptCacheKey, targetKey) {
  const marmotScriptCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  const cacheTarget = marmotScriptCache[scriptCacheKey];
  if (cacheTarget) {
    return cacheTarget.find((cache) => cache.key === targetKey);
  }
  return null;
}
