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
 * 查询订单是否开通
 * @async
 * @function fetchOrderStatus
 * @param {Object} params - 查询参数
 */
export async function fetchOrderStatus(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/page-field-relation/field-service-open`,
    {
      method: 'GET',
      query: { ...params },
    }
  );
}
