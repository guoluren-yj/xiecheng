/**
 * externalSystemsService - 外部系统定义 - service
 * @date: 2018-09-06
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_INTERFACE_CONFIG } from '_utils/config';

/**
 * 查询单个独立值集值
 * @param {String} params
 */
export async function queryIdpValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: {
      lovCode: params.code,
    },
  });
}

/**
 *外部系统定义数据查询
 *
 * @export
 * @param {Object} params 外部系统定义展示数据
 */
export async function querySystems(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/external-systems`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询公司信息
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 */
export async function queryCompany(params) {
  return request(`${HZERO_PLATFORM}/v1/companies`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存外部系统信息
 * @param {Object} params - 查询参数
 */
export async function saveSystems(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/external-systems`, {
    method: 'POST',
    body: params,
  });
}

/**
 *查询已经分配的公司
 *
 * @export
 * @param {Object} params 公司数据
 */
export async function queryCheckedCompany(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-company`, {
    method: 'GET',
    query: params,
  });
}

/**
 *分配公司
 *
 * @export
 * @param {Object} params 分配的公司数据
 */
export async function addCompany(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-company`, {
    method: 'POST',
    body: params,
  });
}

/**
 *取消分配公司
 *
 * @export
 * @param {Object} params 取消分配的公司数据
 */
export async function removeCompany(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-company`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询业务实体信息
 * @param {Object} params - 查询参数
 */
export async function queryUnitOptions(params) {
  return request(`${HZERO_PLATFORM}/v1/operation-units/not-page`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询已经分配的业务实体
 *
 * @export
 * @param {Object} params
 */
export async function queryCheckedUnitOptions(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-ou`, {
    method: 'GET',
    query: params,
  });
}

/**
 *分配业务实体
 *
 * @export
 * @param {Object} params 分配的业务实体数据
 */
export async function addUnitOptions(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-ou`, {
    method: 'POST',
    body: params,
  });
}

/**
 *取消分配业务实体
 *
 * @export
 * @param {Object} params 取消分配的业务实体数据
 */
export async function removeUnitOptions(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-ou`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询接口信息
 * @param {Object} params - 查询接口参数
 */
export async function queryInterface(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/interfaces/no-page`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询已经分配的接口数据
 *
 * @export
 * @param {Object} params 查询接口参数
 */
export async function queryCheckedInterface(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-interface`, {
    method: 'GET',
    query: params,
  });
}

/**
 *分配接口数据
 *
 * @export
 * @param {Object} params 分配的接口参数
 */
export async function addInterface(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-interface`, {
    method: 'POST',
    body: params,
  });
}

/**
 *取消分配接口数据
 *
 * @export
 * @param {Object} params 取消分配的接口数据
 */
export async function removeInterface(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/ex-assgin-interface`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *关联租户查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchRelationData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/es-relations`, {
    method: 'GET',
    query: params,
  });
}

/**
 *保存关联租户
 *
 * @export
 * @param {Object} params 保存租户数据
 */
export async function saveRelationData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/es-relations`, {
    method: 'POST',
    body: params,
  });
}

/**
 *查询关联服务数据
 *
 * @export
 * @param {Object} params 查询服务参数
 */
export async function fetchESService(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/es-service`, {
    method: 'GET',
    query: params,
  });
}

/**
 *保存关联服务数据
 *
 * @export
 * @param {Object} params 要保存的服务数据
 */
export async function saveESService(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/es-service`, {
    method: 'POST',
    body: params,
  });
}

/**
 *查询外部系统详情信息
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchESInfo(params) {
  return request(
    `${SRM_INTERFACE_CONFIG}/v1/external-systems/detail/${params.externalSystemCode}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 刷新缓存
 * @export
 */
export async function refreshCache(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/external-systems/refresh-cache`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询密钥
 */
export async function fetchPublickKey(params) {
  const { keySize } = params;
  return request(`${SRM_INTERFACE_CONFIG}/v1/external-systems/generate-key/${keySize}`, {
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 绑定客户端 - 保存
 */
export async function fetchClientSave(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/es-assign-clients`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 绑定客户端 - 删除
 */
export async function fetchClientDelete(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/es-assign-clients`, {
    method: 'DELETE',
    body: params,
  });
}
