/**
 * docQuery — 文档查询工具
 *
 * 使用 PG 已有文档接口：/ssc/v1/document（复用 MarmotHelpManualService）
 * 两步流程（防止 Token 爆炸）：
 *   Step 1: action="directory" → GET /ssc/v1/document（文档目录树）
 *            action="search"   → POST /ssc/v1/document/search（搜索，keyword 在 body）
 *   Step 2: action="content"   → POST /ssc/v1/document/content（正文 markdown，docKey 在 body）
 *
 * 对齐 TG query_document 行为，使用 PG 自有接口而非自定义 bot 端点。
 *
 * @date: 2026-07-06
 */

import request from 'utils/request';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const docQueryDefinition = {
  metadata: {
    name: TOOL_NAMES.DOC_QUERY,
    type: 'query',
    description:
      '查询盘古文档（开发文档 / 帮助文档）。两步流程：先 directory 或 search 获取目录，再 content 获取正文',
    purpose: '当需要了解开发文档、帮助文档、API 参考、使用指南时使用',
    usage:
      'action="directory" 获取文档目录树；action="search"+keyword 搜索文档；action="content"+docKey 获取正文 markdown',
    notes: '文档正文每篇以 markdown 返回。支持开发文档和帮助文档两种类型',
    isIdempotent: true,
    parameters: [
      {
        name: 'action',
        type: 'string',
        description: '操作类型：directory（获取目录）| search（搜索）| content（获取正文）',
        required: true,
        enum: ['directory', 'search', 'content'],
      },
      {
        name: 'keyword',
        type: 'string',
        description: '搜索关键词（action=search 时必填）',
        required: false,
      },
      {
        name: 'docKey',
        type: 'string',
        description:
          '文档标识（action=content 时必填，来自 directory 返回的 docKey 或 search 返回的 key）',
        required: false,
      },
    ],
  },

  async execute(args) {
    const { action, keyword, docKey } = args;

    try {
      // Step 1a: 获取文档目录树
      if (action === 'directory') {
        const res = await request('/ssc/v1/document', {
          method: 'GET',
        });
        return { success: true, data: Array.isArray(res) ? res : [] };
      }

      // Step 1b: 搜索文档
      if (action === 'search') {
        if (!keyword) {
          return { success: false, error: '搜索文档需要传入 keyword 参数' };
        }
        const res = await request('/ssc/v1/document/search', {
          method: 'POST',
          body: { keyWord: keyword },
        });
        return { success: true, data: Array.isArray(res) ? res : [] };
      }

      // Step 2: 获取文档正文（markdown）
      if (action === 'content') {
        if (!docKey) {
          return { success: false, error: '获取文档正文需要传入 docKey 参数' };
        }
        const markdown = await request('/ssc/v1/document/content', {
          method: 'POST',
          body: { menuName: docKey },
          responseType: 'text',
        });
        return { success: true, data: { content: markdown || '' } };
      }

      return { success: false, error: `未知 action: ${action}` };
    } catch (e) {
      return { success: false, error: `文档查询失败: ${e.message}` };
    }
  },

  presenter: {
    summarize: (result) => {
      if (Array.isArray(result?.data)) return `找到 ${result.data.length} 篇文档`;
      if (result?.data?.content) return '获取到文档正文';
      return '文档查询完成';
    },
    forHistory: (result) => {
      return {
        action: 'document',
        count: Array.isArray(result?.data) ? result.data.length : result?.data?.content ? 1 : 0,
      };
    },
  },
};

export function createDocQueryTool() {
  return createDeclarativeTool(docQueryDefinition);
}
