/**
 * interfaceDefService - 接口定义 - service 平台级
 * @date: 2018-09-09
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG, SRM_INTERFACE } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const isLevelFlag = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

/**
 * 接口定义数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchInterfaceDef(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/interfaces`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 接口定义数据创建、编辑
 * @export
 * @param {object} params 创建、编辑参数
 * @returns
 */
export async function updateInterfaces(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/interfaces`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 接口定义-关键字配置查询【平台】
 * @export
 * @param {object} params 查询
 * @returns
 */
export async function fetchKeywordConfig(params) {
  const param = parseParameters(params);
  return request(
    !isLevelFlag
      ? `${SRM_INTERFACE}/v1/keyword-configs`
      : `${SRM_INTERFACE}/v1/${organizationId}/keyword-configs`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 接口定义-关键字配置保存、删除【平台】
 * @export
 * @param {object} params 保存、删除
 * @returns
 */
export async function optionsKeywordConfig(params) {
  const { param } = params;
  return request(
    !isLevelFlag
      ? `${SRM_INTERFACE}/v1/keyword-configs`
      : `${SRM_INTERFACE}/v1/${organizationId}/keyword-configs`,
    {
      method: params.method,
      body: param,
    }
  );
}

/**
 * 接口定义-关键字配置重新加载【平台】
 * @export
 * @param {object} params 重新加载
 * @returns
 */
export async function fetchReload(params) {
  const { newList } = params;
  return request(
    !isLevelFlag
      ? `${SRM_INTERFACE}/v1/keyword-configs/cache-refresh`
      : `${SRM_INTERFACE}/v1/${organizationId}/keyword-configs/cache-refresh`,
    {
      method: 'POST',
      body: newList,
    }
  );
}
