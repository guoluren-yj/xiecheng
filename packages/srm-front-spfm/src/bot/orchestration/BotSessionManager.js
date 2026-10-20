/**
 * BotSessionManager - 会话管理器
 *
 * 职责：消息的增删改查、C7 原子写入、C3 消息锁定、C9 加载时修复、发布-订阅通知 UI 更新。
 *
 * Phase 2 升级：
 *   - [C7] batchSaveToolExchange 原子写入：快照→深拷贝→C6 验证→提交/回滚
 *   - [C3] updateAssistantMessage locked 守卫：防止流结束后的修改
 *   - 增强 toOpenAIHistory 支持
 *
 * @date: 2026-06-12
 */

import logger from '../utils/logger';
import { assertContextIntegrity, deepCloneMessages } from '../invariants';
import { repairC6Violations } from '../invariant-fixes';

class BotSessionManager {
  constructor() {
    /** @type {import('../types').BotSession} */
    this.session = {
      id: `session-${Date.now()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      round: 0,
      requestLogs: [],
      lastDebugChunk: null,
    };
    /** @type {Set<Function>} */
    this._listeners = new Set();
  }

  // ========== 订阅机制 ==========

  /**
   * 注册消息更新监听
   * @param {Function} callback - (messages: ChatMessage[]) => void
   */
  onUpdate(callback) {
    this._listeners.add(callback);
  }

  /**
   * 移除消息更新监听
   * @param {Function} callback
   */
  offUpdate(callback) {
    this._listeners.delete(callback);
  }

  /** 通知所有监听者 */
  _notifyListeners() {
    const messages = this.getMessages();
    this._listeners.forEach((cb) => {
      try {
        cb(messages);
      } catch (e) {
        logger.error('监听器异常', e, { category: 'bot', component: 'BotSessionManager' });
      }
    });
  }

  // ========== 消息写入 ==========

  /**
   * 添加用户消息
   * @param {string} content - 消息内容
   * @returns {import('../types').ChatMessage}
   */
  addUserMessage(content) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    this.session.messages.push(msg);
    this.session.updatedAt = Date.now();
    this._notifyListeners();
    return msg;
  }

  /**
   * 添加 assistant 消息（初始创建，后续通过 updateAssistantMessage 增量更新）
   * @param {string} content - 初始内容（可为空）
   * @param {Array} [toolCalls] - 工具调用列表
   * @param {boolean} [locked=false] - 是否锁定
   * @returns {import('../types').ChatMessage}
   */
  addAssistantMessage(content = '', toolCalls = [], locked = false) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
      toolCalls: [...toolCalls],
      locked,
    };
    this.session.messages.push(msg);
    this.session.updatedAt = Date.now();
    this._notifyListeners();
    return msg;
  }

  /**
   * [C3] 更新 assistant 消息内容（流式增量更新）
   * locked 守卫：如果消息已锁定，拒绝修改。
   *
   * @param {string} messageId
   * @param {string} newContent
   * @param {boolean} [locked=false] - 如果为 true，更新内容并锁定消息
   * @returns {boolean} 是否更新成功
   */
  updateAssistantMessage(messageId, newContent, locked = false) {
    const msg = this.session.messages.find((m) => m.id === messageId);
    if (!msg || msg.role !== 'assistant') return false;
    // [C3] locked 守卫：已锁定消息不可修改
    if (msg.locked) return false;
    msg.content = newContent;
    if (locked) msg.locked = true;
    this._notifyListeners();
    return true;
  }

  /**
   * 添加工具执行结果消息
   * @param {string} toolCallId - 工具调用 ID
   * @param {string} toolName - 工具名
   * @param {*} result - 执行结果
   * @returns {import('../types').ChatMessage}
   */
  addToolResultMessage(toolCallId, toolName, result) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'tool',
      content: typeof result === 'string' ? result : JSON.stringify(result),
      timestamp: Date.now(),
      toolCallId,
      toolName,
    };
    this.session.messages.push(msg);
    this.session.updatedAt = Date.now();
    this._notifyListeners();
    return msg;
  }

  /**
   * [C7] 原子写入：批量保存 tool_call + tool_result 对
   *
   * 生产版本流程：
   *   1. 快照原始 messages（deepClone）
   *   2. 在深拷贝副本上修改
   *   3. C6 验证（assertContextIntegrity + repairC6Violations 预修复）
   *   4. 验证通过 → 原子提交到 session.messages
   *   5. 验证失败 → 回滚到快照，抛出异常
   *
   * @param {string} assistantMessageId
   * @param {import('../types').ToolCall[]} toolCalls
   * @param {Array<{ toolCallId: string, toolName: string, result: * }>} toolResults
   * @throws {Error} 如果 C6 验证失败
   */
  batchSaveToolExchange(assistantMessageId, toolCalls, toolResults) {
    // [C7] Step 1: 快照
    const snapshot = deepCloneMessages(this.session.messages);

    try {
      // [C7] Step 2: 在深拷贝副本上修改
      const working = deepCloneMessages(this.session.messages);

      // 2a. 追加 toolCalls 到 assistant 消息
      const asstMsg = working.find((m) => m.id === assistantMessageId);
      if (asstMsg) {
        asstMsg.toolCalls = [...(asstMsg.toolCalls || []), ...toolCalls.map((tc) => ({ ...tc }))];
      }

      // 2b. 插入 tool 结果消息（在 assistant 消息之后）
      if (asstMsg) {
        const idx = working.indexOf(asstMsg);
        for (const tr of toolResults) {
          working.splice(idx + 1, 0, {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            role: 'tool',
            content: typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result),
            timestamp: Date.now(),
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
          });
        }
      } else {
        // fallback: 用 addToolResultMessage 追加
        for (const tr of toolResults) {
          working.push({
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            role: 'tool',
            content: typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result),
            timestamp: Date.now(),
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
          });
        }
      }

      // [C7] Step 3: C6 验证（先修复可能的孤立条目，再验证）
      const { repaired } = repairC6Violations(working);
      assertContextIntegrity(repaired);

      // [C7] Step 4: 原子提交
      this.session.messages = repaired;
      this.session.round += 1;
      this.session.updatedAt = Date.now();
      this._notifyListeners();
    } catch (e) {
      // [C7] Step 5: 回滚到快照
      this.session.messages = snapshot;
      throw e;
    }
  }

  // ========== 消息读取 ==========

  /**
   * 获取全部消息
   * @returns {import('../types').ChatMessage[]}
   */
  getMessages() {
    return this.session.messages;
  }

  /**
   * 获取最近 N 条消息
   * @param {number} [count=50]
   * @returns {import('../types').ChatMessage[]}
   */
  getRecentMessages(count = 50) {
    return this.session.messages.slice(-count);
  }

  /**
   * 转换为 OpenAI 格式的对话历史（用于构建请求体）
   * @returns {Array<{ role: string, content: string|null, tool_calls?: Array, tool_call_id?: string }>}
   */
  toOpenAIHistory() {
    const result = [];
    for (const msg of this.session.messages) {
      // 对齐 TG convertMessageToOpenAIMessage：system 消息过滤掉，AI 不需要看到
      if (msg.role !== 'system') {
        // 对齐 TG：有 toolCalls 无 content 时用 '(无)' 占位
        let content = msg.content || '';
        if (
          !content.trim() &&
          msg.role === 'assistant' &&
          msg.toolCalls &&
          msg.toolCalls.length > 0
        ) {
          content = '(无)';
        }
        const base = { role: msg.role, content };
        if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
          base.tool_calls = msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.name,
              arguments:
                typeof tc.arguments === 'string' ? tc.arguments : JSON.stringify(tc.arguments),
            },
          }));
        }
        if (msg.role === 'tool') {
          base.tool_call_id = msg.toolCallId;
        }
        result.push(base);
      }
    }
    return result;
  }

  // ========== 会话管理 ==========

  // ========== 诊断日志 ==========

  /**
   * 设置最后一条诊断数据块（只保留最近一条，对齐 TG BotSessionManager.setLastDebugChunk）
   * @param {Object|null} chunk
   */
  setLastDebugChunk(chunk) {
    if (!this.session) return;
    this.session.lastDebugChunk = chunk;
  }

  /**
   * 获取最后一条诊断数据块
   * @returns {Object|null}
   */
  getLastDebugChunk() {
    return this.session?.lastDebugChunk ?? null;
  }

  /**
   * 获取请求日志
   * @returns {Array}
   */
  getRequestLogs() {
    return this.session?.requestLogs || [];
  }

  /**
   * 记录请求和返回（用于调试导出，对齐 TG BotSessionManager.addRequestLog）
   * @param {number} round - 第几轮请求
   * @param {Array} conversationHistory - 发送给 AI 的完整上下文
   * @param {string} response - AI 返回的内容
   */
  addRequestLog(round, conversationHistory, response) {
    if (!this.session) return;
    if (!this.session.requestLogs) {
      this.session.requestLogs = [];
    }
    this.session.requestLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      round,
      timestamp: Date.now(),
      conversationHistory,
      response,
    });
  }

  /** 重置会话 */
  reset() {
    this.session = {
      id: `session-${Date.now()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      round: 0,
      requestLogs: [],
      lastDebugChunk: null,
    };
    this._notifyListeners();
  }

  /**
   * [C9] 从后端加载会话，修复 C6 违反
   * @param {Array} messages - 从后端加载的消息数组
   * @returns {boolean} 加载是否成功
   */
  loadFromBackend(messages) {
    try {
      // C6 验证
      assertContextIntegrity(messages);
      this.session.messages = messages;
      return true;
    } catch (e) {
      logger.warn(
        'C6 验证失败，尝试 C9 自动修复',
        { error: e.message },
        { category: 'bot', component: 'BotSessionManager' }
      );
      // C9 自动修复
      try {
        const { repaired, report } = repairC6Violations(messages);
        logger.info('C9 修复完成', { report }, { category: 'bot', component: 'BotSessionManager' });
        this.session.messages = repaired;
        this._notifyListeners();
        return true;
      } catch (repairError) {
        logger.error('C9 修复失败', repairError, {
          category: 'bot',
          component: 'BotSessionManager',
        });
        return false;
      }
    }
  }
}

export default BotSessionManager;
