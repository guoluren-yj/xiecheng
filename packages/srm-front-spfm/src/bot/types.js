/**
 * 盘古 Bot 核心类型定义
 *
 * 所有类型均用 JSDoc @typedef 定义，遵循 srm-front-spfm JavaScript 代码规范。
 * Phase 2 升级：新增工具系统类型、宪法约束类型、确认合约类型。
 *
 * @date: 2026-06-12
 */

/**
 * @typedef {'user'|'assistant'|'system'|'tool'} ChatRole
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - 消息唯一标识
 * @property {ChatRole} role - 消息角色
 * @property {string} content - 消息文本内容
 * @property {number} timestamp - 创建时间戳
 * @property {ToolCall[]} [toolCalls] - assistant 消息的工具调用列表
 * @property {string} [toolCallId] - tool 消息对应的工具调用 ID
 * @property {string} [toolName] - tool 消息对应的工具名
 * @property {boolean} [locked] - [C3] 消息是否已锁定（不可修改）
 * @property {number} [updatedAt] - 流式更新时间戳
 * @property {ToolResultMeta} [toolResultMeta] - 工具执行结果元数据
 */

/**
 * @typedef {Object} ToolCall
 * @property {string} id - 工具调用 ID（如 "call_abc123"）
 * @property {string} name - 工具名称
 * @property {Object} arguments - 工具调用参数对象
 */

/**
 * @typedef {'query'|'action'|'analysis'} ToolType
 */

/**
 * @typedef {Object} ToolResultMeta
 * @property {string} [summary] - UI 展示摘要
 * @property {Object} [displayData] - UI 展示数据
 * @property {number} [maxResultSize] - 最大结果大小
 */

/**
 * @typedef {Object} BotSession
 * @property {string} id - 会话 ID
 * @property {ChatMessage[]} messages - 会话消息列表
 * @property {number} createdAt - 创建时间戳
 * @property {number} [updatedAt] - 最后更新时间戳
 * @property {number} round - 当前工具调用轮次
 * @property {Array} [requestLogs] - 请求日志（诊断用，对齐 TG）
 * @property {Object} [lastDebugChunk] - 最后一条后端 SSE debug 数据块（诊断用，对齐 TG）
 */

/**
 * @typedef {Object} StreamResult
 * @property {string} fullResponse - 完整的 AI 响应文本
 * @property {ToolCallData[]} toolCalls - AI 请求的工具调用列表
 * @property {boolean} requiresConfirmation - 是否需要用户确认
 * @property {Object} [usage] - Token 用量统计
 * @property {number} [usage.completion_tokens]
 * @property {number} [usage.prompt_tokens]
 * @property {number} [usage.total_tokens]
 * @property {Object[]} [debugChunks] - 调试数据块
 */

/**
 * @typedef {Object} ToolCallData
 * @property {string} id - OpenAI 格式工具调用 ID
 * @property {string} name - 函数名
 * @property {string} arguments - JSON 字符串，需二次 parse
 */

/**
 * @typedef {Object} PendingItem
 * @property {string} toolName - 工具名称
 * @property {Object} originalArgs - 原始调用参数
 * @property {Object} pendingModification - 待确认的修改内容
 * @property {string} assistantMessageId - 对应的 assistant 消息 ID
 * @property {Object} [toolCallId] - 工具调用 ID
 * @property {Object} [originalResult] - 原始执行结果
 * @property {number} timestamp - 创建时间戳
 */

// ==================== 工具系统类型 ====================

/**
 * @typedef {Object} ToolDefinitionMetadata
 * @property {string} name - 工具名
 * @property {ToolType} type - 工具类型
 * @property {string} description - 做什么
 * @property {string} purpose - 什么场景用
 * @property {string} usage - 怎么用
 * @property {string} [notes] - 注意事项
 * @property {boolean} isIdempotent - 是否幂等
 * @property {ParameterDefinition[]} parameters - 参数 Schema
 */

/**
 * @typedef {Object} ParameterDefinition
 * @property {string} name - 参数名
 * @property {string} type - 参数类型（string, number, boolean, object, array）
 * @property {string} description - 参数描述
 * @property {boolean} [required] - 是否必填
 * @property {*} [default] - 默认值
 * @property {string[]} [enum] - 枚举值列表
 * @property {Object} [items] - type=array 时，数组元素的 JSON Schema
 */

/**
 * @typedef {Object} ToolPresenter
 * @property {Function} [summarize] - (result) => string UI 摘要
 * @property {Function} [display] - (result) => Object UI 展示数据
 * @property {Function} [forHistory] - (result) => mixed 写入 History 的精简版
 * @property {number} [maxResultSize] - 最大结果大小
 */

/**
 * @typedef {Object} Tool
 * @property {string} name - 工具名
 * @property {ToolType} type - 工具类型
 * @property {string} description - OpenAI 格式描述（自动构建）
 * @property {Function} execute - (args) => Promise<{success, data, error}>
 * @property {Function} getDefinition - () => OpenAI function schema
 * @property {Function} [getPresenter] - () => ToolPresenter|undefined
 * @property {boolean} [isIdempotent]
 * @property {string} [usage]
 * @property {string} [purpose]
 */

/**
 * @typedef {Object} ToolExecutionRequest
 * @property {string} toolName
 * @property {Object} arguments
 * @property {string} [sessionId]
 * @property {number} [timestamp]
 */

/**
 * @typedef {Object} ToolExecutionResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [error]
 * @property {boolean} [requiresConfirmation]
 * @property {string} [toolName]
 * @property {Object} [originalArgs]
 */

/**
 * @typedef {Object} ToolRegistry
 * @property {Function} hasTool - (name: string) => boolean
 * @property {Function} getTool - (name: string) => Tool|undefined
 * @property {Function} executeTool - (request: ToolExecutionRequest) => Promise<ToolExecutionResponse>
 * @property {Function} executeTools - (requests: ToolExecutionRequest[]) => Promise<ToolExecutionResponse[]>
 * @property {Function} getAllToolDefinitions - () => Object[]
 * @property {Function} getToolCount - () => number
 * @property {Function} getToolPresenter - (name: string) => ToolPresenter|undefined
 */

// ==================== 确认合约类型 ====================

/**
 * @typedef {Object} ConfirmContext
 * @property {PendingItem} pendingItem
 * @property {import('./orchestration/BotSessionManager').default} sessionManager
 * @property {import('./orchestration/PendingStore').default} pendingStore
 * @property {Object} [extra]
 */

/**
 * @typedef {Object} CancelContext
 * @property {PendingItem} pendingItem
 * @property {import('./orchestration/BotSessionManager').default} sessionManager
 * @property {import('./orchestration/PendingStore').default} pendingStore
 */

/**
 * @typedef {Object} ConfirmationResult
 * @property {boolean} success
 * @property {string} [error]
 * @property {Object} [data]
 * @property {*} [forHistory] - 写入 History 的简化结果
 */

/**
 * @typedef {Object} ConfirmationContract
 * @property {string} toolName
 * @property {Function} onConfirm - (ctx: ConfirmContext) => Promise<ConfirmationResult>
 * @property {Function} onCancel - (ctx: CancelContext) => ConfirmationResult
 */

// ==================== 上下文类型 ====================

/**
 * @typedef {Object} PanguContext
 * @property {string} scriptContent - 脚本内容
 * @property {number} scriptLines - 脚本行数
 * @property {string} userId - 用户 ID
 * @property {string} userName - 用户名称
 * @property {string} tenantCode - 租户编码
 * @property {string} locale - 语言
 * @property {*} [testInput] - 测试入参
 * @property {*} [lastOutput] - 最近执行输出
 * @property {string} [lastLog] - 最近执行日志
 */

// ==================== 常量 ====================

/** 工具名称常量（snake_case） */
const TOOL_NAMES = Object.freeze({
  // LLM 可见的顶层工具（5 个）
  QUERY_CALL: 'query_call',
  SCRIPT_MODIFY: 'modify_script',
  SCRIPT_EXECUTE: 'execute_script',
  REASONING_ACTION: 'reasoning_action',
  STOP_SESSION: 'stop_session',

  // queryCall 内部 dispatch 的子工具（7 个，LLM 不可见）
  // ❌ objectQuery / helpDocQuery / businessDataQuery / metadataQuery — 后续实现（2026-07-06）
  OBJECT_QUERY: 'query_object',
  DOC_QUERY: 'query_document',
  HELP_DOC_QUERY: 'query_help_doc',
  SCRIPT_QUERY: 'query_script',
  BUSINESS_DATA_QUERY: 'query_runtime_data',
  METADATA_QUERY: 'query_metadata',
  CONFIG_QUERY: 'query_config',
});

/** 默认配置常量 */
const DEFAULT_CONFIG = Object.freeze({
  SESSION_ID: 'bot-session-1',
  MAX_MESSAGES: 100,
  MAX_TOKENS: 131072,
  WARNING_THRESHOLD: 115000,
  TOKEN_ESTIMATE_RATIO: 2.5,
  RESERVED_TOKENS: 4096,
  MAX_TOOL_CALL_ROUNDS: 30,
  TOOL_CALL_TIMEOUT_MS: 300000,
  STREAM_TIMEOUT_MS: 120000,
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  MAX_DELAY: 10000,
});

export { TOOL_NAMES, DEFAULT_CONFIG };
