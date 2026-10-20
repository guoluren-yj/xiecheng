/**
 * botService - 盘古 Bot API 调用层
 *
 * 两种模式：
 *   1) MOCK 模式（默认）：前端模拟 SSE 流式响应，用于开发调试
 *   2) REAL 模式：直接调用后端 SSE 端点 POST /v1/bot/chat/stream
 *
 * 切换方式：将 USE_MOCK 改为 false，并确保后端端点就绪。
 * SSE 流式对话使用 fetch（需要 response.body.getReader() 读取流），
 * 符合盘古前端技术栈：SSE 场景无法用 utils/request 替代。
 *
 * 认证方式（双层认证）：
 *   - 网关层：Authorization: bearer <token>（从 Cookie access_token 读取，OAuth2 网关鉴权）
 *   - AI 层：X-API-Key header（从用户模型配置 localStorage 读取）
 *   - 模型路由：X-Model-Provider header，默认 deepseek
 *   - API_HOST 从 `window.$$env.API_HOST` 读取
 *   - credentials: 'include' 确保 Cookie 随请求发送
 *   - 请求体为纯 JSON；如加密开关开启，对敏感字段做 Base64(UTF-16) 编码
 *
 * @date: 2026-06-17
 */

import Cookies from 'universal-cookie';
import crypto from 'crypto-js';
import logger from './utils/logger';
import { loadModelConfig } from './orchestration/ModelProvider';
import { withRetry } from './orchestration/errorHandler';
import { errorUtils } from './utils/uiUtils';

// ===================================================================
// 模式开关
// ===================================================================
// 后端 SSE 端点就绪后用 false；true 时走前端 Mock。
const USE_MOCK = false;
// 请求体加密开关：未来后端要求加密时改为 true，默认关闭。
const ENABLE_REQUEST_ENCRYPTION = false;

// ===================================================================
// 网络工具
// ===================================================================

/** 从 Cookie 读取 access_token（srm-gateway OAuth2 网关鉴权） */
function getAccessToken() {
  try {
    const cookies = new Cookies();
    return cookies.get('access_token', { path: '/' });
  } catch (e) {
    return null;
  }
}

/** 获取 API_HOST 网关地址 */
function getApiHost() {
  if (typeof window !== 'undefined' && window.$$env && window.$$env.API_HOST) {
    return window.$$env.API_HOST;
  }
  return '';
}

/**
 * 获取当前供应商的 API Key
 *
 * 从用户模型配置（localStorage）读取，用户通过 BotTopControls 配置弹窗设置。
 *
 * @returns {string} API Key，未配置时返回空字符串
 */
const getApiKey = () => {
  try {
    const modelConfig = loadModelConfig();
    if (modelConfig && modelConfig.keys && modelConfig.provider) {
      return modelConfig.keys[modelConfig.provider] || '';
    }
  } catch (e) {
    logger.warn('读取 API Key 失败', e, { category: 'bot', component: 'BotService' });
  }
  return '';
};

/**
 * 构建完整的请求 URL（非 http 开头的路径，拼接 API_HOST）
 * @param {string} url
 * @returns {string}
 */
function buildRequestUrl(url) {
  if (url.startsWith('http')) return url;
  const host = getApiHost();
  return host ? `${host}${url}` : url;
}

/**
 * SSE fetch 包装（使用 errorHandler.withRetry 统一重试）
 *
 * 仅对 network/timeout 类错误重试，
 * 不对 HTTP 4xx/5xx 重试（那些是业务错误）。
 *
 * @param {string} url
 * @param {Object} options - fetch 选项
 * @param {number} [maxRetries=2]
 * @returns {Promise<Response>}
 */
async function sseFetch(url, options, maxRetries = 2) {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      return response;
    },
    { maxRetries, baseDelay: 1000, maxDelay: 10000 },
    { component: 'BotService', action: 'sseFetch' }
  );
}

// ===================================================================
// Mock 数据
// ===================================================================

/**
 * 根据用户问题选择最佳匹配的 mock 回复
 * @param {string} question
 * @returns {string}
 */
function selectMockReply(question) {
  const q = question.toLowerCase();

  if (q.includes('你好') || q.includes('hello') || q.includes('hi') || q.includes('help')) {
    return `你好！我是**Bot**，你的 Marmot 脚本编程助手 🤖

目前已具备以下能力：

1. **脚本修改** — 完整替换或局部修改脚本内容
2. **脚本执行** — 调试执行脚本并返回结果
3. **知识查询** — 查询业务对象、埋点钩子、插件文档
4. **推理分析** — 分析需求并给出结构化方案
5. **入参修改** — 更新脚本测试输入数据

> ⚠️ 当前为 Mock 模式，实际 AI 回复需要后端 SSE 端点就绪后切换。

请问有什么可以帮助你的？`;
  }

  if (q.includes('脚本') || q.includes('script') || q.includes('代码')) {
    return `好的，我来帮你处理 Marmot 脚本相关的问题。

## Marmot 脚本类型

| 类型 | 用途 | 执行环境 |
|------|------|---------|
| **ADAPTOR** | 埋点钩子脚本 | srm-adaptor 服务端 |
| **SCRIPT_LIB** | 公共函数库 | 被其他脚本引用 |
| **REL_ACTION** | RelTable 触发器 | srm-adaptor 事务内 |

你可以告诉我具体需要什么类型的脚本。

> ⚠️ 当前 Mock 模式下仅返回预设文本。真实的脚本生成和分析需要接入后端 AI。`;
  }

  if (q.includes('钩子') || q.includes('hook') || q.includes('埋点')) {
    return `## 埋点钩子查询结果

盘古系统共有 **1302 个埋点钩子**（数据来源：\`hook-catalog.json\`）。

### 按领域分布

| 领域 | 钩子数量 | 主要服务 |
|------|:--------:|----------|
| **供应商管理** | 569 | srm-supplier |
| **采购协同** | 289 | srm-purchase-cooperation |
| **商城** | 104 | srm-mall, small-order |
| **基础平台** | 41 | srm-basic-platform, srm-platform |
| **物料/主数据** | 37 | srm-mdm, srm-industry-extension |
| **寻源/招投标** | 34 | srm-prm |
| **接口/集成** | 27 | srm-interface |
| **认证/OAUTH** | 17 | srm-iam |
| **价格中心** | 16 | srm-price-center |
| **客户定制** | 14 | srm-saas-cux |
| **合同管理** | 10 | srm-purchase-contract-manage |
| **适配器/配置** | 10 | srm-advancedsearch |
| **财务/结算** | 8 | srm-budget, srm-finance |
| **消息/工作流** | 6 | srm-workflow |
| **质量管理** | 6 | srm-qam |

> ⚠️ 当前 Mock 模式仅展示统计数据。真实的钩子查询需要接入后端 AI。

需要查询特定领域的钩子吗？`;
  }

  if (q.includes('业务对象') || q.includes('bo') || q.includes('object') || q.includes('实体')) {
    return `## 业务对象查询结果

盘古 SRM Modeler 系统共有 **37 个业务对象实体**（数据来源：\`business-object-registry.json\`）。

### 实体类型

| 分类 | 数量 | 示例 |
|------|:----:|------|
| **业务对象定义** | 6 | BusinessObject, BusinessObjectField, BusinessObjectRelation |
| **导入模板** | 5 | BusinessObjectImportTemplate, BusinessObjectImportTemplateSheet/Column |
| **导出模板** | 4 | BusinessObjectExportTemplate, BusinessObjectExportTemplateColumn |
| **继承** | 4 | BusinessObjectInherit, BusinessObjectInheritField |
| **选项/校验** | 6 | BusinessObjectOption, BusinessObjectValidateRule, BusinessObjectValidRuleField |
| **关联** | 4 | BusinessObjectAssociate, BusinessObjectAssociateField |
| **数据源/表** | 4 | DataSource, TableIndex, TableColumn, TableAssign |
| **其他** | 4 | Domain, FieldRefRecord, ServiceAssign, BusinessObjectUserExportTemplate |

> ⚠️ 当前 Mock 模式仅展示统计数据。真实的业务对象查询需要接入后端 AI。

需要了解某个具体实体的字段定义吗？`;
  }

  if (q.includes('缓存') || q.includes('cache') || q.includes('redis')) {
    return `## HumphreyCache 两级缓存体系

盘古使用 HumphreyCache 作为缓存解决方案，采用**本地 + Redis 两级缓存**架构。

### 缓存层级

| 层级 | 存储 | 速度 | 容量 |
|------|------|------|------|
| **L1** | Caffeine（本地内存） | 纳秒级 | 单机有限 |
| **L2** | Redis（分布式） | 毫秒级 | 集群共享 |

### 缓存陷阱

使用缓存时需注意：

1. **缓存穿透** — 查询不存在的数据，解决方案：布隆过滤器 + 缓存空值
2. **缓存击穿** — 热点 key 过期，解决方案：互斥锁重建
3. **缓存雪崩** — 大量 key 同时过期，解决方案：过期时间加随机值
4. **数据一致性** — 缓存与数据库不一致，解决方案：先更新 DB → 再删除缓存

需要更详细的缓存策略说明吗？`;
  }

  // 默认兜底回复
  return `收到你的问题：**${question}**

> ⚠️ 当前为 Mock 模式，仅返回预设回复。后端 SSE 端点就绪后将切换到真实 AI 回复。
>
> 已完成的 Phase：
> - ✅ Phase 1: 脚手架 + 最小页面
> - ✅ Phase 2: 工具系统 + 宪法约束 + 请求构建
> - ✅ Phase 3: Markdown 渲染 + 确认弹窗 + Diff + 工具开关
> - ✅ Phase 4: 代码高亮 + snippet_replace + 工具库 + UI 精细化

请尝试输入"你好"、"脚本"、"钩子"等关键词查看预设回复。`;
}

// ===================================================================
// Mock 流式引擎
// ===================================================================

/**
 * 模拟 SSE 流式回复 —— 将完整文本按字符逐个推送，制造流式效果
 *
 * @param {string} fullText - 完整回复文本
 * @param {Object} callbacks
 * @param {Function} callbacks.onContent - (content: string) => void
 * @param {Function} callbacks.onUsage - (usage: Object) => void
 * @param {Function} callbacks.onDone - () => void
 * @param {AbortSignal} [callbacks.signal] - 取消信号
 * @returns {Promise<void>}
 */
function mockStreamResponse(fullText, { onContent, onUsage, onDone, signal }) {
  return new Promise((resolve) => {
    if (signal && signal.aborted) {
      onDone();
      resolve();
      return;
    }

    let index = 0;
    let accumulated = '';
    // 每批推送的字符数（模拟流式效果）
    const CHUNK_SIZE = 3;
    // 每批间隔（毫秒）
    const INTERVAL_MS = 30;

    // 注册 abort 监听
    const abortHandler = () => {
      clearInterval(timer);
      onDone();
      resolve();
    };
    if (signal) {
      signal.addEventListener('abort', abortHandler, { once: true });
    }

    const timer = setInterval(() => {
      if (signal && signal.aborted) {
        clearInterval(timer);
        if (signal) signal.removeEventListener('abort', abortHandler);
        onDone();
        resolve();
        return;
      }

      if (index >= fullText.length) {
        clearInterval(timer);
        if (signal) signal.removeEventListener('abort', abortHandler);
        // 推送 usage 信息
        if (onUsage) {
          onUsage({
            prompt_tokens: Math.round(fullText.length * 1.5),
            completion_tokens: fullText.length,
            total_tokens: Math.round(fullText.length * 2.5),
          });
        }
        onDone();
        resolve();
        return;
      }

      const chunk = fullText.slice(index, index + CHUNK_SIZE);
      index += CHUNK_SIZE;
      accumulated += chunk;
      onContent(accumulated);
    }, INTERVAL_MS);
  });
}

// ===================================================================
// 公共 API
// ===================================================================

/**
 * 调用 AI SSE 流式对话端点
 *
 * 在 MOCK 模式下，模拟 SSE 流式回复，不调用后端。
 * 在 REAL 模式下，通过 fetch 调用 POST /v1/bot/chat/stream。
 *
 * @param {Object} params
 * @param {string} params.question - 用户问题
 * @param {string} [params.script] - 当前编辑器脚本内容
 * @param {Object} [params.modelProviderConfig] - 模型提供方配置（{ providerCode }）
 * @param {Array} [params.conversationHistory] - 对话历史（OpenAI 格式）
 * @param {Object} callbacks - 回调对象
 * @param {Function} callbacks.onContent - (content: string) => void 文本片段回调
 * @param {Function} callbacks.onToolCall - (toolCall: Object) => void 工具调用回调
 * @param {Function} callbacks.onUsage - (usage: Object) => void token 用量回调
 * @param {Function} callbacks.onError - (error: string) => void 错误回调
 * @param {Function} callbacks.onDone - () => void 流结束回调
 * @param {Function} [callbacks.onSessionTitle] - (title: string) => void 会话标题回调（对齐 TG AIStreamProcessor session_title 事件）
 * @param {Function} [callbacks.onDebug] - (chunk: Object) => void 诊断数据回调（对齐 TG AIStreamProcessor debug 事件）
 * @param {AbortSignal} [callbacks.signal] - 取消信号
 * @returns {Promise<void>}
 */
export async function callAiStream(
  {
    question,
    script = '',
    modelProviderConfig,
    conversationHistory = [],
    tools = [],
    contextSummary = {},
  },
  { onContent, onToolCall, onUsage, onError, onDone, signal }
) {
  if (USE_MOCK) {
    // ======================== MOCK 模式 ========================
    const reply = selectMockReply(question);
    await mockStreamResponse(reply, { onContent, onUsage, onDone, signal });
    return;
  }

  // ======================== REAL 模式 ========================
  // 请求体（纯 JSON；加密开关开启时对敏感字段编码）
  const rawBody = {
    question,
    script,
    conversationHistory,
    tools,
    contextSummary,
  };
  const body = ENABLE_REQUEST_ENCRYPTION ? encryptRequestBody(rawBody) : rawBody;

  // 从用户模型配置（localStorage）读取当前供应商的 API Key
  const apiKey = getApiKey();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
  };
  // 网关层 OAuth2 鉴权（从 Cookie access_token 读取，srm-gateway 要求）
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }
  // AI 层认证（X-API-Key，从用户模型配置读取）
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  // X-Model-Provider header
  if (modelProviderConfig?.providerCode) {
    headers['X-Model-Provider'] = modelProviderConfig.providerCode;
  }

  /**
   * 处理 tool_call delta（合并相同 ID 的多次 delta）
   * 声明在 try 块外避免 ESLint no-inner-declarations 违规
   */
  const handleToolCallDelta = (tc, tcm, onToolCallCb) => {
    // 后端实际格式: { id, type, name, arguments }
    const name = tc.name || '';
    const args = tc.arguments || '';
    const existing = tcm.get(tc.id);
    if (!existing) {
      tcm.set(tc.id, {
        id: tc.id,
        name,
        arguments: args,
      });
    } else {
      if (args) existing.arguments += args;
      if (name) existing.name = name;
    }
    if (tc.id) {
      onToolCallCb({ id: tc.id, name, arguments: args });
    }
  };

  try {
    const url = buildRequestUrl('/sada/v1/bot/chat/stream');
    const response = await sseFetch(
      url,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
        signal,
      },
      2
    );

    if (!response.ok) {
      const httpError = new Error(`HTTP error! status: ${response.status}`);
      const userMsg = errorUtils.handleStreamError(httpError);
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        /* ignore */
      }
      const fullMsg = errorBody ? `${userMsg} (${response.status})` : userMsg;
      logger.warn(
        'SSE HTTP 错误',
        { status: response.status, body: errorBody },
        { category: 'bot', component: 'BotService' }
      );
      onError(fullMsg);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';
    /** @type {Map<string, Object>} */
    const toolCallMap = new Map();

    const processEvent = (dataStr) => {
      // [DONE] 信号
      if (dataStr.trim() === '[DONE]') {
        onDone();
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(dataStr);
      } catch (e) {
        // 尝试提取 JSON 对象
        const extracted = extractAllJsonObjects(dataStr);
        if (extracted.length > 0) {
          [parsed] = extracted;
        } else {
          return;
        }
      }

      if (!parsed) return;

      // ==================== 事件分派优先级（支持 OpenAI 和 PG 两种格式）====================

      // ① 优先检测 type 字段（PG 格式：{"type":"content|tool_call|usage|error|done", ...}）
      if (parsed.type) {
        switch (parsed.type) {
          // 后端实际格式: {"type":"content","content":"文本"}
          case 'content': {
            if (parsed.content) {
              fullResponse += parsed.content;
              onContent(fullResponse);
            }
            return;
          }

          // 后端实际格式: {"type":"tool_call","toolCallData":{"tool_calls":[...]}}
          case 'tool_call': {
            const tcs = parsed.toolCallData?.tool_calls;
            if (Array.isArray(tcs)) {
              for (const tc of tcs) {
                handleToolCallDelta(tc, toolCallMap, onToolCall);
              }
            }
            return;
          }

          // 后端实际格式: {"type":"usage","usage":{...}}
          case 'usage': {
            if (onUsage && parsed.usage) {
              onUsage(parsed.usage);
            }
            return;
          }

          // 后端实际格式: {"type":"error","error":"消息","message":null,...}
          case 'error': {
            onError(parsed.error || parsed.message || '未知 SSE 错误');
            return;
          }

          // debug / session_title（忽略）
          case 'debug':
          case 'session_title':
            return;

          // done
          case 'done': {
            onDone();
            return;
          }

          default: {
            return null;
          }
        }
      }

      // ② OpenAI choices[0].delta 格式（兼容 OpenAI Chat Completions 格式）
      const { choices } = parsed;
      if (choices && Array.isArray(choices) && choices[0]) {
        const [firstChoice] = choices;
        const { delta = {}, finish_reason: finishReason } = firstChoice;

        if (delta.content !== undefined) {
          fullResponse += delta.content;
          onContent(fullResponse);
          return;
        }

        if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            handleToolCallDelta(tc, toolCallMap, onToolCall);
          }
          return;
        }

        if (finishReason === 'stop' || finishReason === 'tool_calls') {
          onDone();
        }
      }
    };

    /** SSE 单次读取超时（120s） */
    const PER_READ_TIMEOUT_MS = 120000;

    const pump = () => {
      // Promise.race 实现 per-read 超时，避免 SSE 卡死
      const readPromise = reader.read().then(({ done, value }) => {
        if (done) {
          // 处理 buffer 残留
          if (buffer.trim()) {
            processEvent(buffer.trim());
          } else if (fullResponse) {
            onDone();
          }
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        // 按 \n\n 切分 SSE 事件块
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed) {
            // skip empty blocks
          } else {
            // 拼合所有 data: / message 行（兼容两种 SSE 前缀格式）
            const eventLines = trimmed
              .split('\n')
              .filter((line) => line.startsWith('data:') || line.startsWith('message'))
              .map((line) => {
                if (line.startsWith('data:')) return line.slice(5).trim();
                if (line.startsWith('message')) return line.slice(7).trim();
                return line.trim();
              });

            if (eventLines.length > 0) {
              const dataStr = eventLines.join('');
              processEvent(dataStr);
            }
          }
        }

        pump();
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SSE 读取超时')), PER_READ_TIMEOUT_MS);
      });

      Promise.race([readPromise, timeoutPromise]).catch((err) => {
        if (err.name === 'AbortError') {
          onDone();
        } else if (err.message === 'SSE 读取超时') {
          logger.warn(
            'SSE per-read 超时，继续读取',
            {},
            { category: 'bot', component: 'BotService' }
          );
          pump(); // 超时不中断，继续读取下一块
        } else {
          onError(`流读取错误: ${err.message}`);
        }
      });
    };

    pump();
  } catch (err) {
    if (err.name === 'AbortError') {
      onDone();
    } else {
      onError(`网络错误: ${err.message}`);
    }
  }
}

/**
 * 从拼接的字符串中提取所有完整的 JSON 对象（用于 SSE 断裂恢复）
 *
 * 通过括号平衡扫描拆分出每个完整的 {..} 并解析，比正则更健壮：
 * - 正确处理字符串内的 { }（不会误截断）
 * - 正确处理转义字符
 * - 支持任意深度嵌套
 * - 返回解析成功的对象数组（空数组表示无法恢复）
 *
 * @param {string} text
 * @returns {Object[]}
 */
export function extractAllJsonObjects(text) {
  const results = [];
  let pos = 0;

  while (pos < text.length) {
    const start = text.indexOf('{', pos);
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escapeNext) {
        escapeNext = false;
      } else if (ch === '\\') {
        escapeNext = true;
      } else if (ch === '"') {
        inString = !inString;
      } else if (!inString) {
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            const fragment = text.substring(start, i + 1);
            try {
              results.push(JSON.parse(fragment));
            } catch (e) {
              // 跳过损坏的片段，继续扫描
            }
            pos = i + 1;
            break;
          }
        }
      }
    }

    if (depth !== 0) break; // 括号不平衡，停止扫描
  }

  return results;
}

/**
 * 对请求体中的敏感字段进行 Base64(UTF-16) 编码
 *
 * 由 ENABLE_REQUEST_ENCRYPTION 开关控制，默认关闭。
 * 当前后端接口接受纯 JSON，此函数保留供未来加密需求使用。
 *
 * @param {Object} body - 原始请求体
 * @returns {Object} 加密后的请求体副本
 */
function encryptRequestBody(body) {
  const encrypted = { ...body };

  const encode = (/** @type {string} */ text) =>
    crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(text));

  try {
    // 1. 加密 script
    if (encrypted.script && typeof encrypted.script === 'string') {
      encrypted.script = encode(encrypted.script);
    }

    // 2. 加密 question
    if (encrypted.question && typeof encrypted.question === 'string') {
      encrypted.question = encode(encrypted.question);
    }

    // 3. 加密 conversationHistory 中的消息内容
    if (encrypted.conversationHistory && Array.isArray(encrypted.conversationHistory)) {
      encrypted.conversationHistory = encrypted.conversationHistory.map((
        /** @type {Object} */ msg
      ) => {
        const em = { ...msg };
        if (em.content && typeof em.content === 'string' && em.content.trim().length > 0) {
          em.content = encode(em.content);
        }
        if (em.tool_calls && Array.isArray(em.tool_calls)) {
          em.tool_calls = em.tool_calls.map((/** @type {Object} */ tc) => {
            const etc = { ...tc };
            if (etc.function) {
              const ef = { ...etc.function };
              if (ef.arguments && typeof ef.arguments === 'string') {
                ef.arguments = encode(ef.arguments);
              }
              etc.function = ef;
            }
            return etc;
          });
        }
        return em;
      });
    }
  } catch (e) {
    // 加密失败时不阻断请求，使用原始 body
    logger.warn('请求体加密失败，使用原始 body', e, { category: 'bot', component: 'BotService' });
  }

  return encrypted;
}
