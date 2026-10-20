/**
 * BotLogger — 盘古 Bot 日志工具
 *
 * 参照天工 Bot 的 logger.ts 模式：
 *   - 4 级日志: debug / info / warn / error
 *   - 输出格式: [timestamp] [LEVEL] [category] <component> - message {data}
 *   - 支持 category/component 上下文标记
 *   - error 级别自动附加堆栈
 *
 * @date: 2026-06-12
 */

/** @type {'debug'|'info'|'warn'|'error'} */
const LOG_LEVELS = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
});

const DEFAULT_CONFIG = Object.freeze({
  minLevel: 0, // DEBUG
  enableTimestamp: true,
});

/**
 * 格式化时间戳
 * @returns {string}
 */
function _timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * 格式化日志参数
 * @param {string} level
 * @param {string} message
 * @param {*} [data]
 * @param {Object} [context]
 */
function _formatLog(level, message, data, context) {
  const parts = [];
  if (DEFAULT_CONFIG.enableTimestamp) parts.push(`[${_timestamp()}]`);
  parts.push(`[${level}]`);
  if (context && context.category) parts.push(`[${context.category}]`);
  if (context && context.component) parts.push(`<${context.component}>`);
  parts.push(`- ${message}`);
  let output = parts.join(' ');
  if (data !== undefined && data !== null) {
    const dataStr = typeof data === 'string' ? data : _safeStringify(data);
    if (dataStr) output += `  ${dataStr}`;
  }
  return output;
}

/**
 * 安全 JSON 序列化（处理循环引用）
 * @param {*} obj
 * @returns {string}
 */
function _safeStringify(obj) {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        return value;
      },
      2
    );
  } catch (e) {
    return String(obj);
  }
}

/**
 * 获取调用堆栈的前 N 帧
 * @param {number} [frames=5]
 * @returns {string}
 */
function _getStack(frames = 5) {
  const { stack } = new Error();
  if (!stack) return '';
  const lines = stack.split('\n').slice(3, 3 + frames);
  return lines.join('\n');
}

const logger = {
  /**
   * @param {string} message
   * @param {*} [data]
   * @param {Object} [context] - { category?, component? }
   */
  debug(message, data, context) {
    if (LOG_LEVELS.DEBUG < DEFAULT_CONFIG.minLevel) return;
    console.debug(_formatLog('DEBUG', message, data, context));
  },

  info(message, data, context) {
    if (LOG_LEVELS.INFO < DEFAULT_CONFIG.minLevel) return;
    console.info(_formatLog('INFO', message, data, context));
  },

  warn(message, data, context) {
    if (LOG_LEVELS.WARN < DEFAULT_CONFIG.minLevel) return;
    console.warn(_formatLog('WARN', message, data, context));
  },

  error(message, data, context) {
    if (LOG_LEVELS.ERROR < DEFAULT_CONFIG.minLevel) return;
    console.error(_formatLog('ERROR', message, data, context));
    console.error(`  Stack:\n${_getStack(5)}`);
  },
};

export default logger;
