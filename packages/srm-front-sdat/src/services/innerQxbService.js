import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

import { getCurrentOrganizationId } from 'utils/utils'; // filterNullValueObject

const organizationId = getCurrentOrganizationId();

/**
 * 获取内嵌页面链接
 * @async
 * @function fetchInnerUrl
 */
export async function fetchInnerUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/credit-qxb/get-redirect-url`, {
    method: 'GET',
    query: params,
  });
}
