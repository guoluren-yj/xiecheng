/**
 * reasoningAction — 结构化推理工具（TG 完整版）
 *
 * 类型：analysis。纯 AI 推理，tool_call 不产生副作用。
 *
 * 三种推理模式（ReAct 循环）：
 *   1. action=think   — 分析情况，制定计划（必填：situation, goal）
 *   2. action=act     — 执行已制定的计划（必填：plan）
 *   3. action=observe — 观察结果，评估完成状态（必填：result, expectation）
 *
 * LLM 使用流程：
 *   think → act → observe → (循环直到完成)
 *
 * 移植自 TG ReasoningTool.ts（340 行），与 TG 功能完全一致。
 *
 * @date: 2026-06-15
 */

import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const reasoningActionDefinition = {
  metadata: {
    name: TOOL_NAMES.REASONING_ACTION,
    type: 'analysis',
    description: `结构化推理工具，用于复杂任务的规划和执行。

三种推理模式：
1. action=think - 分析当前情况，制定行动计划
2. action=act - 执行已制定的行动计划
3. action=observe - 观察行动结果，评估是否达成目标

使用流程：think → act → observe →（循环直到完成）

适用场景：复杂多步骤任务、需要规划的问题解决、代码生成任务`,
    purpose: '用于复杂任务的规划和执行，帮助 AI 更清晰地思考和解决问题',
    usage: `action=think: 分析情况制定计划，输入 situation、goal、constraints
action=act: 执行计划，输入 plan、reason
action=observe: 评估结果，输入 result、expectation`,
    notes: 'ReAct 推理模式的三步骤：分析→执行→观察→循环直到完成',
    isIdempotent: true,
    parameters: [
      {
        name: 'action',
        type: 'string',
        description: '推理模式：think-分析制定计划，act-执行计划，observe-观察评估',
        required: true,
        enum: ['think', 'act', 'observe'],
      },
      // action=think 时使用
      {
        name: 'situation',
        type: 'string',
        description: '（think 模式）当前情况描述，包括已获取的信息和当前状态',
        required: false,
      },
      {
        name: 'goal',
        type: 'string',
        description: '（think 模式）要达成的目标或任务',
        required: false,
      },
      {
        name: 'constraints',
        type: 'string',
        description: '（think 模式）约束条件或限制（可选）',
        required: false,
      },
      // action=act 时使用
      {
        name: 'plan',
        type: 'string',
        description: '（act 模式）具体行动计划，描述要执行的操作',
        required: false,
      },
      {
        name: 'reason',
        type: 'string',
        description: '（act 模式）为什么选择这个行动（可选）',
        required: false,
      },
      // action=observe 时使用
      {
        name: 'result',
        type: 'string',
        description: '（observe 模式）上一步行动返回的结果',
        required: false,
      },
      {
        name: 'expectation',
        type: 'string',
        description: '（observe 模式）期望的结果或目标',
        required: false,
      },
    ],
  },

  validate(args) {
    const errors = [];
    const { action } = args;
    if (!action || !['think', 'act', 'observe'].includes(action)) {
      errors.push(`不支持的推理模式: "${action}"，仅支持 think / act / observe`);
    }
    if (action === 'think') {
      if (!args.situation) errors.push('action=think 时 situation 为必填参数');
      if (!args.goal) errors.push('action=think 时 goal 为必填参数');
    }
    if (action === 'act' && !args.plan) {
      errors.push('action=act 时 plan 为必填参数');
    }
    if (action === 'observe') {
      if (!args.result) errors.push('action=observe 时 result 为必填参数');
      if (!args.expectation) errors.push('action=observe 时 expectation 为必填参数');
    }
    return { valid: errors.length === 0, errors };
  },

  async execute(args) {
    const action = String(args.action || '');

    if (action === 'think') {
      const { situation, goal, constraints } = args;

      if (!situation || !goal) {
        return { success: false, error: 'action=think 时 situation 和 goal 为必填参数' };
      }

      const analysis = `## 情况分析\n${situation}\n\n## 目标\n${goal}\n\n${
        constraints ? `## 约束条件\n${constraints}\n\n` : ''
      }## 行动计划\n${
        situation
          ? `围绕「${situation.replace(/[。，；：、]/g, ' ').substring(0, 40)}」相关场景，`
          : ''
      }按以下步骤推进：\n1. 确认关键信息是否完整\n2. 评估可行方案\n3. 选择最优方案并执行\n4. 验证执行结果`;

      return {
        success: true,
        data: {
          action: 'think',
          analysis,
          situation,
          goal,
          constraints: constraints || '',
          reasoning: '通过分析当前情况和目标，制定了行动计划',
          _analysisTimestamp: Date.now(),
        },
      };
    }

    if (action === 'act') {
      const { plan, reason } = args;

      if (!plan) {
        return { success: false, error: 'action=act 时 plan 为必填参数' };
      }

      return {
        success: true,
        data: {
          action: 'act',
          plan,
          reason: reason || '',
          status: 'act_completed',
          message: `行动计划已执行：${plan}`,
          reasoning: reason || '按照制定的计划执行行动',
          _analysisTimestamp: Date.now(),
        },
      };
    }

    if (action === 'observe') {
      const { result, expectation } = args;

      if (!result || !expectation) {
        return { success: false, error: 'action=observe 时 result 和 expectation 为必填参数' };
      }

      const resultStr = String(result || '');
      const isCompleted =
        resultStr.includes('success') || resultStr.includes('完成') || resultStr.includes('成功');
      const hasError =
        resultStr.includes('error') || resultStr.includes('失败') || resultStr.includes('错误');

      let assessment = '';
      let nextStep = '';

      if (isCompleted && !hasError) {
        assessment = '✅ 任务已成功完成';
        nextStep = '可以向用户提供最终答案';
      } else if (hasError) {
        assessment = '❌ 任务执行遇到问题';
        nextStep = '需要分析错误原因，调整策略后重试';
      } else {
        assessment = '⚠️ 任务结果不明确';
        nextStep = '需要进一步分析，可能需要更多信息';
      }

      return {
        success: true,
        data: {
          action: 'observe',
          result,
          expectation,
          assessment,
          isCompleted,
          hasError,
          nextStep,
          reasoning: '通过观察行动结果与期望，评估任务完成状态',
          _analysisTimestamp: Date.now(),
        },
      };
    }

    return { success: false, error: `不支持的推理模式: ${action}` };
  },

  presenter: {
    display: (result) => ({
      summary: result?.data?.assessment || result?.data?.action || '推理完成',
      details: result?.data || {},
    }),
    summarize(result) {
      if (!result?.success || !result?.data) return '推理失败';

      const d = result.data;

      // observe 模式：返回评估结论
      if (d.assessment) return d.assessment;

      // think 模式：提取关键信息
      if (d.action === 'think') {
        const parts = [];
        if (d.goal) parts.push(`目标: ${String(d.goal).substring(0, 60)}`);
        if (d.situation) parts.push(`场景: ${String(d.situation).substring(0, 40)}`);
        return parts.length > 0 ? parts.join(' · ') : '分析完成';
      }

      // act 模式：返回计划摘要
      if (d.action === 'act') {
        if (d.plan) return String(d.plan).substring(0, 80);
        if (d.message) return d.message;
        return '行动计划已执行';
      }

      return d.message || '推理完成';
    },

    forHistory(result) {
      const d = result?.data;
      if (!d) return { summary: '推理完成' };

      const action = d.action || '';
      const thought = d.analysis || d.plan || d.assessment || '';

      return {
        action,
        thought: thought.substring(0, 200),
        summary: this.summarize(result),
      };
    },
    maxResultSize: 10 * 1024,
  },
};

export function createReasoningActionTool() {
  return createDeclarativeTool(reasoningActionDefinition);
}
