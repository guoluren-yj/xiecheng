/**
 * scriptQuery — 已发布脚本查询工具
 *
 * 搜索已发布的脚本库。支持按脚本名称、编码、类型搜索。
 * 后端：POST /v1/rel-table-records/marmot_script_library/page
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const scriptQueryDefinition = {
  metadata: {
    name: TOOL_NAMES.SCRIPT_QUERY,
    type: 'query',
    description: '搜索已发布的脚本库',
    purpose: '当需要查找已有的 Marmot 脚本、了解已有脚本实现时使用',
    usage: '传入脚本名称或编码模糊搜索，可按脚本类型过滤',
    notes: '只能搜索已发布的脚本，草稿状态的不可见',
    isIdempotent: true,
    parameters: [
      {
        name: 'scriptName',
        type: 'string',
        description: '脚本名称（模糊匹配）',
        required: false,
      },
      {
        name: 'scriptCode',
        type: 'string',
        description: '脚本编码（精确匹配）',
        required: false,
      },
      {
        name: 'scriptType',
        type: 'string',
        description: '脚本类型：ADAPTOR / SCRIPT_LIB / REL_ACTION',
        required: false,
        enum: ['ADAPTOR', 'SCRIPT_LIB', 'REL_ACTION'],
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
        description: '每页条数，最大 50',
        required: false,
      },
    ],
  },

  async execute(args) {
    const { scriptName, scriptCode, scriptType, page = 0, size = 20 } = args;

    try {
      const res = await request('/sada/v1/rel-table-records/marmot_script_library/page', {
        method: 'POST',
        body: JSON.stringify({
          scriptName: scriptName || '',
          scriptCode: scriptCode || '',
          scriptType: scriptType || '',
          page,
          size: Math.min(size, 50),
        }),
      });

      const data = getResponse(res);
      return {
        success: true,
        data: data || { content: [], total: 0 },
      };
    } catch (e) {
      return {
        success: false,
        error: `脚本查询失败: ${e.message}`,
        data: { content: [], total: 0 },
      };
    }
  },

  presenter: {
    summarize: (result) => {
      const total = result?.data?.total || 0;
      if (total > 0) return `找到 ${total} 个已发布脚本`;
      return '未找到匹配的脚本';
    },
  },
};

export function createScriptQueryTool() {
  return createDeclarativeTool(scriptQueryDefinition);
}
