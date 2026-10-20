/**
 * csvUtils - CSV 工具函数
 *
 * 用于将 JSON 数据转换为 CSV 格式，减少 LLM Token 消耗。
 * 结构化数据以 CSV 格式比 JSON 更紧凑，可显著降低上下文负担。
 *
 * jsonToCSV 的底层实现位于 sharedWorldUtils（Phase 2），
 * 本模块提供 convertToCSVFormat 自动检测包装（对齐 TG csvUtils.ts）。
 *
 * @date: 2026-06-15
 */

import logger from './logger';
import { jsonToCSV } from '../tools/utils/sharedWorldUtils';

/**
 * 将工具结果数据转换为 CSV 格式（如果适用）
 *
 * 自动检测结果中是否包含数组数据，如有则尝试转换。
 * 转换失败时回退到 JSON.stringify 输出。
 *
 * @param {*} result - 要转换的数据（通常为工具执行结果）
 * @returns {string} CSV 格式字符串或 JSON 字符串
 *
 * @example
 * convertToCSVFormat({ data: [{ name: 'Alice', age: 30 }] })
 * // => "查询结果：共 1 条记录\nage,name\n30,Alice"
 */
export function convertToCSVFormat(result) {
  if (!result || typeof result !== 'object') {
    return String(result);
  }

  const data = /** @type {Object} */ (result);

  // 查找可转换的数组数据：优先 result.data（直接数组），再尝试 result.data.content / result.data.objects
  /** @type {Object[]|undefined} */
  let arrayData;

  if (Array.isArray(data.data)) {
    arrayData = data.data;
  } else if (data.data && typeof data.data === 'object') {
    if (
      Array.isArray(data.data.content) &&
      data.data.content.length > 0 &&
      typeof data.data.content[0] === 'object'
    ) {
      arrayData = data.data.content;
    } else if (
      Array.isArray(data.data.objects) &&
      data.data.objects.length > 0 &&
      typeof data.data.objects[0] === 'object'
    ) {
      arrayData = data.data.objects;
    } else if (
      Array.isArray(data.data.records) &&
      data.data.records.length > 0 &&
      typeof data.data.records[0] === 'object'
    ) {
      arrayData = data.data.records;
    }
  }

  if (Array.isArray(arrayData) && arrayData.length > 0) {
    const firstItem = arrayData[0];
    if (firstItem && typeof firstItem === 'object') {
      try {
        const csv = jsonToCSV(arrayData);
        const summary = `查询结果：共 ${arrayData.length} 条记录\n`;
        return summary + csv;
      } catch (e) {
        logger.warn('CSV 转换失败，回退到 JSON', e, { category: 'bot', component: 'csvUtils' });
        return JSON.stringify(result);
      }
    }
  }

  return JSON.stringify(result);
}
