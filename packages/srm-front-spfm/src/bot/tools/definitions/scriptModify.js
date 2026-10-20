/**
 * scriptModify — 脚本/入参修改工具
 *
 * 类型：action
 *
 * 单一 modify 工具通过 modifyField 参数处理两种修改：
 *   modifyField="scriptContent"（默认）→ 修改脚本内容（需 pending 确认）
 *   modifyField="inputSample"     → 修改测试入参（即时生效，无需确认）
 *
 * scriptContent 模式支持两种操作类型：
 *   operationType="full_replace"（默认）— 提供完整 newScriptContent 替换
 *   operationType="snippet_replace"    — 提供 oldString + newString 局部替换
 *
 * 确认门禁：scriptContent 模式返回 requiresConfirmation=true，
 * 触发 DialogueOrchestrator → PendingStore → UI 确认弹窗。
 * 确认后：codeRef.setValue() 即时更新编辑器 + PUT RelTable 持久化。
 *
 * @date: 2026-06-15
 */

import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';
import { analyzeScriptSafety, checkSyntaxByEspree } from '../utils/scriptSafety';
import {
  computeDiffStats,
  generateSimpleDiff,
  checkCodeModificationSafety,
} from '../../utils/diffUtils';
import { getScriptContent, getScriptCodeDs } from '../../orchestration/toolContext';

const INPUT_SAMPLE_STORAGE_KEY = 'bot_input_sample';

/** 输入样本最大字节限制（512KB），对齐 TG ScriptModifyTool */
const MAX_INPUT_SAMPLE_SIZE = 524288;

/**
 * 局部替换：在 content 中找到 oldString 替换为 newString
 *
 * 字符串替换方式完成片段修改。
 *
 * @param {string} content - 原始脚本内容
 * @param {string} oldString - 要查找的代码片段
 * @param {string} newString - 替换后的代码片段
 * @returns {{ success: boolean, content?: string, error?: string }}
 */
function applySnippetReplacement(content, oldString, newString) {
  if (!oldString) {
    return { success: false, error: '原代码片段(oldString)不能为空' };
  }

  // 转义正则特殊字符
  const escapedOldString = oldString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedOldString, 'g');
  const newContent = content.replace(regex, newString);

  if (newContent === content) {
    return { success: false, error: '未找到指定的代码片段，请确保 oldString 准确无误' };
  }

  return { success: true, content: newContent };
}

const scriptModifyDefinition = {
  metadata: {
    name: TOOL_NAMES.SCRIPT_MODIFY,
    type: 'action',
    description:
      '修改当前编辑器中的 Marmot 脚本内容，支持完整替换和局部修改两种模式。两种模式都需要用户确认后才能生效',
    purpose: '用于修改当前正在编辑的 Marmot 脚本内容或测试入参对象',
    usage:
      'operationType 分两种：full_replace（完整替换）和 snippet_replace（局部替换）。full_replace 需要提供 newScriptContent（新脚本内容）；snippet_replace 需要提供 oldString（原代码片段）和 newString（新代码片段）。modifyField="inputSample" 时修改测试入参，modifyField="scriptContent"（默认）时修改脚本内容',
    notes: 'scriptContent 模式修改后必须用户确认。inputSample 模式即时生效无需确认',
    isIdempotent: false,
    parameters: [
      {
        name: 'operationType',
        type: 'string',
        description:
          '修改操作类型：snippet_replace（局部修改）| full_replace（完整替换）。仅 modifyField=scriptContent 时有效',
        required: false,
        default: 'snippet_replace',
        enum: ['snippet_replace', 'full_replace'],
      },
      {
        name: 'modifyField',
        type: 'string',
        description: '修改目标：scriptContent（脚本内容，默认）| inputSample（测试入参）',
        required: false,
        default: 'scriptContent',
        enum: ['scriptContent', 'inputSample'],
      },
      {
        name: 'newScriptContent',
        type: 'string',
        description: '新的完整脚本内容。当 operationType 为 full_replace 时必填',
        required: false,
      },
      {
        name: 'oldString',
        type: 'string',
        description: '原代码片段（用于定位替换位置）。operationType=snippet_replace 时必填',
        required: false,
      },
      {
        name: 'newString',
        type: 'string',
        description: '新代码片段。operationType=snippet_replace 时必填',
        required: false,
      },
      {
        name: 'newInputSample',
        type: 'string',
        description: '新的测试入参 JSON 字符串。modifyField=inputSample 时必填，必须为合法 JSON',
        required: false,
      },
      {
        name: 'modificationSummary',
        type: 'string',
        description: '修改摘要，简要说明本次修改了什么',
        required: false,
      },
    ],
  },

  validate(args) {
    const errors = [];
    const modifyField = args.modifyField || 'scriptContent';

    if (modifyField === 'inputSample') {
      if (!args.newInputSample) {
        errors.push('modifyField=inputSample 时 newInputSample 必填');
      } else if (typeof args.newInputSample === 'string') {
        try {
          JSON.parse(args.newInputSample);
        } catch (e) {
          errors.push('newInputSample 必须是合法 JSON');
        }
      }
      return { valid: errors.length === 0, errors };
    }

    // scriptContent 模式
    const operationType =
      args.operationType || (args.newScriptContent ? 'full_replace' : 'snippet_replace');

    if (operationType === 'full_replace') {
      if (!args.newScriptContent) {
        errors.push('operationType=full_replace 时 newScriptContent 必填');
      }
    } else if (operationType === 'snippet_replace') {
      if (!args.oldString) {
        errors.push('operationType=snippet_replace 时 oldString 必填');
      }
      if (!args.newString) {
        errors.push('operationType=snippet_replace 时 newString 必填');
      }
    }

    return { valid: errors.length === 0, errors };
  },

  async execute(args) {
    const modifyField = args.modifyField || 'scriptContent';

    // ==================== inputSample 模式（即时生效，无需确认）====================
    if (modifyField === 'inputSample') {
      const newInputSample =
        typeof args.newInputSample === 'string'
          ? args.newInputSample
          : JSON.stringify(args.newInputSample);

      // 1. JSON 格式验证
      let inputJson;
      try {
        inputJson = JSON.parse(newInputSample);
      } catch (e) {
        return {
          success: false,
          data: {
            message: 'JSON 格式无效，请检查语法',
            error: 'invalid_json_format',
            requiresConfirmation: false,
          },
        };
      }

      // 2. 尺寸限制（对齐 TG：512KB）
      if (newInputSample.length > MAX_INPUT_SAMPLE_SIZE) {
        return {
          success: false,
          data: {
            message: `输入样本过大（${Math.round(newInputSample.length / 1024)}KB），最大允许 ${
              MAX_INPUT_SAMPLE_SIZE / 1024
            }KB`,
            error: 'input_sample_too_large',
            requiresConfirmation: false,
          },
        };
      }

      // 3. 获取当前值并比较
      const currentRaw = localStorage.getItem(INPUT_SAMPLE_STORAGE_KEY);
      if (currentRaw === newInputSample) {
        return {
          success: true,
          data: {
            message: '测试入参对象没有变化',
            newValue: newInputSample,
            changed: false,
            requiresConfirmation: false,
            modifyField: 'inputSample',
          },
        };
      }

      // 4. 写入 localStorage（按 scriptCode 区分）
      const scriptCode = getScriptCodeDs()?.current?.get('scriptCode') || '';
      const key = scriptCode
        ? `${INPUT_SAMPLE_STORAGE_KEY}_${scriptCode}`
        : INPUT_SAMPLE_STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(inputJson));

      // 5. 通过 DataSet 更新编辑器
      const ds = getScriptCodeDs();
      if (ds && ds.current) {
        ds.current.set('input', JSON.stringify(inputJson));
      }

      return {
        success: true,
        data: {
          applied: true,
          modifyField: 'inputSample',
          inputSample: inputJson,
          newValue: newInputSample,
          previousValue: currentRaw || '',
          changed: true,
        },
      };
    }

    // ==================== scriptContent 模式（需 pending 确认）====================
    const currentScriptContent = getScriptContent();

    // 确定操作类型：显式指定优先，否则按参数推断
    const operationType =
      args.operationType || (args.newScriptContent ? 'full_replace' : 'snippet_replace');

    let newScriptContent;
    /** @type {{ type: 'snippet'|'full', originalSnippet?: string }} */
    const modificationPosition = { type: 'full' };

    if (operationType === 'snippet_replace') {
      const snippetResult = applySnippetReplacement(
        currentScriptContent,
        args.oldString || '',
        args.newString || ''
      );

      if (!snippetResult.success) {
        return {
          success: false,
          data: {
            message: snippetResult.error,
            requiresConfirmation: false,
          },
        };
      }

      newScriptContent = snippetResult.content;
      modificationPosition.type = 'snippet';
      modificationPosition.originalSnippet = args.oldString;
    } else {
      newScriptContent = args.newScriptContent || '';
      modificationPosition.type = 'full';
    }

    // 检查内容是否无变化
    if (currentScriptContent === newScriptContent) {
      return {
        success: true,
        data: {
          message: '脚本内容没有变化',
          operationType,
          diffSummary: '没有差异',
          requiresConfirmation: false,
          applied: false,
        },
      };
    }

    // 两阶段语法检查（对齐 TG ScriptModifyTool.ts）
    // 第一阶段：前端 espree AST 预检
    const syntaxCheckResult = await checkSyntaxByEspree(newScriptContent);
    // 第二阶段：后端 API 语法检查 — TG 调 POST /api/mdst/ai/tool/syntax-check-batch（30s 超时），
    // PG 暂无对等端点，跳过（使用前端检查结果）
    const syntaxPassed = syntaxCheckResult.passed;
    const syntaxErrorDetails = !syntaxPassed
      ? (syntaxCheckResult.errors || [])
          .map((e) =>
            e.line ? `第${e.line}行${e.column ? `第${e.column}列` : ''}: ${e.message}` : e.message
          )
          .join('；')
      : '';

    // 安全分析（高风险模块检测）
    const safetyResult = analyzeScriptSafety(newScriptContent);

    // 行级 diff（对齐 TG：使用 LCS 算法计算 totalChanges/addedLines/removedLines）
    const diffStats = computeDiffStats(currentScriptContent, newScriptContent);
    const diffSummary = generateSimpleDiff(currentScriptContent, newScriptContent);

    // 代码修改安全分析（函数/import 结构变化检测，对齐 TG checkCodeModificationSafety）
    const codeSafetyResult = checkCodeModificationSafety(currentScriptContent, newScriptContent);
    const safetyWarnings = [...safetyResult.warnings, ...codeSafetyResult.warnings];
    const riskLevel =
      safetyResult.riskLevel === 'high'
        ? 'high'
        : safetyResult.riskLevel === 'medium'
        ? 'medium'
        : codeSafetyResult.changes.linesChanged > 20
        ? 'medium'
        : 'low';

    return {
      success: true,
      data: {
        requiresConfirmation: true,
        modifyField: 'scriptContent',
        operationType,
        modificationPosition,
        pendingModification: {
          newScriptContent,
          currentScriptContent,
          operationType,
          modificationPosition,
          safetyWarnings,
          safetyRiskLevel: riskLevel,
          syntaxPassed,
          syntaxErrors: syntaxCheckResult.errors || [],
          modificationSummary:
            args.modificationSummary ||
            (operationType === 'snippet_replace'
              ? `局部替换: ${(args.oldString || '').substring(0, 50)}...`
              : '修改脚本内容'),
          tableCode: null, // 由 ConfirmationDialog 在实际确认时从外部注入
          recordId: null, // 同上
        },
        diff: {
          totalChanges: diffStats.totalChanges,
          addedLines: diffStats.addedLines,
          removedLines: diffStats.removedLines,
          diffSummary,
          oldLength: currentScriptContent.length,
          newLength: newScriptContent.length,
        },
        syntaxCheck: {
          passed: syntaxPassed,
          message: syntaxPassed ? '语法检查通过' : `语法检查未通过：${syntaxErrorDetails}`,
          errors: syntaxCheckResult.errors || [],
        },
      },
    };
  },

  presenter: {
    summarize: (result) => {
      if (result?.data?.modifyField === 'inputSample') {
        if (result?.data?.changed === false) {
          return '测试入参没有变化';
        }
        return '测试入参已更新';
      }
      if (result?.data?.requiresConfirmation) {
        const diff = result.data.diff || {};
        const opType = result.data.operationType || 'full_replace';
        const syntaxTag = result.data.syntaxCheck?.passed === false ? ' [语法不通过]' : '';
        return `等待确认修改 (${opType}): +${diff.addedLines || 0}/-${
          diff.removedLines || 0
        } 行${syntaxTag}`;
      }
      if (result?.data?.applied === false) {
        return '脚本内容没有变化';
      }
      if (result?.data?.syntaxCheck?.passed === false) {
        return '脚本修改完成 [语法不通过]';
      }
      return '脚本修改完成';
    },
    display: (result) => {
      const isInputSample = result?.data?.modifyField === 'inputSample';
      const isNoChange = result?.data?.applied === false || result?.data?.changed === false;
      return {
        summary: isInputSample
          ? isNoChange
            ? '测试入参无变更'
            : '测试入参已更新'
          : `脚本${isNoChange ? '无变更' : '修改完成'}`,
        details: {
          modifyField: result?.data?.modifyField,
          operationType: result?.data?.operationType,
          diff: result?.data?.diff,
          syntaxCheck: result?.data?.syntaxCheck,
          requiresConfirmation: result?.data?.requiresConfirmation,
          inputSample: result?.data?.inputSample,
        },
      };
    },
    forHistory: (result) => {
      const syntaxNote = result?.data?.syntaxCheck?.passed === false ? ' [语法不通过]' : '';
      return {
        action: 'scriptModify',
        modifyField: result?.data?.modifyField || 'scriptContent',
        operationType: result?.data?.operationType || 'full_replace',
        status: result?.data?.requiresConfirmation ? 'pending' : 'applied',
        diffSummary: result?.data?.diff?.diffSummary || '',
        syntaxNote,
      };
    },
    maxResultSize: 20 * 1024,
  },
};

/**
 * 创建脚本修改工具实例
 */
export function createScriptModifyTool() {
  return createDeclarativeTool(scriptModifyDefinition);
}
