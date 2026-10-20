/**
 * ecAddressService - 地址 - service
 * @date: 2019-1-25
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 租户下公司数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCompanyId(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/user-authority-data/company`, {
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
  // return request(`${SRM_MALL}/v1/${organizationId}/addresss/invoice/merge`, {
  return request(
    params.belongType === 0
      ? `${SRM_MALL}/v1/${organizationId}/addresss/invoice/merge`
      : `${SRM_MALL}/v1/${organizationId}/addresss/list`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 收货地址创建
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function addEcAddress(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/addresss`, {
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
  return request(`${SRM_MALL}/v1/${organizationId}/addresss`, {
    method: 'POST',
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
  // console.log(params);
  // const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/mall-regions/${organizationId}/Subordinate`, {
    method: 'GET',
    query: { ...params, page: -1 },
  });
}

/**
 * 查询国家列表
 * @param {*} params
 * @returns
 */
export async function loadNationData(params) {
  return request(`${SRM_MALL}/v1/mall-regions/${organizationId}/country-list-by-config`, {
    method: 'GET',
    query: { ...params },
  });
}

// 是否勾选个人收货地址配置
export function queryComOrPersonRuleService() {
  const url = `${SRM_PLATFORM}/v1/${organizationId}/settings/011023`;
  return request(url, {
    method: 'GET',
  });
}

// 默认收货地址配置查询
export async function fetchCompanyDetail(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/addresss/list-default-address`, {
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
export async function fetchAllDeliveryAddress(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/addresss/list/choose`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 收货地址编辑
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function updateCompanyDetail(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/addresss/default`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询默认的是否按库存组织屏蔽状态
 * @export
 * @param {object} params
 * @returns
 */
export async function queryShieldStatus(params) {
  return request(`/spfm/v1/${organizationId}/rel-table-records/smal_address_filter_invorg/list`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 开启按库存组织屏蔽
 * @export
 * @param {object} params
 * @returns
 */
export async function openShield(params) {
  return request(`/spfm/v1/${organizationId}/rel-table-records/smal_address_filter_invorg`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 关闭按库存组织屏蔽状态
 * @export
 * @param {object} params
 * @returns
 */
export async function closeShield(params) {
  return request(`/spfm/v1/${organizationId}/rel-table-records/smal_address_filter_invorg`, {
    method: 'DELETE',
    body: params,
  });
}
