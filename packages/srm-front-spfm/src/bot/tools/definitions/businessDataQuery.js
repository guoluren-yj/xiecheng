/**
 * businessDataQuery — 业务数据查询工具
 *
 * 通过 QueryBlock 查询业务数据。使用预定义 QueryBlockCode 执行只读查询。
 * 后端：POST /v1/bot/business-data/query
 * 约束：仅执行预定义 QueryBlock（不接受动态 SQL），最多 500 条，超时 30s。
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const businessDataQueryDefinition = {
  metadata: {
    name: TOOL_NAMES.BUSINESS_DATA_QUERY,
    type: 'query',
    description: '通过预定义的 QueryBlock 查询业务数据',
    purpose: '当需要查询运行时业务数据（如采购订单列表、供应商信息等）时使用',
    usage: '传入 QueryBlockCode 和查询参数，系统执行只读查询并返回结果',
    notes: '只能执行预定义的 QueryBlock，最多返回 500 条记录，超时 30 秒',
    isIdempotent: true,
    parameters: [
      {
        name: 'queryBlockCode',
        type: 'string',
        description: '预定义的 QueryBlock 编码（如 MY_OPEN_PO）',
        required: true,
      },
      {
        name: 'params',
        type: 'object',
        description: '查询参数对象，具体字段取决于 QueryBlock 定义',
        required: false,
      },
      {
        name: 'page',
        type: 'number',
        description: '页码，从 0 开始',
        required: false,
      },
      {
        name: 'size',
        type: 'number',
        description: '每页条数，默认 10，最大 500',
        required: false,
      },
    ],
  },

  async execute(args) {
    const { queryBlockCode, params = {}, page = 0, size = 10 } = args;

    if (!queryBlockCode) {
      return { success: false, error: '缺少必填参数: queryBlockCode' };
    }

    try {
      const res = await request('/sada/v1/bot/business-data/query', {
        method: 'POST',
        body: JSON.stringify({
          queryBlockCode,
          params,
          pageable: {
            page,
            size: Math.min(size, 500),
            sort: [],
          },
        }),
      });

      const data = getResponse(res);
      return {
        success: true,
        data: data || { content: [], total: 0, page, size },
      };
    } catch (e) {
      return {
        success: false,
        error: `业务数据查询失败: ${e.message}`,
        data: { content: [], total: 0 },
      };
    }
  },

  presenter: {
    summarize: (result) => {
      const total = result?.data?.total || 0;
      if (total > 0) return `查询到 ${total} 条业务数据`;
      return '未查询到数据';
    },
  },
};

export function createBusinessDataQueryTool() {
  return createDeclarativeTool(businessDataQueryDefinition);
}
