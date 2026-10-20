/**
 * queryCall — 统一查询入口
 *
 * 当前仅支持 manual（文档查询）路由。业务查询子工具暂不可用。
 *
 * 设计原则：
 *   1. 减少 LLM 选择混淆 — 多个"查询"类工具语义相似，集中路由
 *   2. Token 节省 — 1 个工具定义 vs 多个独立工具
 *   3. 并行查询 — Promise.allSettled，独立容错
 *   4. 参数名与内部工具名分离 — 杜绝 LLM 直调子工具
 *
 * 内部路由（LLM 不可见）：
 *   kind="manual"  → 路由到 query_document ✅ 保持
 *   ❌ schema/records → 后续实现（2026-07-06），代码保留
 *
 * @date: 2026-07-06
 */

import logger from '../../utils/logger';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';
import { createDocQueryTool } from './docQuery';

/** 单次 queryCall 最大并行查询数 */
const MAX_PARALLEL_QUERIES = 5;

/** 各子工具的 execute 函数映射 — 仅保留 docQuery */
const SUB_TOOL_EXECUTORS = Object.freeze({
  query_document: createDocQueryTool(),
});

const queryCallDefinition = {
  metadata: {
    name: TOOL_NAMES.QUERY_CALL,
    type: 'query',
    description: `文档手册查询。两步流程：先 directory 或 search 获取目录，再 content 获取正文。
一次 tool_call 可并行发起多个 manual 请求，独立容错。`,
    purpose: `当用户需要查开发文档、帮助文档、API 参考时使用`,
    usage: `queries: [{kind: "manual", with: {action, docType, ids, keyword}}, ...]

## manual
文档手册查询。两步流程：先 directory 或 search 获取目录，再 content 获取正文。
action="directory" 获取文档目录树
action="search"    搜索文档（需 keyword）
action="content"   获取正文 markdown（需 docKey）
docType="dev"(默认) | "help"`,

    notes: `一次 tool_call 可并行多个 manual 请求，独立容错。最多 5 个 queries。需生成代码时务必查阅代码编写规范文档。`,

    isIdempotent: true,
    parameters: [
      {
        name: 'queries',
        type: 'array',
        description: `manual 查询列表，每项一个 manual 请求`,
        required: true,
        items: {
          type: 'object',
          properties: {
            kind: {
              type: 'string',
              description: '仅支持 manual（文档手册查询）',
            },
            with: {
              type: 'object',
              description: 'manual 查询参数：action/docType/docKey/keyword',
              properties: {
                action: {
                  type: 'string',
                  description: '操作：directory(获取目录) | search(搜索) | content(获取正文)',
                },
                docType: {
                  type: 'string',
                  description: '文档类型：dev(开发文档，默认) | help(帮助中心)',
                },
                docKey: {
                  type: 'string',
                  description:
                    '文档标识，action=content 时必填（来自 directory 或 search 返回的 docKey）',
                },
                keyword: {
                  type: 'string',
                  description: '搜索关键词，action=search 时必填',
                },
              },
              additionalProperties: false,
            },
          },
          required: ['kind', 'with'],
        },
      },
    ],
  },

  /**
   * 自定义验证：检查 queries 参数
   */
  validate(args) {
    const errors = [];
    if (!args.queries || !Array.isArray(args.queries)) {
      errors.push('queries 必须是数组');
      return { valid: false, errors };
    }
    if (args.queries.length > MAX_PARALLEL_QUERIES) {
      errors.push(`一轮最多传 ${MAX_PARALLEL_QUERIES} 个 queries`);
    }
    for (const q of args.queries) {
      if (q.kind !== 'manual') {
        errors.push(`不支持的 kind: "${q.kind}"，当前仅支持 manual`);
      }
    }
    return { valid: errors.length === 0, errors };
  },

  async execute(args) {
    // 防御性 JSON 解析
    let queriesRaw = args.queries;
    if (typeof queriesRaw === 'string') {
      try {
        queriesRaw = JSON.parse(queriesRaw);
      } catch (e) {
        return {
          success: false,
          error: `query_call 的 queries 参数为字符串但无法解析: ${queriesRaw}`,
        };
      }
    }
    const effectiveQueries = queriesRaw || [];
    const truncated = effectiveQueries.length > MAX_PARALLEL_QUERIES;
    const queries = effectiveQueries.slice(0, MAX_PARALLEL_QUERIES);

    if (queries.length === 0) {
      return { success: true, data: { content: [] } };
    }

    logger.info(
      'query_call 并行查询',
      { count: queries.length, kinds: queries.map((q) => q.kind).join(',') },
      { category: 'bot', component: 'queryCall' }
    );

    // Promise.allSettled 并行执行，独立容错
    const settledResults = await Promise.allSettled(
      queries.map(async (query, index) => {
        const { kind } = query;
        const withParams = query.with || {};

        // 根据 kind 确定内部工具名
        let internalName;
        if (kind === 'manual') {
          // manual 路由：统一走 query_document（复用 PG /ssc/v1/document 接口，支持 develop+help）
          internalName = 'query_document';
        } else {
          return {
            _tool: kind,
            _index: index,
            _with: withParams,
            success: false,
            error: `不支持的查询类别: ${kind}，当前仅支持 manual`,
          };
        }

        const executor = SUB_TOOL_EXECUTORS[internalName];
        if (!executor) {
          return {
            _tool: internalName,
            _index: index,
            _with: withParams,
            success: false,
            error: `未知子工具: ${internalName}`,
          };
        }

        try {
          const result = await executor.execute(withParams);
          return {
            _tool: internalName,
            _index: index,
            _with: withParams,
            success: result.success !== false,
            content: result.data,
            error: result.error,
          };
        } catch (e) {
          return {
            _tool: internalName,
            _index: index,
            _with: withParams,
            success: false,
            error: e.message,
          };
        }
      })
    );

    // 归一化结果
    const content = settledResults.map((r, i) => {
      if (r.status === 'fulfilled') {
        return r.value;
      }
      return {
        _tool: queries[i].kind,
        _index: i,
        _with: queries[i].with,
        success: false,
        error: r.reason?.message || '未知错误',
      };
    });

    // 截断通知：告知 LLM 有查询被丢弃（对齐 TG）
    if (truncated) {
      for (let i = MAX_PARALLEL_QUERIES; i < effectiveQueries.length; i++) {
        content.push({
          _tool: effectiveQueries[i].kind || 'unknown',
          _index: i,
          _with: effectiveQueries[i].with,
          success: false,
          error: `超出并行上限（≤${MAX_PARALLEL_QUERIES}），该请求未执行。请精简查询或将查询分批进行`,
        });
      }
    }

    return { success: true, data: { content } };
  },

  presenter: {
    summarize: (result) => {
      const items = result?.data?.content || [];
      const ok = items.filter((i) => i.success).length;
      const fail = items.length - ok;
      return `查询完成: ${ok} 成功${fail > 0 ? `, ${fail} 失败` : ''}`;
    },
    forHistory: (result) => {
      const items = result?.data?.content || [];
      return {
        total: items.length,
        succeeded: items.filter((i) => i.success).length,
        kinds: items.map((i) => i._tool),
      };
    },
  },
};

export function createQueryCallTool() {
  return createDeclarativeTool(queryCallDefinition);
}
