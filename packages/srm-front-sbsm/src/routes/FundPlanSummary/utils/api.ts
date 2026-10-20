import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, getCurrentTenant, getResponse } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

import { ActiveKey, DetailCustomizeCode } from './type';

const organizationId = getCurrentOrganizationId();
const { tenantId, tenantNum } = getCurrentTenant();

/**
 * @description:整单列表查询
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchFundPlanSumTotal(params: { activeKey: ActiveKey }) {
  const { activeKey } = params;
  const urlMap = {
    [ActiveKey.WholeAll]: `/sbdm/v1/${organizationId}/balance-headers/page/all`,
    [ActiveKey.WholeApprove]: `/sbdm/v1/${organizationId}/balance-headers/page/approve-able`,
    [ActiveKey.WholePending]: `/sbdm/v1/${organizationId}/balance-headers/page/submit-able`,
    [ActiveKey.DetailAll]: `/sbdm/v1/${organizationId}/balance-lines/list-all`,
  };
  const url = urlMap[activeKey];
  if (!url) return;
  return request(url, {
    method: 'POST',
    query: filterNullValueObject({ page: 0, size: 1, onlyCountFlag: 'Y' }),
    body: {},
  });
}

export async function fetchQuoteCreateTotal(params: { activeKey: string }) {
  const { activeKey } = params;
  const urlMap = {
    stageSum: `/sbdm/v1/${organizationId}/prep-pool-stages/page-balance-able`,
    sourceSum: `/sbdm/v1/${organizationId}/prep-pool-headers/page-balance-able`,
  };
  const url = urlMap[activeKey];
  if (!url) return;
  return request(url, {
    method: 'POST',
    query: filterNullValueObject({ page: 0, size: 1, onlyCountFlag: 'Y' }),
    body: {},
  });
}

export async function balHeaderHandle(type: string, body: object, query?: object) {
  let url = '';
  const options = {
    body,
    method: 'POST',
    query: filterNullValueObject({
      customizeUnitCode: [DetailCustomizeCode.BasicFormCode, DetailCustomizeCode.LineTableCode].join(),
      ...query,
    }),
  };
  switch (type) {
    case 'submitValidate':
      url = `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/valid/submit`;
      break;
    case 'formatLine':
      url = `/sbdm/v1/${getCurrentOrganizationId()}/balance-lines/associate-field-update`;
      break;
    case 'submitZeroLineValidate':
      url = `/sbdm/v1/${getCurrentOrganizationId()}/balance-lines/validate`;
      break;
    default:
  }
  return getResponse(await request(url, options));
};

export async function deleteBalLine(body) {
  return request(`/sbdm/v1/${organizationId}/balance-lines/cancel`, {
    method: 'POST',
    body,
  });
}

export async function getTableConfig() {
  const configCode = 'sbsm_tenant_bal_mode';
  return getResponse(request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum },
  }));
}

