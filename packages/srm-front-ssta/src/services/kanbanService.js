import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();
const prefix = `/ssta/v1/${organizationId}`;

export async function getSettleReport(query) {
  return request(`${prefix}/settle-report/record-count`, {
    method: 'GET',
    query,
  });
}
