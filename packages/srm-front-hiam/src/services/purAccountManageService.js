import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 保存分配的角色
 * @param {Number} organizationId 租户id
 * @param {String} params 其他参数
 */
export async function saveBatchAssign(params) {
  return request(`${HZERO_IAM}/v1/${organizationId}/supplier-user/role/batch-assign`, {
    method: 'POST',
    body: params,
  });
}
