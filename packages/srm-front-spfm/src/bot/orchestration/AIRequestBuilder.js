/**
 * AIRequestBuilder — AI 请求构建器
 *
 * 职责：
 *   1. 构建完整请求体（含上下文/工具定义/对话历史）
 *   2. 构建单轮历史（buildRoundHistory）
 *   3. 格式转换为 OpenAI Chat Completions 格式
 *
 * 对齐 TG AIRequestBuilder.ts v2（2026-06-24）：
 *   - convertMessageToOpenAIMessage 从 TG 移植，用于 toOpenAIHistory 的统一路径
 *   - buildRoundHistory 增强 C6 防线日志（对标 TG buildRoundHistory 行 249-272）
 *
 * 请求体发往端点：POST /v1/bot/chat/stream
 *
 * @date: 2026-06-24
 */

class AIRequestBuilder {
  /**
   * 构建完整请求体
   *
   * @param {Object} params
   * @param {string} params.question - 用户问题
   * @param {string} [params.script] - 当前脚本内容
   * @param {Object} [params.context] - 上下文信息（PanguContext）
   * @param {Object[]} [params.tools] - 工具定义列表（getAllToolDefinitions）
   * @param {Array} [params.conversationHistory] - 对话历史（OpenAI 格式）
   * @param {string} [params.modelProvider] - 模型提供方（来自 localStorage）
   * @returns {Object} - 请求体
   */
  static build({
    question,
    script = '',
    context = {},
    tools = [],
    conversationHistory = [],
    extraSystemPrompt,
  }) {
    // 构建 system prompt 中的上下文（平铺展开）
    const contextSummary = AIRequestBuilder._buildContextSummary(context);

    const body = {
      question,
      script,
      conversationHistory,
      tools,
      contextSummary,
    };
    if (extraSystemPrompt) body.extraSystemPrompt = extraSystemPrompt;
    return body;
  }

  /**
   * 将 ChatMessage 转换为 OpenAI 格式（对齐 TG convertMessageToOpenAIMessage 行 91-136）
   *
   * @param {import('../types').ChatMessage} msg
   * @returns {Object|null}
   */
  static convertMessageToOpenAIMessage(msg) {
    if (msg.role === 'system') return null;

    if (msg.role === 'user') {
      return { role: 'user', content: msg.content };
    }

    if (msg.role === 'assistant') {
      let msgContent = '';
      if (msg.content && msg.content.trim().length > 0) {
        msgContent = msg.content;
      } else if (msg.toolCalls && msg.toolCalls.length > 0) {
        msgContent = '(无)';
      }
      const base = { role: 'assistant', content: msgContent };
      if (msg.toolCalls && msg.toolCalls.length > 0) {
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
      return base;
    }

    if (msg.role === 'tool') {
      return { role: 'tool', content: msg.content, tool_call_id: msg.toolCallId };
    }

    return null;
  }

  /**
   * 构建第 N 轮历史（已有 history + 当前轮工具结果）
   *
   * 用于多轮 AgenticLoop 中，在每轮工具执行后追加当前轮的
   * assistant 消息和 tool 结果。
   *
   * [C4] 单轮追加：只添加当前轮的 assistant 消息和 tool 结果。
   * [C6] 防线：检测孤儿 tool 消息（有 toolResult 但无 toolCall），自动移除。
   *
   * @param {Array} existingHistory - 已有的 OpenAI 格式历史
   * @param {string} currentRoundContent - 当前轮 AI 回复文本
   * @param {Array} currentRoundToolCalls - 当前轮 tool_calls
   * @param {Array} currentRoundToolResults - 当前轮 tool 结果
   * @returns {Array} - 追加后的完整历史
   */
  static buildRoundHistory(
    existingHistory,
    currentRoundContent,
    currentRoundToolCalls,
    currentRoundToolResults
  ) {
    const history = [...existingHistory];

    // 添加当前轮 assistant 消息
    if (currentRoundContent || (currentRoundToolCalls && currentRoundToolCalls.length > 0)) {
      // 对齐 TG：有 tool_calls 无 content 时用 '(无)' 占位
      let content = currentRoundContent || '';
      if (!content.trim() && currentRoundToolCalls && currentRoundToolCalls.length > 0) {
        content = '(无)';
      }
      const assistantMsg = {
        role: 'assistant',
        content,
      };

      if (currentRoundToolCalls && currentRoundToolCalls.length > 0) {
        assistantMsg.tool_calls = currentRoundToolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name,
            arguments:
              typeof tc.arguments === 'string' ? tc.arguments : JSON.stringify(tc.arguments),
          },
        }));
      }

      history.push(assistantMsg);
    }

    // 添加当前轮 tool 结果
    if (currentRoundToolResults && currentRoundToolResults.length > 0) {
      for (const tr of currentRoundToolResults) {
        let content = '';
        try {
          content = typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result);
        } catch (e) {
          content = String(tr.result || '');
        }

        // [C6] 防线：确保有 toolCallId
        if (tr.toolCallId) {
          history.push({
            role: 'tool',
            tool_call_id: tr.toolCallId,
            content,
          });
        }
      }

      // [C6] 防线：验证 conversationHistory 无 C6 违反
      // 对齐 TG buildRoundHistory 行 240-272 — 完整诊断日志输出
      const validToolCallIds = new Set();
      for (const msg of history) {
        if (msg.role === 'assistant' && msg.tool_calls) {
          for (const tc of msg.tool_calls) {
            validToolCallIds.add(tc.id);
          }
        }
      }

      // 检测孤儿 tool 消息
      const orphanToolMsgs = [];
      for (let i = 0; i < history.length; i++) {
        const msg = history[i];
        if (msg.role === 'tool' && msg.tool_call_id && !validToolCallIds.has(msg.tool_call_id)) {
          orphanToolMsgs.push({ index: i, toolCallId: msg.tool_call_id });
        }
      }

      if (orphanToolMsgs.length > 0) {
        const orphanIds = orphanToolMsgs.map((o) => o.toolCallId).join(', ');
        const validIds = [...validToolCallIds].join(', ') || '(无)';
        const allResultIds = (currentRoundToolResults || [])
          .map((r) => `${r.toolName}:${r.toolCallId}`)
          .join(', ');
        console.warn(
          `[C6防线] buildRoundHistory 产出中发现 ${orphanToolMsgs.length} 条孤儿 tool 消息，已移除。\n` +
            `  孤儿 tool_call_id: [${orphanIds}]\n` +
            `  有效 tool_call_id:  [${validIds}]\n` +
            `  allToolResults: [${allResultIds}]\n` +
            `  消息总数: ${history.length}`
        );

        // 从后往前删除以保持索引正确
        for (let i = orphanToolMsgs.length - 1; i >= 0; i--) {
          history.splice(orphanToolMsgs[i].index, 1);
        }
      }

      return history;
    }

    return history;
  }

  static _buildContextSummary(context) {
    const {
      scriptContent,
      code,
      taskCode,
      description,
      applyTenantNum,
      tenantNum,
      scriptType,
      ...rest
    } = context;

    // resourceCode = ${租户编码}|${类型}|${脚本编码}
    const t = applyTenantNum || tenantNum || rest.tenantCode || '';
    const rt = scriptType || 'ADAPTOR';
    const sc = taskCode || code || '';
    if (t || rt || sc) rest.resourceCode = `${t}|${rt}|${sc}`;

    if (description) rest.scriptDescription = description;

    return rest;
  }
}

export default AIRequestBuilder;
