import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';

/**
 * 销项发票池List表格
 * @param {Object} params - 查询参数
 */

const organizationId = getCurrentOrganizationId();
export async function queryList(params) {
  const { ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/output-invoice`, {
    method: 'GET',
    query,
  });
}
