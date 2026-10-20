/**
 * metadataQuery — 元数据/领域地图查询工具
 *
 * 盘古 Bot 的核心差异化工具。查询领域地图和埋点钩子位置。
 *
 * 两个端点：
 *   (a) POST /v1/bot/metadata/query — 领域地图查询
 *   (b) POST /v1/bot/metadata/hook-detail — 钩子详情查询
 *
 * 数据来源：adaptor_static_code（服务/描述）、sada_adaptor_task_header/_task_line（版本/内容）
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const metadataQueryDefinition = {
  metadata: {
    name: TOOL_NAMES.METADATA_QUERY,
    type: 'query',
    description: '查询领域地图和埋点钩子位置——盘古 Bot 核心差异化能力',
    purpose: '当需要了解"某个业务场景的钩子在哪"、"某领域有哪些可用钩子"时使用',
    usage:
      '使用 type="domain" 查领域列表，type="hook" 查某领域的钩子清单，type="detail" 查钩子详情',
    notes: '领域地图数据来源 adaptor_static_code。钩子详情含完整的 task_code、触发条件、参数说明',
    isIdempotent: true,
    parameters: [
      {
        name: 'type',
        type: 'string',
        description: '查询类型：domain（领域列表）、hook（钩子清单）、detail（钩子详情）',
        required: true,
        enum: ['domain', 'hook', 'detail'],
      },
      {
        name: 'keyword',
        type: 'string',
        description: '搜索关键字，匹配 taskCode 或 description（type=hook 时使用）',
        required: false,
      },
      {
        name: 'taskCode',
        type: 'string',
        description: '钩子编码（type=detail 时必填）',
        required: false,
      },
      {
        name: 'domainCode',
        type: 'string',
        description: '领域编码（type=hook 时可选，过滤某领域的钩子）',
        required: false,
      },
    ],
  },

  async execute(args) {
    const { type, keyword, taskCode, domainCode } = args;

    try {
      // 钩子详情查询
      if (type === 'detail') {
        if (!taskCode) {
          return { success: false, error: '查询钩子详情需要传入 taskCode' };
        }

        const res = await request('/sada/v1/bot/metadata/hook-detail', {
          method: 'POST',
          body: JSON.stringify({ taskCode }),
        });
        const data = getResponse(res);
        return { success: true, data: data || { hook: null } };
      }

      // 领域 / 钩子清单查询
      const res = await request('/sada/v1/bot/metadata/query', {
        method: 'POST',
        body: JSON.stringify({ type, keyword: keyword || '', domainCode: domainCode || '' }),
      });
      const data = getResponse(res);

      if (type === 'domain') {
        return { success: true, data: data || { domains: [], total: 0 } };
      }

      // type === 'hook'
      return { success: true, data: data || { hooks: [], total: 0 } };
    } catch (e) {
      return {
        success: false,
        error: `元数据查询失败: ${e.message}`,
        data: { hooks: [], domains: [], total: 0 },
      };
    }
  },

  presenter: {
    summarize: (result) => {
      const data = result?.data || {};
      if (data.domains) return `找到 ${data.total || data.domains.length} 个领域`;
      if (data.hooks) return `找到 ${data.total || data.hooks.length} 个钩子`;
      if (data.hook) return `钩子详情: ${data.hook.taskCode || ''}`;
      return '元数据查询完成';
    },
  },
};

export function createMetadataQueryTool() {
  return createDeclarativeTool(metadataQueryDefinition);
}
