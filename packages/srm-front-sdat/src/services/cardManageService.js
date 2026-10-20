/**
 * 卡片管理
 * @date: 2022-08-09
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchEnabledCard: 卡片禁用启用操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchEnabledCard(params) {
  const url = params.enabledFlag
    ? `${SRM_DATA_SDAT}/v1/report-cards/enable`
    : `${SRM_DATA_SDAT}/v1/report-cards/disable`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}

/**
 * fetchRemoveTenant: 删除租户
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchRemoveTenant(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-card-distributions/absent-card-list?page=-1`, {
    method: 'DELETE',
    body: params,
  });
}
