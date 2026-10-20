/**
 * objectQuery — 业务对象查询工具
 *
 * 查询盘古业务对象注册表（srm-modeler），获取业务对象编码、字段列表、字段值集。
 * 后端：经 srm-adaptor 代理 → srm-modeler
 * 端点：POST /v1/bot/business-objects/query
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const objectQueryDefinition = {
  metadata: {
    name: TOOL_NAMES.OBJECT_QUERY,
    type: 'query',
    description: '查询盘古业务对象注册表，获取业务对象编码、字段列表、字段值集信息',
    purpose: '当需要了解某个业务对象的结构、字段定义、值集时使用',
    usage: '传入 objectCode 查询特定对象，或不传 objectCode 列出所有业务对象',
    notes: '返回的字段列表包含字段名、类型、是否必填、值集信息',
    isIdempotent: true,
    parameters: [
      {
        name: 'objectCode',
        type: 'string',
        description: '业务对象编码（如 PUR_PO_HEADER）。不传则列出所有对象',
        required: false,
      },
      {
        name: 'keyword',
        type: 'string',
        description: '搜索关键字，模糊匹配对象编码或名称',
        required: false,
      },
      {
        name: 'includeFields',
        type: 'boolean',
        description: '是否同时返回字段列表，默认 true',
        required: false,
      },
    ],
  },

  async execute(args) {
    const { objectCode, keyword, includeFields = true } = args;

    try {
      const res = await request('/sada/v1/bot/business-objects/query', {
        method: 'POST',
        body: JSON.stringify({
          objectCode: objectCode || '',
          keyword: keyword || '',
          includeFields,
        }),
      });

      const data = getResponse(res);
      return {
        success: true,
        data: data || { objects: [], total: 0 },
      };
    } catch (e) {
      return {
        success: false,
        error: `业务对象查询失败: ${e.message}`,
        data: { objects: [], total: 0 },
      };
    }
  },

  presenter: {
    summarize: (result) => {
      if (result?.data?.objects?.length > 0) {
        return `找到 ${result.data.total || result.data.objects.length} 个业务对象`;
      }
      return '未找到业务对象';
    },
    forHistory: (result) => {
      const objects = result?.data?.objects || [];
      return {
        count: objects.length,
        names: objects.slice(0, 5).map((o) => o.code || o.name),
      };
    },
  },
};

export function createObjectQueryTool() {
  return createDeclarativeTool(objectQueryDefinition);
}
