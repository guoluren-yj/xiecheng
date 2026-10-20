/**
 * scriptExecute — 脚本执行工具
 *
 * 类型：action（高风险需 pending 确认）
 * 对齐 TG ScriptDirectExecuteTool.ts
 *
 * @date: 2026-06-24
 */

import request from 'utils/request';
import CryptoJS from 'crypto-js';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';
import { analyzeScriptSafety } from '../utils/scriptSafety';
import {
  getScriptContent,
  getInputEntityCode,
  getOutputEntityCode,
  getDebugTenantNum,
} from '../../orchestration/toolContext';

const scriptExecuteDefinition = {
  metadata: {
    name: TOOL_NAMES.SCRIPT_EXECUTE,
    type: 'action',
    description:
      '执行当前编辑器中的 Marmot 脚本。支持两种模式：normal（普通执行，需要提供入参 JSON）和 unitTest（执行脚本中 class App 的 selfTest 方法，返回结构化测试结果）',
    purpose: '执行当前编辑器中的脚本并获取执行结果。支持普通执行和单元测试两种模式',
    usage:
      'mode="normal"：提供 inputJson（脚本入参），执行前会自动安全检查。mode="unitTest"：无需 inputJson，执行 selfTest 方法，返回通过/失败统计',
    notes:
      '执行使用 FakeTx 事务自动回滚，不影响真实数据。每次执行结果可能不同。inputJson 是脚本执行时的入参 JSON',
    isIdempotent: false,
    parameters: [
      {
        name: 'mode',
        type: 'string',
        description:
          '执行模式：normal（普通执行，需 inputJson）/ unitTest（单元测试，执行 selfTest 方法）',
        required: false,
        default: 'normal',
        enum: ['normal', 'unitTest'],
      },
      {
        name: 'inputJson',
        type: 'string',
        description:
          '脚本执行时的入参 JSON 字符串（mode=normal 时必填）。如：{"id": 1, "name": "test"}。mode=unitTest 时无需传入',
        required: false,
      },
    ],
  },

  validate(args) {
    const errors = [];
    const mode = args.mode || 'normal';
    if (mode !== 'normal' && mode !== 'unitTest') {
      errors.push(`不支持的执行模式: ${mode}，仅支持 normal / unitTest`);
    }
    if (mode === 'normal' && args.inputJson) {
      if (typeof args.inputJson === 'string') {
        try {
          JSON.parse(args.inputJson);
        } catch (e) {
          errors.push('inputJson 必须为合法 JSON 字符串');
        }
      }
    }
    return { valid: errors.length === 0, errors };
  },

  async execute(args) {
    const inputJson = typeof args.inputJson === 'string' ? args.inputJson : '';

    // 获取当前脚本内容
    const scriptContent = getScriptContent();
    if (!scriptContent) {
      return { success: false, error: '当前编辑器无脚本内容可执行' };
    }

    // 安全分析
    const safetyResult = analyzeScriptSafety(scriptContent);

    // 对齐 TG：无风险时直接执行（复用编辑器执行接口）
    if (safetyResult.warnings.length === 0) {
      return callExecuteApi(scriptContent, inputJson);
    }

    // 有风险：需确认
    return {
      success: true,
      data: {
        requiresConfirmation: true,
        applied: false,
        safetyWarnings: safetyResult.warnings,
        riskLevel: safetyResult.riskLevel,
        operationType: 'direct_execute',
        modificationDescription: '直接执行脚本（高风险操作需确认）',
        pendingModification: {
          newScriptContent: scriptContent,
          currentScriptContent: scriptContent,
          operationType: 'direct_execute',
          safetyWarnings: safetyResult.warnings,
        },
      },
    };
  },

  presenter: {
    summarize: (result) => {
      if (result?.data?.requiresConfirmation) {
        return `等待确认执行 (${result.data.preview?.mode || 'normal'})`;
      }
      if (result?.data?.error) {
        return `执行失败: ${result.data.error}`;
      }
      if (result?.data?.output) {
        return '脚本已执行';
      }
      return '脚本执行完成';
    },
    forHistory: (result) => {
      return {
        action: 'scriptExecute',
        status: 'confirmed',
        result: result?.data?.result || '',
        outPutLog: result?.data?.outPutLog || '',
      };
    },
  },
};

async function callExecuteApi(scriptContent, inputJson) {
  try {
    // 对齐编辑器 MarmotScriptEditor.testScript（行 359-367）：Base64(UTF-16) + rawInputJsonStr
    const encodedScript = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf16.parse(scriptContent));

    const res = await request('/sada/v1/script-debug/run', {
      method: 'POST',
      body: {
        script: encodedScript,
        rawInputJsonStr: inputJson || '',
      },
      query: {
        inputEntityCode: getInputEntityCode(),
        outputEntityCode: getOutputEntityCode(),
        debugTenantNum: getDebugTenantNum(),
      },
    });

    // 对齐编辑器：直接读 res.result / res.outPutLog
    return {
      success: true,
      data: {
        result: res?.result || '',
        outPutLog: res?.outPutLog || '',
      },
    };
  } catch (e) {
    return {
      success: false,
      error: `执行失败: ${e.message}`,
    };
  }
}

export function createScriptExecuteTool() {
  return createDeclarativeTool(scriptExecuteDefinition);
}
