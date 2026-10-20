/**
 * Token 工具函数
 *
 * Token 估算、管理和优化功能。
 * 支持按语言分项估算、用量检查、文本压缩、智能摘要生成。
 *
 * @date: 2026-06-15
 */

import logger from '../utils/logger';

/** 默认配置常量（与 types.js 中的 DEFAULT_CONFIG 保持一致） */
const MAX_TOKENS = 131072;
const WARNING_THRESHOLD = 115000; // ~88%

/**
 * 默认 Token 估算器
 *
 * 按字符类型分项估算（非精确但足够用于告警和截断判断）：
 *   - 中日韩文字: 约 2 tokens
 *   - 英文字母和数字: 约 0.25 tokens
 *   - 其他字符（标点、空格等）: 约 0.5 tokens
 *
 * @param {string} text
 * @returns {number}
 */
export function defaultTokenEstimator(text) {
  if (!text) return 0;
  let tokenCount = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3040 && code <= 0x309f) ||
      (code >= 0x30a0 && code <= 0x30ff) ||
      (code >= 0xac00 && code <= 0xd7af)
    ) {
      // 中文/日文/韩文: 约 2 tokens
      tokenCount += 2;
    } else if (
      (code >= 0x61 && code <= 0x7a) ||
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x30 && code <= 0x39)
    ) {
      // 英文字母和数字: 约 0.25 tokens
      tokenCount += 0.25;
    } else {
      // 其他字符（标点、空格等）: 约 0.5 tokens
      tokenCount += 0.5;
    }
  }

  return Math.ceil(tokenCount);
}

/**
 * 估算文本的 Token 数量
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  return defaultTokenEstimator(text);
}

/**
 * 估算 JSON 对象的 Token 数量
 * @param {unknown} obj
 * @returns {number}
 */
export function estimateObjectTokens(obj) {
  if (obj == null) return 0;
  try {
    return estimateTokens(JSON.stringify(obj));
  } catch (error) {
    logger.error('估算对象 Token 失败:', error);
    return 0;
  }
}

/**
 * 估算多个文本的总 Token 数量
 * @param {string[]} texts
 * @returns {number}
 */
export function estimateTotalTokens(texts) {
  return texts.reduce((total, text) => total + estimateTokens(text), 0);
}

/**
 * 检查 Token 使用是否超过限制
 *
 * @param {number} currentTokens
 * @param {number} [maxTokens=MAX_TOKENS]
 * @returns {{ withinLimit: boolean, percentage: number, remaining: number, warning: boolean }}
 */
export function checkTokenLimit(currentTokens, maxTokens = MAX_TOKENS) {
  const percentage = (currentTokens / maxTokens) * 100;
  const remaining = maxTokens - currentTokens;

  return {
    withinLimit: currentTokens <= maxTokens,
    percentage: Math.round(percentage * 100) / 100,
    remaining: Math.max(0, remaining),
    warning: currentTokens > WARNING_THRESHOLD,
  };
}

/**
 * 检查上下文是否超限（返回用户友好的警告/错误消息）
 *
 * @param {number} promptTokens
 * @param {number} [limit=MAX_TOKENS]
 * @returns {{ limited: boolean, warning: string|null }}
 */
export function checkContextLimit(promptTokens, limit = MAX_TOKENS) {
  if (promptTokens > limit - 4096) {
    return { limited: true, warning: `上下文超限 (${promptTokens}/${limit})，请清空会话后重试。` };
  }
  if (promptTokens > WARNING_THRESHOLD) {
    return { limited: false, warning: `上下文接近上限 (${promptTokens}/${limit})，建议清空会话。` };
  }
  return { limited: false, warning: null };
}

/**
 * 上下文截断策略 — 超限后丢弃最早消息保留最近 N 条
 *
 * 最小版截断（与 TG bot-handson-guide.md 行 652-657 一致）：
 *   1. 保留所有 system 消息
 *   2. 保留最近 maxCount 条非 system 消息
 *
 * @param {import('../types').ChatMessage[]} messages
 * @param {number} [maxCount=50] - 保留的最大消息数（不含系统消息）
 * @returns {import('../types').ChatMessage[]}
 */
export function truncateContextMinimal(messages, maxCount = 50) {
  const system = messages.filter((m) => m.role === 'system');
  const recent = messages.filter((m) => m.role !== 'system').slice(-maxCount);
  return [...system, ...recent];
}

/**
 * 🏗️ 进阶版截断：对早期对话做摘要压缩（暂不实现，留作扩展）
 * 调用 LLM 将最早的 N 条消息摘要为一句话，替换原来的多条消息。
 *
 * @param {import('../types').ChatMessage[]} messages
 * @returns {import('../types').ChatMessage[]}
 */
// export function summarizeHistory(messages) { ... }

/**
 * 压缩文本以减少 Token 使用
 *
 * @param {string} text
 * @param {number} targetTokens - 目标 Token 数
 * @param {number} [keepStart=100] - 重度压缩时保留开头字符数
 * @param {number} [keepEnd=50] - 重度压缩时保留结尾字符数
 * @returns {string}
 */
export function compressText(text, targetTokens, keepStart = 100, keepEnd = 50) {
  const currentTokens = estimateTokens(text);
  if (currentTokens <= targetTokens) return text;

  const ratio = targetTokens / currentTokens;

  if (ratio >= 0.7) {
    // 轻度压缩：只移除多余空格和换行
    return text.replace(/\s+/g, ' ').trim();
  } else if (ratio >= 0.4) {
    // 中度压缩：截断文本
    const charsToKeep = Math.floor(text.length * ratio);
    return `${text.substring(0, charsToKeep)}...（内容已压缩）`;
  } else {
    // 重度压缩：只保留开头和结尾
    const start = text.substring(0, keepStart);
    const end = text.substring(text.length - keepEnd);
    return `${start}...（中间内容已压缩）...${end}`;
  }
}

/**
 * 智能摘要生成（减少 Token 使用）
 *
 * @param {unknown} data
 * @param {'object'|'document'|'code'|'log'} type
 * @param {number} [maxSummaryTokens=100]
 * @returns {string}
 */
export function generateSmartSummary(data, type, maxSummaryTokens = 100) {
  let summary = '';

  switch (type) {
    case 'object': {
      const obj = /** @type {Record<string, unknown>} */ (data);
      if (obj.name && obj.fields) {
        summary = `对象：${obj.name}，${Array.isArray(obj.fields) ? obj.fields.length : 0} 个字段`;
        if (obj.description) {
          summary += `，描述：${String(obj.description).substring(0, 50)}`;
        }
      }
      break;
    }
    case 'document': {
      const doc = /** @type {Record<string, unknown>} */ (data);
      if (doc.title && doc.content) {
        summary = `文档：${doc.title}，内容：${String(doc.content).substring(0, 80)}...`;
      }
      break;
    }
    case 'code': {
      if (typeof data === 'string') {
        const lines = data.split('\n').length;
        const funcCount = (data.match(/function\s+\w+/g) || []).length;
        summary = `代码：${lines} 行，${funcCount} 个函数`;
      } else {
        const codeData = /** @type {Record<string, unknown>} */ (data);
        if (codeData.content) {
          summary = `代码：${String(codeData.content).split('\n').length} 行`;
        }
      }
      break;
    }
    case 'log': {
      if (Array.isArray(data)) {
        summary = `日志：${data.length} 条记录`;
        if (data.length > 0) {
          summary += `，最近：${String(data[data.length - 1]).substring(0, 60)}`;
        }
      }
      break;
    }
    default:
      break;
  }

  if (!summary) {
    summary = `${JSON.stringify(data).substring(0, 80)}...`;
  }

  if (estimateTokens(summary) > maxSummaryTokens) {
    summary = compressText(summary, maxSummaryTokens);
  }

  return summary;
}

/**
 * 批量估算和优化 Token 使用
 *
 * @param {Array<{ content: unknown, type?: 'object'|'document'|'code'|'log' }>} items
 * @param {number} [maxTotalTokens=MAX_TOKENS]
 * @returns {{ optimizedItems: Array<{ content: unknown, summary?: string }>, totalTokens: number, compressionRatio: number }}
 */
export function optimizeTokenUsage(items, maxTotalTokens = MAX_TOKENS) {
  let totalTokens = 0;
  /** @type {Array<{ content: unknown, summary: string, originalTokens: number, summaryTokens: number }>} */
  const optimizedItems = [];

  // 第一遍：估算 Token 并生成摘要
  for (const item of items) {
    const contentTokens = estimateObjectTokens(item.content);
    const summary = generateSmartSummary(item.content, item.type || 'object');
    const summaryTokens = estimateTokens(summary);
    totalTokens += contentTokens;
    optimizedItems.push({
      content: item.content,
      summary,
      originalTokens: contentTokens,
      summaryTokens,
    });
  }

  // 不需要压缩
  if (totalTokens <= maxTotalTokens) {
    return {
      optimizedItems: optimizedItems.map((item) => ({
        content: item.content,
        summary: item.summary,
      })),
      totalTokens,
      compressionRatio: 1,
    };
  }

  // 第二遍：压缩
  const compressionRatio = maxTotalTokens / totalTokens;
  /** @type {Array<{ content: unknown, summary?: string }>} */
  const compressedItems = [];
  let compressedTotalTokens = 0;

  for (const item of optimizedItems) {
    const targetTokens = Math.floor(item.originalTokens * compressionRatio);
    if (item.summaryTokens <= targetTokens * 0.8) {
      compressedItems.push({ content: item.summary, summary: item.summary });
      compressedTotalTokens += item.summaryTokens;
    } else {
      const compressedContent = compressText(JSON.stringify(item.content), targetTokens);
      compressedItems.push({ content: compressedContent, summary: item.summary });
      compressedTotalTokens += estimateTokens(compressedContent);
    }
  }

  return {
    optimizedItems: compressedItems,
    totalTokens: compressedTotalTokens,
    compressionRatio,
  };
}

export const tokenUtils = Object.freeze({
  estimateTokens,
  estimateObjectTokens,
  estimateTotalTokens,
  checkTokenLimit,
  checkContextLimit,
  truncateContextMinimal,
  compressText,
  generateSmartSummary,
  optimizeTokenUsage,
  defaultTokenEstimator,
});
