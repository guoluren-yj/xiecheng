/**
 * stopSession — 停止会话工具
 *
 * 类型：action。纯编排层逻辑，无后端 API。
 * 被 DialogueOrchestrator 检测到后立即退出多轮循环。
 *
 * 对齐 TG StopSessionTool.ts
 *
 * @date: 2026-06-24
 */

import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const stopSessionDefinition = {
  metadata: {
    name: TOOL_NAMES.STOP_SESSION,
    type: 'action',
    description:
      '停止多轮会话。当 AI 认为当前任务已完成时调用此工具，告知用户工作已完成。同时通过 title 参数提供会话标题，用于在会话列表中标识本次对话',
    purpose: '通知系统当前任务已完成，停止继续对话',
    usage: '提供 title 参数给出会话标题后调用',
    notes: 'AI 认为工作完成时调用，不需要用户确认',
    isIdempotent: true,
    parameters: [
      {
        name: 'title',
        type: 'string',
        description: '会话标题，4-15 个中文字符，概括本次对话的核心内容',
        required: false,
      },
    ],
  },

  async execute(args) {
    const title = args?.title;
    if (title && title.trim()) {
      // title 由 AgenticLoop 或 BotPanel 处理后设置到 session
    }

    return {
      success: true,
      data: {
        message: '会话已停止',
        shouldStopSession: true,
        title: title || '',
      },
    };
  },

  presenter: {
    summarize: () => '会话已停止',
    forHistory: (result) => {
      return {
        action: 'stop_session',
        status: 'completed',
        title: result?.data?.title || '',
      };
    },
  },
};

export function createStopSessionTool() {
  return createDeclarativeTool(stopSessionDefinition);
}
