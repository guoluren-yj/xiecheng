import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const isTenant = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

export async function fetchDigitalEmployeeDetail(digitalEmployeeInfoId) {
  return request(
    isTenant
      ? `${SRM_PLATFORM}/v1/${organizationId}/digital-employee-infos/detail/${digitalEmployeeInfoId}`
      : `${SRM_PLATFORM}/v1/digital-employee-infos/detail/${digitalEmployeeInfoId}`,
    {
      method: 'GET',
    }
  );
}

export async function saveDigitalEmployee(params) {
  return request(
    isTenant
      ? `${SRM_PLATFORM}/v1/${organizationId}/digital-employee-infos/save`
      : `${SRM_PLATFORM}/v1/digital-employee-infos/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function deleteDigitalEmployee(digitalEmployeeInfoId) {
  return request(
    isTenant
      ? `${SRM_PLATFORM}/v1/${organizationId}/digital-employee-infos/${digitalEmployeeInfoId}`
      : `${SRM_PLATFORM}/v1/digital-employee-infos/${digitalEmployeeInfoId}`,
    {
      method: 'DELETE',
    }
  );
}

export async function startDigitalEmployee(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/digital-employee-infos/execute-dify-agent`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

export async function fetchDigitalEmployeeChatList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/digital-employee-infos/chat-list`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchDigitalEmployeeChatDetail(chatId) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/digital-employee-infos/chat-detail/${chatId}`,
    {
      method: 'GET',
    }
  );
}

export async function fetchDigitalEmployeeManualList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/digital-employee-infos/handle-list`, {
    method: 'GET',
    query: params,
  });
}
