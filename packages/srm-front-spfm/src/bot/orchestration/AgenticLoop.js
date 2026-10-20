/**
 * AgenticLoop — 多轮对话编排器
 *
 * Phase 2 升级：支持 30 轮工具调用循环、C5 串行执行、C7 原子写入、Pending 检测。
 *
 * 完整调用链：
 *   用户消息 → addUserMessage → 循环体（最多 30 轮）→ 返回结果
 *
 * 循环体（每轮）：
 *   1. AIRequestBuilder.build() 构建请求
 *   2. callAiStream() SSE 流式调用
 *   3. 收集 tool_calls
 *   4. ToolCoordinator.executeSerial() 串行执行
 *   5. 检测 Pending（确认门禁）
 *   6. batchSaveToolExchange() 原子写入
 *   7. 检查 stop_session / 无 tool_calls → 退出
 *
 * @date: 2026-06-12
 */

import logger from '../utils/logger';
import { callAiStream, extractAllJsonObjects } from '../botService';
import AIRequestBuilder from './AIRequestBuilder';
import ToolCoordinator from './ToolCoordinator';
import * as toolContext from './toolContext';
import { DEFAULT_CONFIG } from '../types';
import { withRetry } from './errorHandler';
import { checkContextLimit } from './tokenUtils';
import { convertToCSVFormat } from '../utils/csvUtils';

class AgenticLoop {
  /**
   * @param {import('./BotSessionManager').default} sessionManager
   * @param {import('../tools/ToolRegistry').default} [toolRegistry]
   * @param {import('./PendingStore').default} [pendingStore]
   */
  constructor(sessionManager, toolRegistry, pendingStore) {
    this.sessionManager = sessionManager;
    this.toolRegistry = toolRegistry || null;
    this.pendingStore = pendingStore || null;
    this.toolCoordinator = toolRegistry ? new ToolCoordinator(toolRegistry) : null;
    /** @type {AbortController|null} */
    this._abortController = null;
    /** @type {boolean} */
    this._isProcessing = false;
    /** 整体开始时间 */
    this._startTime = 0;
    /** 最近一次 handleUserMessage 的上下文（resumeSession 复用） */
    this._lastContext = {};
    /** 最近一次 handleUserMessage 的 scriptCodeDs ref（resumeSession 读取最新脚本内容） */
    this._lastScriptCodeDs = null;
    /** 最近一次 handleUserMessage 的 modelProvider */
    this._lastModelProvider = null;
    /** resumeSession 回调存储 */
    this._lastCallbacks = {
      onUpdate: null,
      onToolCallStart: null,
      onToolCallEnd: null,
      onRoundChange: null,
    };
  }

  /**
   * 处理用户消息（入口）
   *
   * @param {string} question - 用户输入
   * @param {Object} options
   * @param {Object} [options.context] - PanguContext 上下文
   * @param {Object} [options.scriptCodeDs] - 编辑器 DataSet
   * @param {string} [options.modelProvider] - 模型提供方（来自 localStorage）
   * @param {Function} options.onUpdate - (messages: ChatMessage[]) => void
   * @param {Function} options.onStatusChange - (processing: boolean) => void
   * @param {Function} [options.onToolCallStart] - (toolName: string) => void
   * @param {Function} [options.onToolCallEnd] - (toolName: string, result: *) => void
   * @param {Function} [options.onRoundChange] - (round: number) => void
   * @param {Function} [options.onTokenWarning] - (warning: boolean) => void Token 警告回调
   * @param {Function} [options.onUsageUpdate] - (usage: Object) => void 每轮 Stream 结束时 usage 回调（对齐 TG onUsageUpdate）
   * @param {Function} [options.onError] - (error: string) => void
   * @param {string[]} [options.enabledToolNames] - 启用的工具名列表，为空时全部可见
   * @returns {Promise<{ answer: string, success: boolean, requiresConfirmation: boolean, shouldStopSession: boolean, needsFollowUp?: boolean }>}
   */
  async handleUserMessage(
    question,
    {
      context = {},
      scriptCodeDs,
      modelProvider,
      onUpdate,
      onStatusChange,
      onToolCallStart,
      onToolCallEnd,
      onRoundChange,
      onTokenWarning,
      onUsageUpdate,
      onError,
      enabledToolNames,
    }
  ) {
    if (this._isProcessing) {
      if (onError) onError('正在处理中，请等待当前请求完成');
      return { answer: '', success: false, requiresConfirmation: false, shouldStopSession: false };
    }

    this._isProcessing = true;
    this._startTime = Date.now();
    if (onStatusChange) onStatusChange(true);

    try {
      // 0. 更新工具运行时上下文
      const scriptContent = scriptCodeDs?.current?.get('script') || '';
      toolContext.setScriptContent(scriptContent);
      toolContext.setScriptCodeDs(scriptCodeDs);

      // 1. 添加用户消息
      this.sessionManager.addUserMessage(question);
      if (onUpdate) onUpdate(this.sessionManager.getMessages());

      // 2. 获取脚本内容和上下文
      const fullContext = { ...context, scriptContent };

      // 保存上下文供 resumeSession 复用
      this._lastContext = fullContext;
      this._lastScriptCodeDs = scriptCodeDs;
      this._lastModelProvider = modelProvider;
      this._lastCallbacks = {
        onUpdate,
        onToolCallStart,
        onToolCallEnd,
        onRoundChange,
        onTokenWarning,
        onUsageUpdate,
      };

      // 3. 获取工具定义（toolRegistry 为 null 时跳过工具系统）
      let toolDefinitions = this.toolRegistry ? this.toolRegistry.getAllToolDefinitions() : [];

      // 根据启用的工具名过滤（如 script_modify_execute 关闭时排除 modify_script/execute_script）
      this._lastEnabledToolNames = enabledToolNames || null;
      if (this._lastEnabledToolNames && toolDefinitions.length > 0) {
        toolDefinitions = toolDefinitions.filter((def) =>
          this._lastEnabledToolNames.includes(def.name)
        );
      }

      // 4. 运行多轮循环
      const result = await this._runSession({
        question,
        scriptContent,
        context: fullContext,
        toolDefinitions,
        modelProvider,
        onUpdate,
        onToolCallStart,
        onToolCallEnd,
        onRoundChange,
        onTokenWarning,
        onUsageUpdate,
      });

      if (onStatusChange) onStatusChange(false);
      return result;
    } catch (e) {
      logger.error('handleUserMessage 异常', e, { category: 'bot', component: 'AgenticLoop' });
      if (onError) onError(e.message);
      this._cleanup();
      if (onStatusChange) onStatusChange(false);
      return { answer: '', success: false, requiresConfirmation: false, shouldStopSession: false };
    }
  }

  /**
   * AgenticLoop 主编排循环
   *
   * 循环体（最多 MAX_TOOL_CALL_ROUNDS 轮）：
   *   ① 构建请求 → ② SSE 调用 → ③ 收集 tool_calls → ④ 串行执行 → ⑤ Pending 检测 → ⑥ 原子写入 → ⑦ 退出判断
   *
   * @param {Object} params
   * @returns {Promise<{ answer: string, success: boolean, requiresConfirmation: boolean, shouldStopSession: boolean, needsFollowUp?: boolean }>}
   */
  async _runSession({
    question,
    scriptContent,
    context,
    toolDefinitions,
    modelProvider,
    onUpdate,
    onToolCallStart,
    onToolCallEnd,
    onRoundChange,
    onTokenWarning,
    onUsageUpdate,
  }) {
    const roundParams = {
      question,
      scriptContent,
      context,
      toolDefinitions,
      modelProvider,
      onUpdate,
      onToolCallStart,
      onToolCallEnd,
      onRoundChange,
      onTokenWarning,
      onUsageUpdate,
    };
    const initialState = {
      currentRoundHistory: this.sessionManager.toOpenAIHistory(),
      finalAnswer: '',
      shouldStop: false,
      needsFollowUp: false,
    };

    return this._runRound(0, initialState, roundParams);
  }

  /**
   * AgenticLoop 单轮处理（递归替代 for 循环，满足 no-await-in-loop）
   *
   * @param {number} round - 当前轮次
   * @param {Object} state - 累计状态
   * @param {Object} params - 固定参数
   * @returns {Promise<{ answer: string, success: boolean, requiresConfirmation: boolean, shouldStopSession: boolean, needsFollowUp?: boolean }>}
   */
  async _runRound(round, state, params) {
    const {
      question,
      scriptContent,
      context,
      toolDefinitions,
      modelProvider,
      onUpdate,
      onToolCallStart,
      onToolCallEnd,
      onRoundChange,
      onTokenWarning,
      onUsageUpdate,
    } = params;
    const { currentRoundHistory } = state;
    let { finalAnswer, shouldStop, needsFollowUp } = state;

    // 达到轮次上限 → 结束
    if (round > DEFAULT_CONFIG.MAX_TOOL_CALL_ROUNDS) {
      this._cleanup();
      return {
        answer: finalAnswer,
        success: true,
        requiresConfirmation: false,
        shouldStopSession: false,
        needsFollowUp,
      };
    }

    // 超时检查
    if (Date.now() - this._startTime > DEFAULT_CONFIG.TOOL_CALL_TIMEOUT_MS) {
      this._cleanup();
      return {
        answer: '**超时**: AI 响应超过时间限制，请稍后重试。',
        success: true,
        requiresConfirmation: false,
        shouldStopSession: false,
      };
    }

    // Abort 检查
    if (this._abortController && this._abortController.signal.aborted) {
      this._cleanup();
      return {
        answer: finalAnswer,
        success: true,
        requiresConfirmation: false,
        shouldStopSession: false,
      };
    }

    if (onRoundChange) onRoundChange(round + 1);

    // 更新工具运行时上下文（确保脚本内容为最新，多轮场景下上一轮可能已修改）
    toolContext.setScriptContent(scriptContent);

    // === Step 1: 构建请求体 ===
    const requestBody = AIRequestBuilder.build({
      question,
      script: scriptContent,
      context,
      tools: toolDefinitions,
      conversationHistory: currentRoundHistory,
    });
    // 构建 modelProviderConfig（替代原来的 modelProvider 字符串）
    const modelProviderConfig = { providerCode: modelProvider };

    // === Step 2: 创建 assistant 消息占位 ===
    const asstMsg = this.sessionManager.addAssistantMessage('', [], false);
    if (onUpdate) onUpdate(this.sessionManager.getMessages());

    // === Step 3: SSE 流式调用 AI（带指数退避重试）===
    this._abortController = new AbortController();
    const streamResult = await withRetry(
      () =>
        new Promise((resolve) => {
          /** @type {Map<string, Object>} */
          const toolCallMap = new Map();
          let fullResponse = '';
          let streamUsage = null;

          callAiStream(
            {
              question: requestBody.question,
              script: requestBody.script,
              modelProviderConfig,
              conversationHistory: requestBody.conversationHistory,
              tools: requestBody.tools,
              contextSummary: requestBody.contextSummary,
            },
            {
              signal: this._abortController.signal,

              onContent: (content) => {
                fullResponse = content;
                this.sessionManager.updateAssistantMessage(asstMsg.id, content, false);
                if (onUpdate) onUpdate(this.sessionManager.getMessages());
              },

              onToolCall: (tc) => {
                // tool_calls 累积（同 ID 合并 arguments）
                const existing = toolCallMap.get(tc.id);
                if (!existing) {
                  toolCallMap.set(tc.id, { id: tc.id, name: tc.name, arguments: tc.arguments });
                } else {
                  if (tc.arguments) existing.arguments += tc.arguments;
                  if (tc.name) existing.name = tc.name;
                }
              },

              onUsage: (usage) => {
                streamUsage = usage;
              },

              onError: (error) => {
                this.sessionManager.updateAssistantMessage(
                  asstMsg.id,
                  `**错误**: ${error}\n\n> AI 服务暂时不可用，请稍后重试。`,
                  true
                );
                if (onUpdate) onUpdate(this.sessionManager.getMessages());
                resolve({ fullResponse, toolCalls: [], requiresConfirmation: false, error });
              },

              onDone: () => {
                // 流结束，锁定消息（[C10] 不在此处写入 toolCalls，由 Step 10 统一原子写入）
                this.sessionManager.updateAssistantMessage(asstMsg.id, fullResponse, true);
                if (onUpdate) onUpdate(this.sessionManager.getMessages());
                resolve({
                  fullResponse,
                  toolCalls: Array.from(toolCallMap.values()),
                  requiresConfirmation: false,
                  usage: streamUsage,
                });
              },
            }
          );
        }),
      { maxRetries: 2 },
      { component: 'AgenticLoop', action: 'callAiStream' }
    );

    // 检查是否有错误
    if (streamResult.error) {
      this._cleanup();
      return {
        answer: streamResult.fullResponse,
        success: true,
        requiresConfirmation: false,
        shouldStopSession: false,
      };
    }

    // 空响应回退 — 仅当无 content 且无 tool_call 时才退出
    if (
      (!streamResult.fullResponse || streamResult.fullResponse.trim() === '') &&
      (!streamResult.toolCalls || streamResult.toolCalls.length === 0)
    ) {
      finalAnswer = finalAnswer || '处理超时，请重试。';
      if (this._abortController && this._abortController.signal.aborted) {
        finalAnswer = '对话已被用户中断。';
      }
      this._cleanup();
      return {
        answer: finalAnswer,
        success: true,
        requiresConfirmation: false,
        shouldStopSession: false,
      };
    }
    finalAnswer = streamResult.fullResponse;

    // === Step 3b: 记录请求日志 & usage 回调（对齐 TG DialogueOrchestrator 行 241-248） ===
    this.sessionManager.addRequestLog(round + 1, currentRoundHistory, streamResult.fullResponse);
    if (streamResult.usage && onUsageUpdate) {
      onUsageUpdate(streamResult.usage);
    }

    // === Step 4: Token 超限检查（退出路径③）===
    if (streamResult.usage && streamResult.usage.total_tokens) {
      const { limited, warning } = checkContextLimit(
        streamResult.usage.total_tokens,
        DEFAULT_CONFIG.MAX_TOKENS
      );
      if (limited) {
        logger.warn(
          '上下文超限退出',
          { total_tokens: streamResult.usage.total_tokens, warning },
          { category: 'bot', component: 'AgenticLoop' }
        );
        this._cleanup();
        return {
          answer: `**上下文超限**: Token 用量 ${streamResult.usage.total_tokens}/${DEFAULT_CONFIG.MAX_TOKENS}，请清空会话后重试。`,
          success: true,
          requiresConfirmation: false,
          shouldStopSession: false,
        };
      }
      if (warning) {
        logger.info(
          'Token 用量接近上限',
          { total_tokens: streamResult.usage.total_tokens, warning },
          { category: 'bot', component: 'AgenticLoop' }
        );
        if (onTokenWarning) onTokenWarning(true);
      }
    }

    // === Step 5: 无 tool_call → 结束循环（退出路径⑦）===
    const toolCallDataList = streamResult.toolCalls;
    if (!toolCallDataList || toolCallDataList.length === 0) {
      this._cleanup();
      return {
        answer: finalAnswer,
        success: true,
        requiresConfirmation: false,
        shouldStopSession: false,
      };
    }

    // === Step 6: 解析 tool_calls 并串行执行（含 SSE 中断保护）===
    // [SSE 中断保护] 过滤参数不完整的 tool_call（TG DialogueOrchestrator.ts 行 280-316）
    // if-else 替代 continue 满足 eslint no-continue
    const skippedCalls = [];
    const validCalls = [];
    for (const tc of toolCallDataList) {
      const argsStr = tc.arguments;
      // 参数为空或非字符串 → SSE 中断导致参数不完整
      if (!argsStr || typeof argsStr !== 'string' || argsStr.trim() === '') {
        logger.warn(
          'SSE 中断导致 tool_call 参数不完整，跳过执行',
          { id: tc.id, name: tc.name },
          { category: 'bot', component: 'AgenticLoop' }
        );
        skippedCalls.push({
          toolCallId: tc.id,
          toolName: tc.name,
          result: { success: false, error: 'SSE 中断导致参数不完整' },
          originalArguments: undefined,
          timestamp: Date.now(),
        });
      } else {
        // JSON 解析失败 → 尝试 extractAllJsonObjects 恢复
        try {
          JSON.parse(argsStr);
          validCalls.push(tc);
        } catch (e) {
          // 防御性恢复：尝试从拼接的 JSON 字符串中提取有效对象
          const recovered = extractAllJsonObjects(argsStr);
          if (recovered.length === 1) {
            // 恢复成功，使用提取到的对象，参数用 JSON.stringify 还原回字符串
            logger.warn(
              'tool_call arguments 含额外字符，已提取有效 JSON',
              { id: tc.id, name: tc.name, originalLength: argsStr.length },
              { category: 'bot', component: 'AgenticLoop' }
            );
            tc.arguments = JSON.stringify(recovered[0]);
            validCalls.push(tc);
          } else if (recovered.length > 1) {
            // 多个拼接 JSON → 拆成独立 tool_call 逐个执行
            logger.warn(
              `检测到 ${recovered.length} 个拼接 JSON，拆分为独立 tool_call: ${tc.name}`,
              { id: tc.id, raw: argsStr.substring(0, 300) },
              { category: 'bot', component: 'AgenticLoop' }
            );
            recovered.forEach((obj, i) => {
              const syntheticTc = {
                ...tc,
                id: `${tc.id}_part${i + 1}`,
                arguments: JSON.stringify(obj),
              };
              validCalls.push(syntheticTc);
            });
          } else {
            logger.warn(
              'tool_call arguments JSON 解析失败，跳过执行',
              { id: tc.id, name: tc.name, raw: argsStr },
              { category: 'bot', component: 'AgenticLoop' }
            );
            skippedCalls.push({
              toolCallId: tc.id,
              toolName: tc.name,
              result: { success: false, error: 'JSON 解析失败' },
              originalArguments: undefined,
              timestamp: Date.now(),
            });
          }
        }
      }
    }

    const toolCalls = ToolCoordinator.extractToolCalls(validCalls);

    if (onToolCallStart) {
      for (const tc of toolCalls) onToolCallStart(tc.name);
    }

    // [C5] 串行执行工具（toolCoordinator 为 null 时跳过工具系统）
    const executedResults = this.toolCoordinator
      ? await this.toolCoordinator.executeSerial(toolCalls)
      : [];

    // 将被跳过的调用加入 executedResults，确保 C6 完整性
    const allResults = [...executedResults, ...skippedCalls];

    if (onToolCallEnd) {
      for (const er of allResults) onToolCallEnd(er.toolName, er.result);
    }

    // === Step 7: 检测是否需要 Pending（确认门禁）===
    let hasPending = false;
    for (const er of allResults) {
      if (er.result && er.result.requiresConfirmation) {
        hasPending = true;
        // 存入 PendingStore（单条目模式，为 null 时跳过）
        if (this.pendingStore) {
          this.pendingStore.set({
            toolName: er.toolName,
            originalArgs: er.result.originalArgs || {},
            pendingModification: er.result.pendingModification || {},
            originalResult: er.result,
            assistantMessageId: asstMsg.id,
            toolCallId: er.toolCallId,
            timestamp: Date.now(),
          });
        }
      }
    }

    if (hasPending) {
      this._cleanup();
      return {
        answer: finalAnswer,
        success: true,
        requiresConfirmation: true,
        shouldStopSession: false,
        round,
      };
    }

    // === Step 8: 检测 stop_session（退出路径⑥，对齐 TG DialogueOrchestrator）===
    for (const er of allResults) {
      if (er.toolName === 'stop_session') {
        shouldStop = true;
        break;
      }
    }

    if (shouldStop) {
      this._cleanup();
      return {
        answer: finalAnswer,
        success: true,
        requiresConfirmation: false,
        shouldStopSession: true,
        round,
      };
    }

    // === Step 9: 将查询类工具结果转换为 CSV（减少 Token）===
    for (const er of allResults) {
      if (er.result && er.result.success && er.result.data) {
        const csv = convertToCSVFormat(er.result);
        // 转换成功时返回字符串以"查询结果"开头，失败时返回 JSON.stringify
        if (csv.startsWith('查询结果')) {
          er.result = { ...er.result, data: csv };
        }
      }
    }

    // === Step 10: 原子写入 History（C7）===
    // [C10] batchSaveToolExchange 是写入 toolCalls 的唯一入口
    // 将 validCalls（原始格式 { id, name, arguments: string }）转为标准格式供 history 使用
    const historyToolCalls = validCalls.map((tc) => {
      let args = {};
      try {
        args = JSON.parse(tc.arguments);
      } catch (e) {
        args = {};
      }
      return { id: tc.id, name: tc.name, arguments: args };
    });
    try {
      this.sessionManager.batchSaveToolExchange(asstMsg.id, historyToolCalls, allResults);
    } catch (e) {
      // C6 验证失败，本轮结果丢失，退出循环
      this._cleanup();
      return {
        answer: `**数据一致性错误**: ${e.message}`,
        success: true,
        requiresConfirmation: false,
        shouldStopSession: false,
      };
    }

    // === Step 10: 更新历史供下一轮使用 ===
    const nextHistory = this.sessionManager.toOpenAIHistory();

    // 标记达到轮次上限 — 下一轮 LLM 继续分析工具结果
    if (round >= DEFAULT_CONFIG.MAX_TOOL_CALL_ROUNDS) {
      needsFollowUp = true;
    }

    // 递归进入下一轮
    return this._runRound(
      round + 1,
      {
        currentRoundHistory: nextHistory,
        finalAnswer,
        shouldStop,
        needsFollowUp,
      },
      params
    );
  }

  /**
   * 恢复会话（用户确认确认弹窗后继续 AI 循环）
   *
   * 从 session 恢复对话继续多轮循环
   * 1. 从 sessionManager 取最后一条 user 消息作为 question
   * 2. 读取当前最新脚本内容
   * 3. 使用 handleUserMessage 阶段保存的上下文重新调用 _runSession
   *
   * @param {Object} [options]
   * @param {Function} [options.onUpdate] - 覆盖 handleUserMessage 时注册的 onUpdate
   * @param {Function} [options.onToolCallStart]
   * @param {Function} [options.onToolCallEnd]
   * @returns {Promise<{ answer: string, success: boolean, requiresConfirmation: boolean, shouldStopSession: boolean }>}
   */
  async resumeSession({ onUpdate, onToolCallStart, onToolCallEnd } = {}) {
    if (this._isProcessing) {
      return { answer: '', success: false, requiresConfirmation: false, shouldStopSession: false };
    }

    // 1. 从 session 获取最后一条 user 消息
    const messages = this.sessionManager.getMessages();
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const question = lastUserMessage?.content || '';

    if (!question) {
      logger.warn(
        'resumeSession: 未找到上一条用户消息，跳过重试',
        {},
        { category: 'bot', component: 'AgenticLoop' }
      );
      return { answer: '', success: false, requiresConfirmation: false, shouldStopSession: false };
    }

    // 2. 读取最新脚本内容，并更新工具运行时上下文
    const scriptContent = this._lastScriptCodeDs?.current?.get('script') || '';
    toolContext.setScriptContent(scriptContent);
    toolContext.setScriptCodeDs(this._lastScriptCodeDs);

    // 3. 获取工具定义（不过滤）
    let toolDefinitions = this.toolRegistry ? this.toolRegistry.getAllToolDefinitions() : [];

    // 复用 handleUserMessage 阶段保存的工具过滤
    if (this._lastEnabledToolNames && toolDefinitions.length > 0) {
      toolDefinitions = toolDefinitions.filter((def) =>
        this._lastEnabledToolNames.includes(def.name)
      );
    }

    this._isProcessing = true;
    this._startTime = Date.now();

    try {
      // 4. 使用最近上下文刷新 scriptContent
      const fullContext = { ...this._lastContext, scriptContent };

      // 5. 合并回调，外部传入优先于存储的
      const callbacks = {
        onUpdate: onUpdate || this._lastCallbacks.onUpdate,
        onToolCallStart: onToolCallStart || this._lastCallbacks.onToolCallStart,
        onToolCallEnd: onToolCallEnd || this._lastCallbacks.onToolCallEnd,
        onRoundChange: this._lastCallbacks.onRoundChange,
        onTokenWarning: this._lastCallbacks.onTokenWarning,
      };

      // 6. 重新进入 AI 循环
      const result = await this._runSession({
        question,
        scriptContent,
        context: fullContext,
        toolDefinitions,
        modelProvider: this._lastModelProvider,
        onUpdate: callbacks.onUpdate,
        onToolCallStart: callbacks.onToolCallStart,
        onToolCallEnd: callbacks.onToolCallEnd,
        onRoundChange: callbacks.onRoundChange,
      });

      return result;
    } catch (e) {
      logger.error('resumeSession 异常', e, { category: 'bot', component: 'AgenticLoop' });
      return { answer: '', success: false, requiresConfirmation: false, shouldStopSession: false };
    } finally {
      this._isProcessing = false;
    }
  }

  /**
   * 停止当前处理
   */
  stop() {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    this._isProcessing = false;
  }

  /** 清理状态 */
  _cleanup() {
    this._abortController = null;
    this._isProcessing = false;
  }

  /** @returns {boolean} */
  get isProcessing() {
    return this._isProcessing;
  }
}

export default AgenticLoop;
