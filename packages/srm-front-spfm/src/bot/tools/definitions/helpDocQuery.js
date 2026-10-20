/**
 * helpDocQuery — 帮助文档查询工具
 *
 * 查询盘古产品帮助文档。文档源存入 RelTable（不走 classpath）：
 *   - guide: 使用指南
 *   - tutorial: 教程
 *   - faq: 常见问题
 *   - reference: 参考手册
 *
 * 后端：POST /v1/bot/help-docs/query
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const helpDocQueryDefinition = {
  metadata: {
    name: TOOL_NAMES.HELP_DOC_QUERY,
    type: 'query',
    description: '查询盘古产品帮助文档',
    purpose: '当需要查看产品使用指南、教程、FAQ 等帮助文档时使用',
    usage: '传入 keyword 搜索文档内容，可选 type 过滤文档类型（guide/tutorial/faq/reference）',
    notes: '帮助文档存储在 RelTable 中，与开发文档（@M 插件文档）是不同来源',
    isIdempotent: true,
    parameters: [
      {
        name: 'keyword',
        type: 'string',
        description: '搜索关键字',
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        description: '文档类型过滤：guide（指南）/ tutorial（教程）/ faq（FAQ）/ reference（参考）',
        required: false,
        enum: ['guide', 'tutorial', 'faq', 'reference'],
      },
    ],
  },

  async execute(args) {
    const { keyword, type } = args;

    if (!keyword) {
      return { success: false, error: '缺少必填参数: keyword' };
    }

    try {
      const res = await request('/sada/v1/bot/help-docs/query', {
        method: 'POST',
        body: JSON.stringify({ keyword, type: type || '' }),
      });

      const data = getResponse(res);
      return {
        success: true,
        data: data || { documents: [], total: 0 },
      };
    } catch (e) {
      return {
        success: false,
        error: `帮助文档查询失败: ${e.message}`,
        data: { documents: [], total: 0 },
      };
    }
  },

  presenter: {
    summarize: (result) => {
      const total = result?.data?.total || 0;
      if (total > 0) return `找到 ${total} 篇帮助文档`;
      return '未找到匹配的帮助文档';
    },
  },
};

export function createHelpDocQueryTool() {
  return createDeclarativeTool(helpDocQueryDefinition);
}
