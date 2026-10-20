/**
 * 数据表管理
 * @date: 2022-03-10
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_PROCESS } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * fetchOrderStatus: 查询是否开通订单
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchOrderStatus(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/verify-service`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getPendingCount: 获取待审批总数
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getPendingCount(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/pending-count`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getRejectedCount: 获取拒绝总数
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getRejectedCount(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/reject-count`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getAllCount: 获取订阅总数
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getAllCount(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/subscribed-count`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getMetaConfig: 获取数据表过滤信息
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getMetaConfig(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/config/${params.metaId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * saveSubscribeTopic: 保存主题订阅
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function saveSubscribeTopic(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/subscribe-topic`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchLovConfig: 租户级获取值集视图头
 * @param {*} params
 * @returns
 */
export async function fetchLovConfig(params) {
  return request(`/hpfm/v1/${organizationId}/lov-view-headers`, {
    method: 'GET',
    query: { ...params, enabledFlag: 1, page: -1 },
  });
}

// /**
//  * fetchLovConfigPlatform: 平台级获取值集视图头
//  * @param {*} params
//  * @returns
//  */
// export async function fetchLovConfigPlatform(params) {
//   return request(`/hpfm/v1/lov-view-headers`, {
//     method: 'GET',
//     query: { ...params, enabledFlag: 1, page: -1 },
//   });
// }
