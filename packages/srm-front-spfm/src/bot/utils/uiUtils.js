/**
 * uiUtils — UI 相关工具函数
 *
 * 包含消息格式化、状态管理、错误处理等 UI 相关静态处理逻辑。
 * Phase 4 移植自 TG uiUtils.ts，仅移植 PG 当前缺失且直接需要的部分。
 *
 * 已存在的模块不做重复移植：
 *   - errorHandler.js 已有：classifyError, withRetry, safeExecute, handleToolError
 *   - 不与上述模块重叠
 *
 * @date: 2026-06-15
 */

import logger from './logger';
import { getToolDisplayName } from './toolDisplayUtils';

// ==================== 消息格式化工具 ====================

export const messageUtils = {
  /**
   * 格式化消息角色显示
   *
   * @param {string} role - 消息角色
   * @returns {string} 中文角色名
   */
  formatRoleDisplay(role) {
    switch (role) {
      case 'user':
        return '您';
      case 'system':
        return '系统';
      case 'assistant':
        return 'Bot';
      case 'tool':
        return '工具';
      default:
        return role;
    }
  },

  /**
   * 格式化消息时间
   *
   * @param {number|string|Date} timestamp - 时间戳
   * @returns {string} 格式化的时间字符串
   */
  formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  },

  /**
   * 格式化消息内容（截断过长内容）
   *
   * @param {string} content - 消息内容
   * @param {number} [maxLength=1000] - 最大长度
   * @returns {string}
   */
  formatMessageContent(content, maxLength = 1000) {
    if (!content) return '';
    if (content.length > maxLength) {
      return `${content.substring(0, maxLength)}...`;
    }
    return content;
  },

  /**
   * 检查内容是否包含 Markdown 语法
   *
   * @param {string} content - 待检查文本
   * @returns {boolean}
   */
  hasMarkdown(content) {
    if (!content) return false;
    const markdownPatterns = [
      /^#+\s/, // 标题
      /\*\*[^*]+\*\*/, // 粗体
      /\*[^*]+\*/, // 斜体
      /`[^`]+`/, // 行内代码
      /```[\s\S]*?```/, // 代码块
      /^- /, // 列表项
      /\[[^\]]+\]\([^)]+\)/, // 链接
    ];
    return markdownPatterns.some((pattern) => pattern.test(content));
  },

  /**
   * 格式化工具调用信息（美化版）
   *
   * @param {Array<{name?: string, function?: {name?: string}, arguments?: any}>} toolCalls
   * @returns {string} 格式化的工具调用字符串
   */
  formatToolCalls(toolCalls) {
    if (!toolCalls || toolCalls.length === 0) return '';

    return toolCalls
      .map((tool) => {
        const toolName = tool.name || tool.function?.name || '未知工具';
        const displayName = getToolDisplayName(toolName);
        const args = tool.arguments || tool.function?.arguments || '{}';

        try {
          const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
          const argStr = Object.entries(parsedArgs)
            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(' | ');
          if (argStr) return `**${displayName}**: ${argStr}`;
          return `**${displayName}**`;
        } catch {
          return `**${displayName}**: ${args}`;
        }
      })
      .join('\n');
  },
};

// ==================== 状态管理工具 ====================

export const stateUtils = {
  /**
   * 创建消息状态管理器
   *
   * 提供最近消息获取和订阅/取消订阅方法。
   *
   * @param {Object} botSessionManager - 会话管理器实例
   * @param {Function} botSessionManager.getRecentMessages - (count: number) => ChatMessage[]
   * @param {Function} botSessionManager.onUpdate - (callback) => void
   * @param {Function} botSessionManager.offUpdate - (callback) => void
   * @returns {Object} 消息状态管理器
   */
  createMessageStateManager(botSessionManager) {
    /**
     * 获取最近消息
     *
     * @param {number} [count=10] - 消息条数
     * @returns {ChatMessage[]}
     */
    const getRecentMessages = (count = 10) => {
      return botSessionManager.getRecentMessages(count);
    };

    /**
     * 订阅消息更新（返回取消订阅函数）
     *
     * @param {Function} callback - (messages: ChatMessage[]) => void
     * @returns {Function} 取消订阅函数
     */
    const subscribe = (callback) => {
      botSessionManager.onUpdate(callback);
      return () => {
        botSessionManager.offUpdate(callback);
      };
    };

    return {
      getRecentMessages,
      subscribe,
    };
  },
};

// ==================== 错误处理工具 ====================

export const errorUtils = {
  /**
   * 处理流式响应错误（SSE 特定错误码）
   *
   * 注意：通用错误处理（重试、分类等）在 errorHandler.js 中实现。
   * 本函数专注于 SSE 流式响应中 HTTP 状态码的用户友好消息生成。
   *
   * @param {unknown} error - 错误对象
   * @returns {string} 用户友好的错误消息
   */
  handleStreamError(error) {
    logger.error('流式响应错误:', error);

    if (error instanceof Error) {
      if (error.message.includes('HTTP error')) {
        const match = error.message.match(/status: (\d+)/);
        if (match) {
          const status = match[1];
          switch (status) {
            case '401':
              return '认证失败，请检查 API 密钥。';
            case '403':
              return '权限不足，无法访问该资源。';
            case '429':
              return '请求过于频繁，请稍后重试。';
            case '500':
              return '服务器内部错误，请稍后重试。';
            case '502':
            case '503':
            case '504':
              return '服务器暂时不可用，请稍后重试。';
            default:
              return `HTTP 错误 (${status})，请稍后重试。`;
          }
        }
      }
    }

    return '处理响应时出现错误，请稍后重试。';
  },
};

// ==================== 工具调用处理工具 ====================

export const toolHandlerUtils = {
  /**
   * 创建备用工具处理器
   *
   * 当工具在 ToolRegistry 中未找到时，返回备用处理结果（仅为错误信息，不提供模拟数据）。
   *
   * @param {Object} _store - 未使用的 store 参数（为保持通用接口）
   * @returns {Function} 备用处理器函数
   */
  createFallbackToolHandler() {
    /**
     * 通用备用处理器
     *
     * @param {string} toolName - 工具名称
     * @param {Object} _args - 工具参数（忽略）
     * @returns {Promise<{success: boolean, error: string}>}
     */
    const fallbackHandler = async (toolName) => {
      logger.warn(`工具 ${toolName} 未在 ToolRegistry 中找到`);
      return {
        success: false,
        error: `工具 ${toolName} 不可用，请检查工具配置`,
      };
    };

    return fallbackHandler;
  },
};
