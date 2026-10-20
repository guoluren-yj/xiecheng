import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();


export async function updateStep(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-template-headers/update-step`, {
    method: 'POST',
    body,
  });
}

export async function fetchTemplateHistory(query) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-template-headers/history/page`, {
    method: 'GET',
    query,
  });
}


export async function editTemplate(body) {
  const { templateId } = body;
  return request(`${SRM_SQAM}/v1/${organizationId}/access-template-headers/create/${templateId}`, {
    method: 'POST',
    body,
  });
}


export async function getTemplate(body) {
  const { templateId } = body;
  return request(`${SRM_SQAM}/v1/${organizationId}/access-template-headers/detail/${templateId}`, {
    method: 'GET',
  });
}

export async function enableTemplate(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-template-headers/enable`, {
    method: 'PUT',
    body,
  });
}

export async function releaseTemplate(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-template-headers/release`, {
    method: 'PUT',
    body,
  });
}
