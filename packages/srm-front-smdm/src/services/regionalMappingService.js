/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2023-08-15 15:29:29
 * @LastEditors: yanglin
 * @LastEditTime: 2023-10-25 16:43:20
 */
/**
 * service - 区域映射
 * @date: 2018-7-6
 * @version: 0.0.1
 * @author: YL <yang.lin05@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

// // 地区定义角色层级判断
// function platformApi() {
//   return isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : '';
// }

/**
 * 查询水平结构的地区
 * @param {number} countryId - 国家id
 * @param {object} query - 查询参数
 * @param {string} query.condition - 地区编码/名称
 * @param {page} query.page - 分页信息
 */
export function regionQueryLine(countryId, query) {
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/regional-mapping/list`, {
    method: 'GET',
    query: parseParameters({ ...query, countryId }),
  });
}

/**
 * 懒加载查询树结构地区
 * @param {number} countryId - 国家id
 * @param {string} regionId - 地区Id
 */
export function regionQueryLazyTree(countryId, regionId) {
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/regional-mapping/lazy-tree`, {
    method: 'GET',
    query: {
      regionId,
      countryId,
    },
  });
}
/**
 * 更新地区信息
 * @param {number} countryId - 国家id
 * @param {string} regionId - 地区Id
 * @param {object} body - 地区
 */
export function regionUpdate(body) {
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/regional-mapping`, {
    method: 'PUT',
    body,
  });
}

/**
 * 更新地区信息
 * @param {number} countryId - 国家id
 * @param {string} regionId - 地区Id
 * @param {object} body - 地区
 */
export function regionImport() {
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/regional-mapping`, {
    method: 'POST',
  });
}

// 获取是否新老租户
export function getIsOldTenant() {
  return request(
    `${SRM_MDM}/v1/${getCurrentOrganizationId()}/regional-mapping/code-historical-tenant`,
    {
      method: 'GET',
    }
  );
}

// 保存当前页面数据
export function saveCurrentData(body) {
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/countrys/save`, {
    method: 'POST',
    body,
  });
}
