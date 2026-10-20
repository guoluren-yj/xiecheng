/**
 * 数据表管理
 * @date: 2022-03-10
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';

/**
 * fetchUnBind: 订阅租户 解绑操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchUnBind(params) {
  return request(`${SRM_DATA_PROCESS}/v1/data-table-manages/unbind`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * fetchBatchRemove: 订阅租户 批量移除操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchBatchRemove(params) {
  return request(`${SRM_DATA_PROCESS}/v1/data-table-manages/batch-remove`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * fetchAllocateTenants: 给表批量分发租户
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAllocateTenants(params) {
  return request(`${SRM_DATA_PROCESS}/v1/data-table-manages/allocate-tenants`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchAllocateTables: 给租户批量分发表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAllocateTables(params) {
  return request(`${SRM_DATA_PROCESS}/v1/data-table-manages/allocate-tables`, {
    method: 'POST',
    body: params,
  });
}

/*
 * fetchSaveTableDesc: 保存表描述信息
 * @returns 请求Promise对象
 */
export async function fetchSaveTableDesc(params) {
  return request(`${SRM_DATA_PROCESS}/v1/meta-table/update`, {
    method: 'POST',
    body: params,
  });
}

/*
 * fetchSaveColumnDesc: 保存字段描述信息
 * @returns 请求Promise对象
 */
export async function fetchSaveColumnDesc(params) {
  return request(`${SRM_DATA_PROCESS}/v1/meta-table/update-column`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchCollection: 执行数据采集
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchCollection() {
  return request(`${SRM_DATA_PROCESS}/v1/meta-table/sync`, {
    method: 'GET',
  });
}

/**
 * getCollecStatus: 查询数据采集状态
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getCollecStatus() {
  return request(`${SRM_DATA_PROCESS}/v1/meta-table/sync-status`, {
    method: 'GET',
  });
}

/**
 * getMetaConfig: 获取数据表过滤信息
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getMetaConfig(params) {
  return request(`${SRM_DATA_PROCESS}/v1/meta-table/config/${params.metaId}`, {
    method: 'GET',
    query: params,
  });
}

/*
 * fatchSaveConfig: 保存配置信息
 * @returns 请求Promise对象
 */
export async function fatchSaveConfig(params) {
  return request(`${SRM_DATA_PROCESS}/v1/meta-table/save-table-config`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchLovConfig: 平台级获取值集视图头
 * @param {*} params
 * @returns
 */
export async function fetchLovConfig(params) {
  return request(`/hpfm/v1/lov-view-headers`, {
    method: 'GET',
    query: { ...params, enabledFlag: 1 },
  });
}

/**
 * changeSyncMode: 切换模式
 * @param {*} params
 * @returns
 */
export async function changeSyncMode(params) {
  return request(`${SRM_DATA_PROCESS}/v1/data-table-manages`, {
    method: 'PUT',
    body: params,
  });
}
