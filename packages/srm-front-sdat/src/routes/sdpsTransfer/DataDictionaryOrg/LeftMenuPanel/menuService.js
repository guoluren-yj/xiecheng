/**
 * 左侧 menu 组件接口请求
 * @date: 2022-03-04
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * fetchList: 查询数据列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchList(params) {
  return request(`${params.fetchUrl}`, {
    method: 'GET',
    query: {
      ...params,
      fetchUrl: '',
      size: 30,
    },
  });
}

/**
 * fetchOrderStatus: 查询是否开通订单
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchOrderStatus(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/data-table-manages/verify-service`, {
    method: 'GET',
    query: params,
  });
}
