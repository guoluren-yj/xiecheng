/**
 * toolContext — 工具运行时上下文
 *
 * @date: 2026-06-24
 */

/** @type {string} 当前编辑器脚本内容 */
let currentScriptContent = '';

/** @type {Object|null} 脚本 DataSet 引用 */
let scriptCodeDs = null;

/** @type {string} 脚本执行参数：输入实体编码 */
let inputEntityCode = '';

/** @type {string} 脚本执行参数：输出实体编码 */
let outputEntityCode = '';

/** @type {string} 脚本执行参数：租户编号 */
let debugTenantNum = 'SRM';

export function setScriptContent(content) {
  currentScriptContent = content || '';
}
export function getScriptContent() {
  return currentScriptContent;
}

export function setScriptCodeDs(ds) {
  scriptCodeDs = ds;
}
export function getScriptCodeDs() {
  return scriptCodeDs;
}

export function setInputEntityCode(code) {
  inputEntityCode = code || '';
}
export function getInputEntityCode() {
  return inputEntityCode;
}

export function setOutputEntityCode(code) {
  outputEntityCode = code || '';
}
export function getOutputEntityCode() {
  return outputEntityCode;
}

export function setDebugTenantNum(num) {
  debugTenantNum = num || 'SRM';
}
export function getDebugTenantNum() {
  return debugTenantNum;
}
