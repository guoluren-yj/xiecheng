/**
 * ScriptModifyConfirmation — 脚本修改确认合约
 *
 * 对应工具：scriptModify
 * 确认后：将修改内容通过 RelTable API 写入后端
 *
 * 流程：
 *   用户确认 →
 *   1. UTF-16 + Base64 编码脚本内容
 *   2. PUT /v1/rel-table-records/{tableCode} 写入后端
 *   3. 写入 bot history
 *   4. 返回确认结果
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import CryptoJS from 'crypto-js';
import intl from 'utils/intl';

const ScriptModifyConfirmation = Object.freeze({
  toolName: 'modify_script',

  /**
   * 用户确认后的回调
   * @param {Object} ctx - ConfirmContext
   * @param {Object} ctx.pendingItem
   * @param {import('../orchestration/BotSessionManager').default} ctx.sessionManager
   * @param {import('../orchestration/PendingStore').default} ctx.pendingStore
   * @returns {Promise<{ success: boolean, data?: *, error?: string, forHistory?: * }>}
   */
  async onConfirm(ctx) {
    const { pendingItem } = ctx;
    const mod = pendingItem.pendingModification || {};
    const { newScriptContent, tableCode, recordId } = mod;

    if (!newScriptContent) {
      return {
        success: false,
        error: intl.get('spfm.bot.confirm.error.noContent').d('确认失败: 缺少脚本内容'),
      };
    }

    try {
      // 1. 如果有 tableCode 和 recordId，写入后端
      if (tableCode && recordId) {
        const encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf16.parse(newScriptContent));

        const res = await request(`/v1/rel-table-records/${tableCode}`, {
          method: 'PUT',
          body: JSON.stringify({
            id: recordId,
            scriptContent: encoded,
            updateScenario: 'update',
          }),
        });

        if (!getResponse(res)) {
          throw new Error(intl.get('spfm.bot.confirm.error.saveFailed').d('脚本保存失败'));
        }
      }

      // 2. 返回确认结果（forHistory 用于写入 History 的精简版）
      return {
        success: true,
        data: { applied: true, scriptContent: newScriptContent },
        forHistory: {
          action: 'scriptModify',
          status: 'confirmed',
          summary: intl.get('spfm.bot.confirm.history.confirmed').d('已确认修改脚本'),
        },
      };
    } catch (e) {
      return {
        success: false,
        error: `${intl.get('spfm.bot.confirm.error.execFailed').d('确认执行失败')}: ${e.message}`,
        forHistory: {
          action: 'scriptModify',
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
        action: 'scriptModify',
        status: 'cancelled',
        summary: intl.get('spfm.bot.confirm.history.cancelled').d('用户取消了脚本修改'),
      },
    };
  },
});

export default ScriptModifyConfirmation;
