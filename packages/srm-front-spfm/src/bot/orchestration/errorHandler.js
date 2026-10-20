/**
 * 统一错误处理器
 *
 * 提供统一的错误处理和用户友好的错误消息。
 * 支持错误重试、错误日志记录、错误分类。
 *
 * @date: 2026-06-15
 */

import logger from '../utils/logger';

/**
 * 错误类型
 * @typedef {'validation'|'network'|'tool'|'ai'|'timeout'|'unknown'} ErrorType
 */

/**
 * 错误结果
 * @typedef {Object} ErrorResult
 * @property {ErrorType} type - 错误类型
 * @property {string} message - 原始错误消息
 * @property {string} userMessage - 用户友好的错误消息
 * @property {Object} [details] - 错误详情
 */

/**
 * 重试配置
 * @typedef {Object} RetryConfig
 * @property {number} maxRetries - 最大重试次数
 * @property {number} baseDelay - 基础重试间隔(ms)
 * @property {number} maxDelay - 最大重试间隔(ms)
 * @property {boolean} exponentialBackoff - 是否使用指数退避
 * @property {ErrorType[]} retryableErrors - 可重试的错误类型
 * @property {string[]} retryableMessages - 可重试的错误消息关键词
 */

/** @type {RetryConfig} */
const DEFAULT_RETRY_CONFIG = Object.freeze({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  retryableErrors: ['network', 'timeout'],
  retryableMessages: ['fetch', 'network', 'timeout', 'ECONNREFUSED', 'ETIMEDOUT'],
});

/**
 * 错误类型对应的用户消息
 * @type {Record<string, string>}
 */
const ERROR_MESSAGES = Object.freeze({
  validation: '参数验证失败，请检查输入内容',
  network: '网络连接失败，请检查网络后重试',
  tool: '工具执行失败，请稍后重试',
  ai: 'AI 响应失败，请稍后重试',
  timeout: '请求超时，请稍后重试',
  unknown: '操作失败，请稍后重试',
});

/**
 * 错误记录器（闭包实现私有状态）
 */
function createErrorRecorder() {
  /** @type {Array<Object>} */
  const errors = [];
  const MAX_SIZE = 100;

  return {
    /** @param {Object} error */
    add(error) {
      errors.push(error);
      if (errors.length > MAX_SIZE) errors.shift();
    },
    getAll() {
      return [...errors];
    },
    getRecent(limit = 20) {
      return errors.slice(-limit);
    },
    /** @param {string} type */
    getByType(type) {
      return errors.filter((e) => e.type === type);
    },
    getSummary() {
      const byType = {};
      errors.forEach((e) => {
        byType[e.type] = (byType[e.type] || 0) + 1;
      });
      return { total: errors.length, byType };
    },
    clear() {
      errors.length = 0;
    },
  };
}

const errorRecorder = createErrorRecorder();

const BotErrorHandler = Object.freeze({
  /**
   * 分类错误类型
   * @param {unknown} error
   * @returns {ErrorType}
   */
  classifyError(error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('timeout') || message.includes('超时') || message.includes('ETIMEDOUT')) {
      return 'timeout';
    }
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('HTTP') ||
      message.includes('ECONNREFUSED') ||
      message.includes('Failed to fetch')
    ) {
      return 'network';
    }
    if (message.includes('validation') || message.includes('参数') || message.includes('请提供')) {
      return 'validation';
    }
    if (message.includes('tool') || message.includes('工具')) {
      return 'tool';
    }
    if (message.includes('ai') || message.includes('model') || message.includes('API')) {
      return 'ai';
    }
    return 'unknown';
  },

  /**
   * 获取用户友好的错误消息
   * @param {ErrorType} errorType
   * @returns {string}
   */
  getUserMessage(errorType) {
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.unknown;
  },

  /**
   * 处理工具错误
   * @param {unknown} error
   * @param {string} [toolName]
   * @returns {ErrorResult}
   */
  handleToolError(error, toolName) {
    const errorType = this.classifyError(error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      type: errorType,
      message,
      userMessage: this.getUserMessage(errorType),
      details: { toolName },
    };
  },

  /**
   * 从错误创建工具结果
   * @param {unknown} error
   * @param {string} [toolName]
   * @returns {{ success: false, error: string, executionTime: number, timestamp: number }}
   */
  toToolResult(error, toolName) {
    const result = this.handleToolError(error, toolName);
    this.logError(result);
    return {
      success: false,
      error: result.userMessage,
      executionTime: 0,
      timestamp: Date.now(),
    };
  },

  /**
   * 记录错误日志
   * @param {ErrorResult} error
   * @param {Object} [context]
   */
  logError(error, context) {
    const errorRecord = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      type: error.type,
      message: error.message,
      userMessage: error.userMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context: context || {},
      details: error.details,
    };
    errorRecorder.add(errorRecord);
    logger.error('=== 错误发生 ===', {
      type: error.type,
      message: error.message,
      userMessage: error.userMessage,
      details: error.details,
      context,
    });
    if (errorRecord.stack) {
      logger.error('Stack:', errorRecord.stack);
    }
    logger.error('================');
  },

  /**
   * 判断错误是否可重试
   * @param {unknown} error
   * @param {RetryConfig} [config]
   * @returns {boolean}
   */
  isRetryable(error, config = DEFAULT_RETRY_CONFIG) {
    const errorType = this.classifyError(error);
    const message = error instanceof Error ? error.message : String(error);
    if (config.retryableErrors.includes(errorType)) return true;
    for (const keyword of config.retryableMessages) {
      if (message.toLowerCase().includes(keyword.toLowerCase())) return true;
    }
    return false;
  },

  /**
   * 获取重试延迟
   * @param {number} attempt
   * @param {RetryConfig} [config]
   * @returns {number}
   */
  getRetryDelay(attempt, config = DEFAULT_RETRY_CONFIG) {
    if (config.exponentialBackoff) {
      return Math.min(config.baseDelay * 2 ** attempt, config.maxDelay);
    }
    return config.baseDelay;
  },
});

export default BotErrorHandler;

/**
 * 便捷函数：处理工具错误并返回结果
 * @param {unknown} error
 * @param {string} [toolName]
 * @returns {{ success: false, error: string, executionTime: number, timestamp: number }}
 */
export function handleToolError(error, toolName) {
  return BotErrorHandler.toToolResult(error, toolName);
}

/**
 * 智能重试函数
 *
 * @template T
 * @param {() => Promise<T>} fn - 要执行的异步函数
 * @param {Partial<RetryConfig>} [config] - 重试配置
 * @param {Object} [context] - 错误上下文
 * @returns {Promise<T>}
 */
export async function withRetry(fn, config = {}, context) {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  /** @type {unknown} */
  let lastError;

  /**
   * 递归重试（替代 for 循环，满足 no-await-in-loop）
   *
   * 返回值：
   *   - { ok: true, value: T }  — 成功
   *   - { ok: false }           — 全部重试失败（break 语义），调用者统一处理
   *
   * @param {number} attempt
   * @returns {Promise<{ ok: true, value: T } | { ok: false }>}
   */
  const retryLoop = async (attempt) => {
    try {
      const value = await fn();
      return { ok: true, value };
    } catch (error) {
      lastError = error;

      // 用户中断不重试（直接透传，不包装）
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      // 可重试且未达上限
      if (attempt < finalConfig.maxRetries && BotErrorHandler.isRetryable(error, finalConfig)) {
        const delay = BotErrorHandler.getRetryDelay(attempt, finalConfig);
        logger.warn(
          `重试 ${attempt + 1}/${finalConfig.maxRetries}，${delay}ms 后重试...`,
          { error: error instanceof Error ? error.message : String(error), context },
          { category: 'retry', component: context?.component }
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryLoop(attempt + 1);
      }

      // break 语义：不可重试或已达上限，退出递归
      return { ok: false };
    }
  };

  const result = await retryLoop(0);

  if (!result.ok) {
    // 全部重试失败
    const errorResult = BotErrorHandler.handleToolError(lastError, context?.toolName);
    BotErrorHandler.logError(errorResult, context);
    throw lastError;
  }

  return result.value;
}

/**
 * 安全执行 — 捕获所有异常，返回 ErrorResult 而非抛出
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {string} [toolName]
 * @returns {Promise<{ success: true, data: T } | { success: false, error: string }>}
 */
export async function safeExecute(fn, toolName) {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const errResult = BotErrorHandler.handleToolError(error, toolName);
    BotErrorHandler.logError(errResult, { toolName });
    return { success: false, error: errResult.userMessage };
  }
}

/** 导出错误记录查询 */
export function getAllErrors() {
  return errorRecorder.getAll();
}
export function getRecentErrors(limit = 20) {
  return errorRecorder.getRecent(limit);
}
export function getErrorsByType(type) {
  return errorRecorder.getByType(type);
}
export function getErrorSummary() {
  return errorRecorder.getSummary();
}
export function clearErrors() {
  errorRecorder.clear();
}
