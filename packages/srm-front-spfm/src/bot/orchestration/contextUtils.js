/**
 * contextUtils — 上下文收集工具
 *
 * Bot 的"感官系统"。从编辑器和系统环境收集当前上下文信息，
 * 注入到 LLM 的 system prompt 中。
 *
 * 收集的数据类别：
 *   1. 用户身份 — userId, userName, tenantCode, locale
 *   2. 脚本信息 — scriptContent, scriptLines
 *   3. 执行结果 — testInput, lastOutput, lastLog
 *   4. 视图状态 — activeTab
 *
 * @date: 2026-06-12
 */

import { getCurrentUser, getCurrentTenant } from 'utils/utils';

/**
 * 收集盘古环境上下文
 *
 * @param {Object} [scriptCodeDs] - 编辑器 DataSet（含 script 字段）
 * @param {Object} [scriptOutputDs] - 执行结果 DataSet（含 output 字段）
 * @returns {import('../types').PanguContext}
 */
function collectPanguContext(scriptCodeDs, scriptOutputDs) {
  const user = getCurrentUser() || {};
  const tenant = getCurrentTenant() || {};

  // 脚本内容字段名取决于 DataSet 类型：
  //   - adatorPlayGroundDs → 'scriptContent'
  //   - scriptCodeDs（编辑器 DataSet） → 'script'
  const SCRIPT_FIELD = 'script';

  const scriptRecord = scriptCodeDs?.current;
  const outputRecord = scriptOutputDs?.current;

  return {
    // 用户身份
    userId: String(user.id || ''),
    userName: String(user.realName || user.name || ''),
    tenantCode: String(tenant.code || tenant.tenantNum || ''),
    locale: String(user.locale || 'zh_CN'),

    // 脚本信息
    scriptContent: scriptRecord?.get(SCRIPT_FIELD) || '',
    scriptLines: (scriptRecord?.get(SCRIPT_FIELD) || '').split('\n').length,

    // 执行结果
    testInput: scriptRecord?.get('input') || null,
    lastOutput: outputRecord?.get('output') || null,
    lastLog: outputRecord?.get('outPutLog') || null,

    // 页面 record 字段（由 MarmotScriptButton showMarmotScriptEditor 从父 record 填充到 scriptCodeDs）
    // 用于 Bot contextSummary，原原本本传递，仅部分页面有值
    code: scriptRecord?.get('code') || null,
    taskCode: scriptRecord?.get('taskCode') || null,
    description: scriptRecord?.get('description') || null,
    runningService: scriptRecord?.get('runningService') || null,
    resourceLevel: scriptRecord?.get('resourceLevel') || null,
    quickType: scriptRecord?.get('quickType') || null,
    permission: scriptRecord?.get('permission') || null,
    applyTenantNum: scriptRecord?.get('applyTenantNum') || null,
    tenantNum: scriptRecord?.get('tenantNum') || null,
    scriptType: scriptRecord?.get('scriptType') || null,
  };
}

/**
 * 格式化上下文为 LLM 可读的文本
 * @param {import('../types').PanguContext} context
 * @returns {string}
 */
function formatPanguContext(context) {
  const parts = [];

  if (context.userName) {
    parts.push(`用户: ${context.userName} (租户: ${context.tenantCode || 'N/A'})`);
  }

  if (context.scriptContent) {
    parts.push(
      `当前脚本内容 (${context.scriptLines} 行):\n\`\`\`groovy\n${context.scriptContent.slice(
        0,
        3000
      )}\n\`\`\``
    );
  }

  if (context.lastOutput !== null && context.lastOutput !== undefined) {
    parts.push(`最近执行输出: ${JSON.stringify(context.lastOutput).slice(0, 1000)}`);
  }

  if (context.lastLog) {
    parts.push(`最近执行日志: ${context.lastLog.slice(0, 500)}`);
  }

  return parts.join('\n\n');
}

export { collectPanguContext, formatPanguContext };
