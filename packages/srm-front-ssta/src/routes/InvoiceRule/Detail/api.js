import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const prefix = `${SRM_SSTA}/v1/${tenantId}`;

export async function fetchDirectTaxTips() {
  return request(`${prefix}/direct-tax-ctrl-headers/fetch/list`, {
    method: 'GET',
  });
}
