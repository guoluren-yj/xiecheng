/**
 * monitorService
 * @author qingxiang.luo@going-link.com
 * @date 2022-09-07
 * @copyright 2022 © ZhenYun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 模糊匹配企业列表
 * @async
 * @function fetchCompanyList
 * @param {Object} params - 查询参数
 */
export async function fetchCompanyList(params) {
  // return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/credit-qcc/search`, {
  //   method: 'GET',
  //   query: params,
  // });
  return request(`${SRM_DATA_SDAT}/v1/common-platform/${getCurrentOrganizationId()}/fuzzy-search`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询订单状态
 * @async
 * @function fetchOrderStatus
 * @param {Object} params - 查询参数
 */
export async function fetchOrderStatus(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/credit-qcc/open-risk-scan-order`,
    {
      method: 'GET',
      query: params,
    }
  );
}
