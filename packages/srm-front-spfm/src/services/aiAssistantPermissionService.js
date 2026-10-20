import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const isTenant = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

export async function fetchAiAssistantDetail(id) {
  return request(
    isTenant
      ? `${SRM_PLATFORM}/v1/${organizationId}/ai-assistant-permissions/${id}`
      : `${SRM_PLATFORM}/v1/ai-assistant-permissions/${id}`,
    {
      method: 'GET',
    }
  );
}

export async function saveAiAssistant(params) {
  return request(
    isTenant
      ? `${SRM_PLATFORM}/v1/${organizationId}/ai-assistant-permissions/save`
      : `${SRM_PLATFORM}/v1/ai-assistant-permissions/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}
