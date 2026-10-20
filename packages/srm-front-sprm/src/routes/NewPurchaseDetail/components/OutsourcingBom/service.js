import { SRM_SPRM } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function deleteLine(params) {
  return request(`${SRM_SPRM}/v1/${getCurrentOrganizationId()}/pr-line-bom`, {
    body: params,
    method: 'DELETE',
  });
}

export async function deleUpdateAll(params) {
  const { prLineId, ...query } = params;
  return request(
    `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/pr-line-bom/delete_by_prline/${prLineId} `,
    {
      query,
      method: 'DELETE',
    }
  );
}
