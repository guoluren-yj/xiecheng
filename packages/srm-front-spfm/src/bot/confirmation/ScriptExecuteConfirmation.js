/**
 * ScriptExecuteConfirmation — 脚本执行确认合约
 *
 * 对应工具：scriptExecute
 * 确认后：调用后端执行端点 POST /v1/script-debug/run（FakeTx 回滚）
 *
 * 流程：
 *   用户确认 →
 *   1. POST /v1/script-debug/run 调用后端执行
 *   2. 获取执行结果（output + log + executionTime）
 *   3. 写入 bot history
 *   4. 返回执行结果
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import CryptoJS from 'crypto-js';
import {
  getInputEntityCode,
  getOutputEntityCode,
  getDebugTenantNum,
} from '../orchestration/toolContext';

const ScriptExecuteConfirmation = Object.freeze({
  toolName: 'execute_script',

  /**
   * 用户确认后的回调
   * 对齐编辑器 MarmotScriptEditor.testScript API 格式
   * @param {Object} ctx - ConfirmContext
   * @returns {Promise<{ success: boolean, data?: *, error?: string, forHistory?: * }>}
   */
  async onConfirm(ctx) {
    const { pendingItem } = ctx;
    const args = pendingItem.originalArgs || {};
    const inputJson = typeof args.inputJson === 'string' ? args.inputJson : '';

    try {
      const scriptContent =
        pendingItem.pendingModification?.newScriptContent ||
        pendingItem.pendingModification?.scriptContent ||
        '';
      const encodedScript = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf16.parse(scriptContent));

      // 对齐编辑器 MarmotScriptEditor.testScript API 格式
      const res = await request('/sada/v1/script-debug/run', {
        method: 'POST',
        body: {
          script: encodedScript,
          rawInputJsonStr: inputJson,
        },
        query: {
          inputEntityCode: getInputEntityCode(),
          outputEntityCode: getOutputEntityCode(),
          debugTenantNum: getDebugTenantNum(),
        },
      });

      return {
        success: true,
        data: res,
        forHistory: {
          action: 'scriptExecute',
          status: 'confirmed',
          result: res?.result || '',
          outPutLog: res?.outPutLog || '',
          summary: '已确认执行脚本',
        },
      };
    } catch (e) {
      return {
        success: false,
        error: `执行失败: ${e.message}`,
        forHistory: {
          action: 'scriptExecute',
          status: 'failed',
          error: e.message,
        },
      };
    }
  },

  /**
   * 用户取消后的回调
   * @param {Object} ctx - CancelContext
   * @returns {{ success: boolean, forHistory: * }}
   */
  onCancel() {
    return {
      success: true,
      forHistory: {
        action: 'scriptExecute',
        status: 'cancelled',
        summary: '用户取消了脚本执行',
      },
    };
  },
});

export default ScriptExecuteConfirmation;
