import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * @description:项目视图列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchProjectTotal(params: { action: string }) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/sum-page-supplier`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', ...params },
  });
}

export async function getProjectInfo(projectHeaderId: string) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/detail/${projectHeaderId}`, {
    method: 'GET',
  });
}
