/*
 * analysisReportService - 采购额分析报表
 * @date: 2019/12/30 10:42:43
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';

import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询报表列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchAnalysisReport(params) {
  const query = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/report`, {
    method: 'GET',
    query,
  });
}
