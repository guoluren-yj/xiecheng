/*
 * orderTypeOrgService - 采购订单类型维护
 * @date: 2018/10/13 11:22:17
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { SRM_SPUC, SRM_MDM, SRM_SRPM, SRM_SPRM, SRM_SIEC } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询订单类型定义列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryOrderTypeList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/order-type`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 查询需求类型维护列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryDemandTypeList(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-type`, {
    method: 'GET',
    query: { ...parseParameters(params), size: 0 }, // 不分页
  });
}

export async function addDemandType(params) {
  const { customizeUnitCode, ...other } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-type/save`, {
    method: 'POST',
    body: [other],
    query: { customizeUnitCode },
  });
}
export async function addOrderType(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/order-type`, {
    method: 'POST',
    body: [params],
  });
}
/**
 * 查询采购行类型维护列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryLineTypeList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/purchase-line-types`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询账户分配类别列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryAccountList(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/account-assign-types/page`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
export async function queryLineTypeDetail(params) {
  const { purchaseLineTypeId } = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/purchase-line-types/${purchaseLineTypeId}`, {
    method: 'GET',
  });
}
export async function addLineType(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/purchase-line-types/save`, {
    method: 'POST',
    body: params,
  });
}
export async function saveAccount(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/account-assign-types/save`, {
    method: 'POST',
    body: params,
  });
}
export async function queryFielsList(params) {
  const { accountAssignTypeId, ...query } = parseParameters(params);
  return request(
    `${SRM_SPRM}/v1/${organizationId}/account-assign-type-lines/${accountAssignTypeId}`,
    {
      method: 'GET',
      query,
    }
  );
}
export async function saveFielsList(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/account-assign-type-lines/save`, {
    method: 'POST',
    body: params,
  });
}

export async function queryCategory(params) {
  const query = parseParameters(params);
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/lov`, {
    method: 'GET',
    query,
  });
}

export async function queryCurrentCategory(params) {
  const { prTypeId } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-type-categorys/${prTypeId}`, {
    method: 'GET',
  });
}

// 查询可见角色
export async function queryCurrentRole(params) {
  const { prTypeId } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-type-roles/${prTypeId}`, {
    method: 'GET',
  });
}

// 需求计划类型明细
export async function queryRpTypeDetail(params) {
  const { rpTypeId, ...query } = parseParameters(params);
  return request(`${SRM_SRPM}/v1/${organizationId}/rp-type/detail/${rpTypeId}`, {
    method: 'GET',
    query,
  });
}

// 需求计划类型列表
export async function queryRpTypeList(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/rp-type/list`, {
    method: 'GET',
    query: { ...parseParameters(params), size: 0 }, // 不分页
  });
}

// 创建需求计划类型
export async function saveRpType(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/rp-type/save`, {
    method: 'POST',
    body: params,
  });
}

// 创建申请类型详情查询
export async function queryDemandTypeDetail(params) {
  const { prTypeId, ...query } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-type/${prTypeId}`, {
    method: 'GET',
    query,
  });
}

// 创建申请类型详情查询
export async function queryProTypeList(params) {
  const { ...query } = parseParameters(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-type`, {
    method: 'GET',
    query,
  });
}

// 创建需求计划类型
export async function saveProType(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SIEC}/v1/${organizationId}/project-type`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

// 创建申请类型详情查询
export async function queryProTypeDetail(params) {
  const { typeId, ...query } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/project-type/${typeId}`, {
    method: 'GET',
    query,
  });
}
