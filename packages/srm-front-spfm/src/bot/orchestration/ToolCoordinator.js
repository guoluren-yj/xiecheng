/* eslint-disable no-await-in-loop */

/**
 * ToolCoordinator — 工具协调器
 *
 * 职责：
 *   - [C5] 串行执行工具调用，禁止并行
 *   - 检测工具结果是否需要用户确认（needsPending）
 *   - 格式化工具执行结果
 *
 * @date: 2026-06-12
 */

import logger from '../utils/logger';

/**
 * 检测工具结果是否需要 pending（确认门禁）
 *
 * 以下情况需要确认：
 *   1. 工具返回 requiresConfirmation: true
 *   2. 工具结果包含 pendingModification 字段
 *
 * @param {*} result - 工具执行结果
 * @returns {boolean}
 */
function needsPending(result) {
  if (!result || !result.data) return false;
  const { data } = result;
  return !!(data.requiresConfirmation || data.pendingModification);
}

class ToolCoordinator {
  /**
   * @param {import('../tools/ToolRegistry').default} toolRegistry
   */
  constructor(toolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  /**
   * [C5] 串行执行多个工具
   *
   * @param {Array<{ name: string, args: Object, id: string }>} toolCalls
   * @returns {Promise<Array<{ toolCallId: string, toolName: string, result: *, timestamp: number }>>}
   */
  async executeSerial(toolCalls) {
    const results = [];

    for (const tc of toolCalls) {
      const result = await this.executeSingle(tc.name, tc.args, tc.id);
      results.push({
        toolCallId: tc.id,
        toolName: tc.name,
        result,
        timestamp: Date.now(),
      });
    }

    return results;
  }

  /**
   * 执行单个工具
   *
   * @param {string} toolName
   * @param {Object} args
   * @param {string} [toolCallId]
   * @returns {Promise<*>}
   */
  async executeSingle(toolName, args, toolCallId) {
    const request = {
      toolName,
      arguments: args,
      sessionId: 'default',
      timestamp: Date.now(),
    };

    const response = await this.toolRegistry.executeTool(request);

    // 检测是否需要 pending
    if (needsPending(response)) {
      return {
        ...response.data,
        requiresConfirmation: true,
        toolName,
        originalArgs: args,
        toolCallId,
      };
    }

    return {
      success: response.success !== false,
      data: response.data,
      error: response.error,
      toolName,
      toolCallId,
    };
  }

  /**
   * 从 toolCalls 中提取串行执行所需的列表
   * @param {import('../types').ToolCallData[]} toolCallDataList
   * @returns {Array<{ name: string, args: Object, id: string }>}
   */
  static extractToolCalls(toolCallDataList) {
    return (toolCallDataList || []).map((tc) => {
      let args = {};
      try {
        args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
      } catch (e) {
        logger.warn(
          'tool_call arguments JSON 解析失败',
          { id: tc.id, name: tc.name },
          { category: 'bot', component: 'ToolCoordinator' }
        );
        args = {};
      }
      return {
        name: tc.name,
        args,
        id: tc.id,
      };
    });
  }
}

export default ToolCoordinator;
