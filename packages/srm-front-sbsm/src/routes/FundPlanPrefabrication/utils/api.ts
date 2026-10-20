import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, getCurrentTenant, getResponse } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

import { ActionType } from './type';

const organizationId = getCurrentOrganizationId();
const { tenantId, tenantNum } = getCurrentTenant();

/**
 * @description:来源视图列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchASourceTotal(params: { action: string }) {
  const { action } = params;
  const urls = {
    [ActionType["source-all"]]: `/sbdm/v1/${organizationId}/prep-pool-headers/page-all`,
    [ActionType["source-compile"]]: `/sbdm/v1/${organizationId}/prep-pool-headers/page-prep-able`,
    [ActionType["source-summary"]]: `/sbdm/v1/${organizationId}/prep-pool-headers/page-balance-able`,
    [ActionType["source-lines"]]: `/sbdm/v1/${organizationId}/prep-pool-lines/page-all`,
    [ActionType["source-error"]]: `/sbdm/v1/${organizationId}/prep-pool-errors/page-all`,
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
 * @description:阶段视图列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchStageTotal(params: { action: string }) {
  const { action } = params;
  const urls = {
    [ActionType["stage-all"]]: `/sbdm/v1/${organizationId}/prep-pool-stages/page-all`,
    [ActionType["stage-compile"]]: `/sbdm/v1/${organizationId}/prep-pool-stages/page-prep-able`,
    [ActionType["stage-summary"]]: `/sbdm/v1/${organizationId}/prep-pool-stages/page-balance-able`,
  };
  const url = urls[action];
  if (!url) return;
  return request(url, {
    method: 'POST',
    query: { page: 0, size: 1, onlyCountFlag: 'Y' },
    body: {},
  });
}


export async function getTableConfig(type) {
  const configCode = type === 'stage-compile' ? 'sbsm_tenant_prep_mode' : 'sbsm_tenant_bal_mode';
  return getResponse(request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum },
  }));
}
