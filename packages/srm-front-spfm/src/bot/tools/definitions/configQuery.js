/**
 * configQuery — 配置/常量查询工具
 *
 * 查询 STD 常量、环境变量、高级选项、Marmot 配置。
 *
 * 后端：POST /v1/bot/configs/query
 *
 * 数据范围：
 *   - constants: sada_marmot_constants (RelTable) — STD 常量
 *   - envvars: marmot_global_environment_variable (RelTable) — 环境变量
 *   - advancedOptions: srm_advanced_options — 高级选项
 *   - marmotConfig: marmot_config — Marmot 配置
 *
 * @date: 2026-06-12
 */

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { createDeclarativeTool } from '../declarativeTool';
import { TOOL_NAMES } from '../../types';

const configQueryDefinition = {
  metadata: {
    name: TOOL_NAMES.CONFIG_QUERY,
    type: 'query',
    description: '查询 STD 常量、环境变量、高级选项、Marmot 配置',
    purpose: '当需要查看系统常量定义、环境变量值、配置项时使用',
    usage:
      '传入 scope 指定查询范围（constants/envvars/advancedOptions/marmotConfig），可传 keyword 筛选',
    notes: '常量是只读数据，不可修改。不同 scope 查询不同的底层数据表',
    isIdempotent: true,
    parameters: [
      {
        name: 'scope',
        type: 'string',
        description:
          '查询范围：constants（常量）、envvars（环境变量）、advancedOptions（高级选项）、marmotConfig（Marmot 配置）',
        required: true,
        enum: ['constants', 'envvars', 'advancedOptions', 'marmotConfig'],
      },
      {
        name: 'keyword',
        type: 'string',
        description: '搜索关键字，匹配配置编码或名称',
        required: false,
      },
      {
        name: 'code',
        type: 'string',
        description: '精确编码（查单个配置项）',
        required: false,
      },
    ],
  },

  async execute(args) {
    const { scope, keyword, code } = args;

    try {
      const res = await request('/sada/v1/bot/configs/query', {
        method: 'POST',
        body: JSON.stringify({ scope, keyword: keyword || '', code: code || '' }),
      });

      const data = getResponse(res);
      return {
        success: true,
        data: data || { configs: [], total: 0 },
      };
    } catch (e) {
      return {
        success: false,
        error: `配置查询失败: ${e.message}`,
        data: { configs: [], total: 0 },
      };
    }
  },

  presenter: {
    summarize: (result) => {
      const total = result?.data?.total || 0;
      if (total > 0) return `找到 ${total} 条配置`;
      return '未找到匹配的配置';
    },
  },
};

export function createConfigQueryTool() {
  return createDeclarativeTool(configQueryDefinition);
}
