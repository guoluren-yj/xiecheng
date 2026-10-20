import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, getCurrentTenant, getResponse } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

import { ActionType } from './type';

const organizationId = getCurrentOrganizationId();
const { tenantId, tenantNum } = getCurrentTenant();

/**
 * @description:整单列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchWholeTotal(params: { action: string }) {
  const { action } = params;
  const urls = {
    [ActionType["whole-all"]]: `/sbdm/v1/${organizationId}/prep-headers/list`,
    [ActionType["whole-pending"]]: `/sbdm/v1/${organizationId}/prep-headers/list-submit-able`,
    [ActionType["whole-approve"]]: `/sbdm/v1/${organizationId}/prep-headers/list-approve-able`,
  };
  const url = urls[action];
  if (!url) return;
  return request(url, {
    method: 'POST',
    query: filterNullValueObject({ page: 0, size: 1, onlyCountFlag: 'Y' }),
    body: {},
  });
}

/**
 * @description:明细查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchDetailTotal() {
  return request(`/sbdm/v1/${organizationId}/prep-lines/list/all`, {
    method: 'POST',
    query: { page: 0, size: 1, onlyCountFlag: 'Y' },
    body: {},
  });
}


export async function deletePrepLine(body) {
  return request(`/sbdm/v1/${organizationId}/prep-lines/cancel`, {
    method: 'POST',
    body,
  });
}


export async function deletePrep(body) {
  return request(`/sbdm/v1/${organizationId}/prep-headers/delete`, {
    method: 'POST',
    body,
  });
}
export async function getTableConfig() {
  const configCode = 'sbsm_tenant_prep_mode';
  return getResponse(request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum },
  }));
}
