/**
 * toolDisplayUtils - 工具显示名称工具函数
 *
 * 提供工具名称到中文显示名称的映射，
 * 以及根据开关状态过滤工具列表的功能。
 *
 * ===== 维护规范 =====
 * 1. 来源：盘古 TOOL_NAMES 常量（见 types.js）或已实现的工具
 * 2. 新增工具时必须在 TOOL_DISPLAY_NAME_MAP 中添加中文名
 * 3. 别名仅用于旧名/短名的兼容查找，显示名称应与对应注册工具一致
 * 4. 仅添加已实际实现的工具。计划中的工具待实现后再加入
 *
 * @date: 2026-06-15
 */

/**
 * 工具显示名称映射表
 *
 * @type {Object<string, string>}
 */
export const TOOL_DISPLAY_NAME_MAP = {
  // ===== LLM 可见的顶层工具（5 个，snake_case） =====
  query_call: '批量查询',
  modify_script: '脚本修改',
  execute_script: '执行脚本',
  reasoning_action: '推理行动',
  stop_session: '停止会话',

  // ===== queryCall 内部 dispatch 的子工具（7 个，snake_case） =====
  // query_object: '业务对象查询',
  query_document: '开发文档查询',
  // query_help_doc: '帮助文档查询',
  // query_script: '脚本查询',
  // query_runtime_data: '运行时数据查询',
  // query_metadata: '元数据查询',
  // query_config: '配置查询',

  // ===== Phase 5 计划工具（暂不实施） =====
  // plan_document: '任务书',
};

/**
 * 获取工具显示名称
 *
 * @param {string} toolName - 工具名称
 * @returns {string} 中文显示名称，未找到时返回原名称
 *
 * @example
 * getToolDisplayName('queryCall')   // => '批量查询'
 * getToolDisplayName('unknown')     // => 'unknown'
 */
export function getToolDisplayName(toolName) {
  return TOOL_DISPLAY_NAME_MAP[toolName] || toolName;
}

/**
 * 根据工具启用状态过滤工具列表
 *
 * 返回 enabled 状态不为 false 的工具。
 *
 * @param {string[]} availableTools - 可用工具列表
 * @param {Object<string, boolean>} toolEnabledStates - 工具启用状态映射
 * @returns {string[]} 启用的工具列表
 *
 * @example
 * filterEnabledTools(['query_call', 'modify_script'], { query_call: true, modify_script: false })
 * // => ['queryCall']
 */
export function filterEnabledTools(availableTools, toolEnabledStates) {
  if (!Array.isArray(availableTools)) return [];
  return availableTools.filter((toolName) => toolEnabledStates[toolName] !== false);
}
