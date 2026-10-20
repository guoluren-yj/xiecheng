/**
 * PendingStore - 待确认暂存器（TG 单条目模式）
 *
 * C8 约束：单次消费 + double-set crash。
 *
 * 设计原则：
 *   - 单条目：任何时候最多一个待确认项
 *   - double-set crash：set() 如果已有 pending 则 throw Error
 *     "fail fast" — 暴露 AgenticLoop 中的并发/重入 bug
 *   - get() 首次消费标记 consumed，后续返回 null（C8 防双击）
 *
 * @date: 2026-06-12
 */

/**
 * @typedef {Object} PendingToolCall
 * @property {string} toolCallId
 * @property {string} toolName
 * @property {*} originalResult
 * @property {Object} [originalArgs]
 * @property {number} timestamp
 * @property {string} assistantMessageId
 * @property {string} [originalArgumentsStr]
 * @property {boolean} [consumed]
 */

class PendingStore {
  constructor() {
    /** @type {PendingToolCall|null} */
    this._pending = null;
  }

  /**
   * 存入待确认项。已有 pending 时 throw（fail fast）
   * @param {PendingToolCall} item
   * @throws {Error} 如果已有未消费的 pending
   */
  set(item) {
    if (this._pending && !this._pending.consumed) {
      throw new Error(`已有 pending (${this._pending.toolName})，${item.toolName} 无法覆盖`);
    }
    this._pending = { ...item, consumed: false };
  }

  /**
   * 获取并消费（C8 约束：第二次调用返回 null）
   * @returns {PendingToolCall|null}
   */
  get() {
    if (!this._pending || this._pending.consumed) return null;
    this._pending.consumed = true;
    return this._pending;
  }

  /**
   * 查看但不消费
   * @returns {PendingToolCall|null}
   */
  peek() {
    return this._pending && !this._pending.consumed ? this._pending : null;
  }

  /** 清除 pending */
  clear() {
    this._pending = null;
  }

  /** 是否有未消费的 pending */
  has() {
    return this._pending !== null && !this._pending.consumed;
  }
}

export default PendingStore;
