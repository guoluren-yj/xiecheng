/* eslint-disable no-await-in-loop */

/**
 * ToolRegistry — 工具注册表
 *
 * 职责：工具的注册、发现、执行（含超时+重试）。
 *
 * 功能：
 *   - 注册/注销工具
 *   - LLM 可见性控制（getAllToolDefinitions 只返回 LLM 应看到的工具）
 *   - 单工具执行（含超时 + 指数退避重试）
 *   - 批量串行执行（C5 约束）
 *   - 获取工具展示器（presenter）
 *
 * @date: 2026-06-12
 */

import { DEFAULT_CONFIG } from '../types';

class ToolRegistry {
  constructor() {
    /** @type {Map<string, import('../types').Tool>} */
    this._tools = new Map();
  }

  /**
   * 注册一个工具
   * @param {import('../types').Tool} tool
   * @throws {Error} 如果工具名已注册
   */
  registerTool(tool) {
    if (!tool || !tool.name) {
      throw new Error('ToolRegistry.registerTool: 工具必须包含 name 属性');
    }
    if (this._tools.has(tool.name)) {
      throw new Error(`ToolRegistry: 工具 "${tool.name}" 已注册`);
    }
    this._tools.set(tool.name, tool);
  }

  /**
   * 注销一个工具
   * @param {string} name
   * @returns {boolean}
   */
  unregisterTool(name) {
    return this._tools.delete(name);
  }

  /**
   * 检查工具是否存在
   * @param {string} name
   * @returns {boolean}
   */
  hasTool(name) {
    return this._tools.has(name);
  }

  /**
   * 获取工具
   * @param {string} name
   * @returns {import('../types').Tool|undefined}
   */
  getTool(name) {
    return this._tools.get(name);
  }

  /**
   * 获取注册工具总数
   * @returns {number}
   */
  getToolCount() {
    return this._tools.size;
  }

  /**
   * 获取所有 LLM 可见的工具定义（OpenAI function calling 格式）
   * @returns {Object[]}
   */
  getAllToolDefinitions() {
    const defs = [];
    for (const tool of this._tools.values()) {
      if (tool.getDefinition) {
        defs.push(tool.getDefinition());
      }
    }
    return defs;
  }

  /**
   * 获取工具展示器
   * @param {string} name
   * @returns {import('../types').ToolPresenter|undefined}
   */
  getToolPresenter(name) {
    const tool = this._tools.get(name);
    return tool && tool.getPresenter ? tool.getPresenter() : undefined;
  }

  /**
   * 执行单个工具（含超时 + 指数退避重试）
   *
   * 重试策略：仅对 network/timeout 类错误重试，validation 错误不重试。
   *
   * @param {import('../types').ToolExecutionRequest} request
   * @param {Object} [options]
   * @param {number} [options.timeout=60000] - 单工具超时（毫秒）
   * @param {number} [options.maxRetries=3] - 最大重试次数
   * @returns {Promise<import('../types').ToolExecutionResponse>}
   */
  async executeTool(request, options = {}) {
    const { toolName, arguments: args } = request;
    const timeout = options.timeout || 60000;
    const maxRetries =
      options.maxRetries !== undefined ? options.maxRetries : DEFAULT_CONFIG.MAX_RETRIES;

    const tool = this._tools.get(toolName);
    if (!tool) {
      return { success: false, error: `工具 "${toolName}" 不存在` };
    }

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 超时控制
        const result = await Promise.race([
          tool.execute(args || {}),
          new Promise((_, reject) => setTimeout(() => reject(new Error('工具执行超时')), timeout)),
        ]);
        return result;
      } catch (e) {
        lastError = e;

        // 非可重试错误（参数验证类）直接返回
        if (e.message && e.message.includes('参数验证')) {
          return { success: false, error: e.message };
        }

        // 最后一次尝试失败，不重试
        if (attempt >= maxRetries) break;

        // 指数退避
        const delay = Math.min(DEFAULT_CONFIG.BASE_DELAY * 2 ** attempt, DEFAULT_CONFIG.MAX_DELAY);
        const jitter = delay * 0.2 * (Math.random() * 2 - 1);
        await new Promise((r) => setTimeout(r, Math.round(delay + jitter)));
      }
    }

    return { success: false, error: `工具 "${toolName}" 执行失败: ${lastError.message}` };
  }

  /**
   * [C5] 批量串行执行工具
   *
   * 串行执行，禁止并行。每个工具执行的结果独立报告。
   *
   * @param {import('../types').ToolExecutionRequest[]} requests
   * @param {Object} [options]
   * @returns {Promise<import('../types').ToolExecutionResponse[]>}
   */
  async executeTools(requests, options = {}) {
    const results = [];
    for (const request of requests) {
      const result = await this.executeTool(request, options);
      results.push(result);
    }
    return results;
  }
}

export default ToolRegistry;
