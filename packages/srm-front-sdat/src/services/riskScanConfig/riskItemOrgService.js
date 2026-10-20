import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchRemoveTenant: 删除租户
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchRemoveTenant(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/report-card-distributions/absent-card-list?page=-1`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

/**
 * 更新风险项
 * @param {*} params
 * @returns
 */
export async function fetchUpdateItem(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-items`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新风险项
 * @param {*} params
 * @returns
 */
export async function fetchNewUpdateItem(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-items/save-script`, {
    method: 'POST',
    body: params,
  });
}
