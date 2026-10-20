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
 * fetchThemeList: 查询主题列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchThemeList(params) {
  return request(`${params.fetchUrl}`, {
    method: 'GET',
    query: {
      ...params,
      fetchUrl: '',
    },
  });
}

/**
 * fetchTableList: 查询主题下 表列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchTableList(params) {
  return request(`${params.fetchTabsUrl}`, {
    method: 'GET',
    query: {
      ...params,
      fetchTabsUrl: '',
    },
  });
}

/**
 * removeData: 批量移除表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function removeData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/data-table-manages/batch-remove`, {
    method: 'DELETE',
    body: params,
  });
}
