/**
 * 工具定义索引
 *
 * 5 工具暴露策略：
 *   LLM 可见（5 个）：
 *     queryCall — 统一查询入口（内部 dispatch 子工具）
 *     scriptModify — 脚本/入参修改（modifyField 二合一）
 *     scriptExecute — 脚本执行
 *     reasoningAction — 结构化推理
 *     stopSession — 停止会话
 *
 *   业务查询子工具（queryCall 内部 dispatch，部分已暂时下掉）：
 *     ✅ docQuery       — 文档查询（保持）
 *     ❌ objectQuery    — 业务对象查询（后续实现）
 *     ❌ helpDocQuery   — 帮助文档查询（后续实现）
 *     ❌ businessDataQuery — 运行时业务数据查询（后续实现）
 *     ❌ metadataQuery  — 元数据/领域地图/钩子查询（后续实现）
 *     ✅ scriptQuery    — 脚本库查询（保持，非业务查询）
 *     ✅ configQuery    — 配置查询（保持，非业务查询）
 *
 *   TG 对照：scriptGenerate / errorAnalysis 在 TG 不存在（LLM 自然处理），
 *   inputSampleModify 已合并到 scriptModify.modifyField="inputSample"。
 *
 * @date: 2026-07-06
 */

import { createQueryCallTool } from './queryCall';
import { createScriptModifyTool } from './scriptModify';
import { createScriptExecuteTool } from './scriptExecute';
import { createReasoningActionTool } from './reasoningAction';
import { createStopSessionTool } from './stopSession';

/**
 * 注册 LLM 可见的工具到 ToolRegistry（5 个）
 * 查询类子工具不注册到 registry，由 queryCall 内部 dispatch。
 *
 * @param {import('../ToolRegistry').default} registry
 */
function registerAllTools(registry) {
  registry.registerTool(createQueryCallTool());
  registry.registerTool(createScriptModifyTool());
  registry.registerTool(createScriptExecuteTool());
  registry.registerTool(createReasoningActionTool());
  registry.registerTool(createStopSessionTool());
}

export {
  registerAllTools,
  createQueryCallTool,
  createScriptModifyTool,
  createScriptExecuteTool,
  createReasoningActionTool,
  createStopSessionTool,
};
