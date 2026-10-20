/**
 * 宪法约束 C6 修复函数
 *
 * repairC6Violations：自动修复消息数组中的 C6 违反。
 * 两遍扫描：
 *   第一遍：收集所有合法的 toolCall ID 和 toolResult ID
 *   第二遍：移除孤立 tool 消息，修剪孤立 toolCalls
 *
 * @date: 2026-06-12
 */

/**
 * 自动修复 C6 违反
 *
 * @param {import('./types').ChatMessage[]} messages
 * @returns {{ repaired: import('./types').ChatMessage[], report: string[] }}
 *   repaired: 修复后的消息数组
 *   report: 修复操作报告
 */
function repairC6Violations(messages) {
  const report = [];
  const validIds = new Set();
  const resultIds = new Set();

  // 第一遍：收集所有合法的 toolCall ID 和 toolResult ID
  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.toolCalls) {
      for (const tc of msg.toolCalls) {
        validIds.add(tc.id);
      }
    }
    if (msg.role === 'tool' && msg.toolCallId) {
      resultIds.add(msg.toolCallId);
    }
  }

  // 第二遍：移除孤立 tool 消息 + 修剪孤立 toolCalls
  const repaired = messages
    .filter((msg) => {
      if (msg.role === 'tool' && msg.toolCallId && !validIds.has(msg.toolCallId)) {
        report.push(`移除孤立 tool 消息: ${msg.toolCallId} (name=${msg.toolName || 'unknown'})`);
        return false;
      }
      return true;
    })
    .map((msg) => {
      if (msg.role === 'assistant' && msg.toolCalls) {
        const filtered = msg.toolCalls.filter((tc) => resultIds.has(tc.id));
        if (filtered.length !== msg.toolCalls.length) {
          report.push(
            `修剪 assistant.toolCalls: 移除 ${
              msg.toolCalls.length - filtered.length
            } 个孤立 toolCalls`
          );
        }
        return { ...msg, toolCalls: filtered };
      }
      return msg;
    });

  return { repaired, report };
}

export { repairC6Violations };
