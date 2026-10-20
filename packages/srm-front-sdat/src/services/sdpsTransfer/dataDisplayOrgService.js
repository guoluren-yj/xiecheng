/**
 * 数据看板 租户级
 * @date: 2022-02-15
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * getTaskStatistics: 获取统计信息
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getTaskStatistics(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/monitor-analysis/latest-task-statistics`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getDataList: 获取列表记录
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getDataList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/monitor-analysis/task-details-list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getOpenService: 获取列表记录
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getOpenService(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/monitor-analysis/get-open-service`, {
    method: 'GET',
    query: params,
    // responseType: 'text',
  });
}

/**
 * getStatisticsData: 查询文件同步统计信息(平台级)
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getStatisticsData(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${organizationId}/monitor-analysis/seep-invoke/${params.ruleCode}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * getFileDataList: 查询文件同步明细信息(平台级)
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getFileDataList(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${organizationId}/monitor-analysis/seep-invoke/${params.ruleCode}`,
    {
      method: 'GET',
      query: params,
    }
  );
}
