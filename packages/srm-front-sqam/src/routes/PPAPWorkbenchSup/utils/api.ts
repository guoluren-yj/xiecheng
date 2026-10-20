import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { campCode } from './type';

const organizationId = getCurrentOrganizationId();

/**
 * @description:项目视图列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchProjectTotal(params: { action: string }) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/page-supplier`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', ...params },
  });
}

/**
 * @description:交付物视图列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchDocumentTotal(params: { action: string }) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-documents/page-supplier`, {
    method: 'GET',
    query: filterNullValueObject({ page: 0, size: 1, onlyCountFlag: 'Y', operatorCamp: campCode, ...params }),
  });
}

/**
 * @description:阶段视图列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchStageTotal(params: { action: string }) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-stages/page-supplier`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', operatorCamp: 'SUPPLIER', ...params },
  });
}

// 操作记录
export async function fetchDetailRecord(id: string, type: string) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-${type}-actions/${id}`, {
    method: 'GET',
  });
}

export async function getProjectInfo(projectHeaderId: string) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/detail/${projectHeaderId}`, {
    method: 'GET',
  });
}
