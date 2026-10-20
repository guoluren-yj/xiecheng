/**
 * 审核中心
 * @date: 2022-03-09
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchAudit: 审核数据列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAudit(params) {
  return request(`${SRM_DATA_SDAT}/v1/audit-center/batch-audit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchAuditLine: 审核数据列表 - 行数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAuditLine(params) {
  return request(`${SRM_DATA_SDAT}/v1/audit-center/audit`, {
    method: 'POST',
    body: params,
  });
}
