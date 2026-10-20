/*
 * addressService - 企业注册/地址信息
 * @date: 2018/10/13 10:42:43
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';

import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
/**
 * 查询国家定义列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchCountryData(params) {
  return request(`${HZERO_PLATFORM}/v1/countries`, {
    method: 'GET',
    query: params,
  });
}
/**
 *查询省市区
 * @export
 * @param {*} params
 * @returns
 */
export async function queryProvinceCity(params) {
  return request(`${HZERO_PLATFORM}/v1/countries/${params.countryId}/regions`, {
    method: 'GET',
    query: params,
  });
}
/**
 *查询地址列表
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAddressList(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/addresses/${params.companyId}`, {
      method: 'GET',
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/addresses/${params.companyId}`, {
      method: 'GET',
    });
  }
}

/**
 *保存地址列表
 * @export
 * @param {*} params
 * @returns
 */
export async function saveAddressList(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/addresses/${params.companyId}`, {
      method: 'POST',
      body: params.companyAddressList,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/addresses/${params.companyId}`, {
      method: 'POST',
      body: params.companyAddressList,
    });
  }
}

/**
 * 删除地址
 * @param {!Number} companyId 公司Id
 */
export async function deleteAddressList(payload) {
  const { deleteRows, companyId } = payload;
  return request(`${SRM_PLATFORM}/v1/companies/addresses/${companyId}/batch-delete`, {
    method: 'DELETE',
    body: deleteRows,
  });
}
