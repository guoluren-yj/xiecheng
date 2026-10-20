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
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/page`, {
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
  return request(`${SRM_SQAM}/v1/${organizationId}/access-documents/page`, {
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
  return request(`${SRM_SQAM}/v1/${organizationId}/access-stages/page`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', operatorCamp: 'PURCHASER', ...params },
  });
}

// 操作记录
export async function fetchDetailRecord(id: string, type: string, query?: any) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-${type}-actions/${id}`, {
    method: 'GET',
    query,
  });
}

export async function getProjectInfo(projectHeaderId: string) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/detail/${projectHeaderId}`, {
    method: 'GET',
  });
}

export async function fetchApprovalData(query: Record<'primaryId' | 'documentType', any>) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-actions/approval-record`, {
    method: 'GET',
    query,
  });
}

export async function copyProject(projectHeaderId: string, customizeUnitCode: string) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/copy?customizeUnitCode=${customizeUnitCode}`, {
    method: 'POST',
    body: {
      projectHeaderId,
    },
  });
}

export async function changeProjectBefore(projectHeaderId: any) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/bak`, {
    method: 'POST',
    body: [{
      projectHeaderId,
    }],
  });
}

export async function reSyncProject(body: any) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-project-headers/sync`, {
    method: 'POST',
    body,
  });
}


