import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 租户级银行服务
 */

/**
 * 查询租户级 的 银行信息
 * @param {Number} organizationId (组织id)
 * @param {Object} query 银行信息
 */
export async function updateFixedAssets(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/fixed-assets/sava`, {
    method: 'POST',
    body: { ...params },
  });
}
