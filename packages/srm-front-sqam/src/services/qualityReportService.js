/*
 * qualityReportService - 质量报表
 * @date: 2020/01/14
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SQAM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// -获取列表数据
export async function queryList(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/qualityReport/list`, {
    query: parseParameters(params),
  });
}

// -获取检验批次明细数据
export async function queryInspectionLotList(params) {
  const { inspectionId, ...query } = parseParameters(params);
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/reportDetail`, {
    method: 'GET',
    query,
  });
}
