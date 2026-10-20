/**
 * diagnostic — 调试数据导出工具
 *
 * 从 BotSessionManager 收集完整会话数据，导出为 JSON 文件下载。
 *
 *
 * @date: 2026-06-12
 */

/**
 * 导出诊断数据为 JSON 文件下载
 *
 * @param {Object} options
 * @param {import('../orchestration/BotSessionManager').default} options.sessionManager - 会话管理器
 * @param {Object<string, boolean>} [options.toolStates] - 工具启用状态
 * @param {string} [options.modelProvider] - 当前模型供应商
 * @param {string} [options.filename] - 文件名（默认自动生成）
 */
export function exportDiagnosticData({ sessionManager, toolStates, modelProvider, filename }) {
  if (!sessionManager) {
    console.warn('[diagnostic] sessionManager 不可用，无法导出');
    return;
  }

  const session = sessionManager.session || {};
  const messages = session.messages || [];

  // 构建诊断数据对象
  const diagnosticData = {
    exportTime: new Date().toISOString(),
    session: {
      id: session.id || 'unknown',
      round: session.round || 0,
      createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : null,
      updatedAt: session.updatedAt ? new Date(session.updatedAt).toISOString() : null,
    },
    messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      contentPreview:
        typeof msg.content === 'string'
          ? msg.content.slice(0, 500) + (msg.content.length > 500 ? '...(truncated)' : '')
          : msg.content,
      contentLength: typeof msg.content === 'string' ? msg.content.length : 0,
      timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null,
      toolCallId: msg.toolCallId || null,
      toolName: msg.toolName || null,
      locked: msg.locked || false,
      toolCallsCount: msg.toolCalls ? msg.toolCalls.length : 0,
    })),
    messageCount: messages.length,
    toolStates: toolStates || null,
    modelProvider: modelProvider || null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  };

  // 生成文件名
  const defaultFilename = filename || `bot-diagnostic-${Date.now()}.json`;

  // 创建并触发下载
  try {
    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('[diagnostic] 导出失败:', e);
  }
}
