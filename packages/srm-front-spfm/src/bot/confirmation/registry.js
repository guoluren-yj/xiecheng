/**
 * 确认合约注册表
 *
 * 将 toolName 映射到对应的 ConfirmationContract。
 * 通用管线：pendingStore.get() → 找到 contract → onConfirm/onCancel
 *
 * @date: 2026-06-12
 */

import ScriptModifyConfirmation from './ScriptModifyConfirmation';
import ScriptExecuteConfirmation from './ScriptExecuteConfirmation';

/** @type {Object<string, Object>} */
const CONFIRMATION_CONTRACTS = {
  modify_script: ScriptModifyConfirmation,
  execute_script: ScriptExecuteConfirmation,
};

/**
 * 获取工具对应的确认合约
 * @param {string} toolName
 * @returns {Object|undefined}
 */
function getConfirmationContract(toolName) {
  return CONFIRMATION_CONTRACTS[toolName];
}

/**
 * 检查工具是否需要确认合约
 * @param {string} toolName
 * @returns {boolean}
 */
function hasConfirmationContract(toolName) {
  return toolName in CONFIRMATION_CONTRACTS;
}

export { CONFIRMATION_CONTRACTS, getConfirmationContract, hasConfirmationContract };
