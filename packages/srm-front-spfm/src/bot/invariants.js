/**
 * 宪法约束 C6 — 1:1 配对验证
 *
 * C6 约束：每个 toolCall 有且仅有一个 toolResult。
 * assertContextIntegrity 验证 messages 数组中每个 tool_call 的 id
 * 恰好出现 2 次（一次在 assistant.toolCalls，一次在 tool 消息）。
 *
 * 使用场景：
 *   - batchSaveToolExchange 提交前调用（C7 原子写入的验证步骤）
 *   - loadFromBackend 加载后调用（C9 加载时验证）
 *
 * @date: 2026-06-12
 */

import logger from './utils/logger';

/**
 * 深拷贝消息数组（用于 C7 快照）
 * @param {import('./types').ChatMessage[]} messages
 * @returns {import('./types').ChatMessage[]}
 */
function deepCloneMessages(messages) {
  try {
    return JSON.parse(JSON.stringify(messages));
  } catch (e) {
    logger.warn(
      'deepCloneMessages JSON.stringify 失败，回退到手动克隆',
      { error: e.message },
      { category: 'bot', component: 'Invariants' }
    );
    // fallback: 手动克隆
    return messages.map((m) => ({
      ...m,
      toolCalls: m.toolCalls ? m.toolCalls.map((tc) => ({ ...tc })) : undefined,
    }));
  }
}

/**
 * C6 验证 — 每个 toolCall 有且仅有一个 toolResult
 *
 * 原理：遍历 messages，统计每个 toolCall ID 的出现次数。
 * assistant 消息的 toolCalls 贡献 1 次计数，tool 消息的 toolCallId 贡献 1 次。
 * 合法数据：counts[id] === 2。
 *
 * @param {import('./types').ChatMessage[]} messages
 * @throws {Error} 如果 C6 违反
 */
function assertContextIntegrity(messages) {
  const counts = new Map();
  const errors = [];

  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.toolCalls) {
      for (const tc of msg.toolCalls) {
        const count = (counts.get(tc.id) || 0) + 1;
        counts.set(tc.id, count);
        if (count > 2) {
          errors.push(`重复 toolCall: ${tc.id} (count=${count})`);
        }
      }
    }
    if (msg.role === 'tool' && msg.toolCallId) {
      if (!counts.has(msg.toolCallId)) {
        errors.push(`孤立 toolResult: ${msg.toolCallId}`);
      }
      const count = (counts.get(msg.toolCallId) || 0) + 1;
      counts.set(msg.toolCallId, count);
    }
  }

  for (const [id, count] of counts) {
    if (count !== 2) {
      errors.push(`C6 违反: ${id} count=${count} (期望=2)`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`[ContextIntegrity]\n${errors.join('\n')}`);
  }
}

export { deepCloneMessages, assertContextIntegrity };
