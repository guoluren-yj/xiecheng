/**
 * ecAddressService - 地址 - service
 * @date: 2019-1-25
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SCEC } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 租户下公司数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCompanyId(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 收货地址数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcAddress(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/addresss/list`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 收货地址创建
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function addEcAddress(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/addresss`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 收货地址编辑
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function updateEcAddress(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/addresss`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *查询省市区
 * @export
 * @param {*} params
 * @returns
 */
export async function queryProvinceCity(params) {
  const { countryId } = params;
  return request(`${HZERO_PLATFORM}/v1/countries/${countryId}/regions`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 动态查询地区
 * @param {*} params
 * @returns
 */
export async function loadCityData(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/addresss/regional-linkage`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询公司详情
 * @param {*} params
 * @returns
 */
export async function fetchCompanyDetail(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/addresss/list-company`, {
    method: 'GET',
    query: param,
  });
}
