import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchSendInvestigationList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/sending`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

export async function investigationTemplateHeaderQueryAll(investigateTemplateId) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate-confighs-preview/${investigateTemplateId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 校验调查表
 */
export async function checkInvestigation(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/hintFlag`, {
    method: 'POST',
    body: params,
  });
}

/*
 * 详情导出
 */
export async function handleDetailExport(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/sending/detailExport`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

/**
 * 取消
 */
export async function handleCancel(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/cancel`, {
    method: 'POST',
    body: params,
  });
}
