/**
 * interfaceDefService - 接口定义 - service 平台级
 * @date: 2018-09-09
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG, SRM_INTERFACE } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const isLevelFlag = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

/**
 * 接口定义数据创建、编辑
 * @export
 * @param {object} params 创建、编辑参数
 * @returns
 */
export async function updateInterfaces(params) {
  return request(
    isLevelFlag
      ? `${SRM_INTERFACE}/v1/${organizationId}/interfaces`
      : `${SRM_INTERFACE_CONFIG}/v1/interfaces`,
    {
      method: 'POST',
      body: params,
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
  const { param, method } = params;
  return request(
    !isLevelFlag
      ? `${SRM_INTERFACE_CONFIG}/v1/keyword-configs`
      : `${SRM_INTERFACE}/v1/${organizationId}/keyword-configs`,
    {
      method,
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
  return request(
    !isLevelFlag
      ? `${SRM_INTERFACE_CONFIG}/v1/keyword-configs/cache-refresh`
      : `${SRM_INTERFACE}/v1/${organizationId}/keyword-configs/cache-refresh`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 引用云级接口数据
 * @export
 * @param {object} params 云级数据
 */
export async function quoteInterface() {
  return request(`${SRM_INTERFACE}/v1/${organizationId}/interfaces/quote`, {
    method: 'POST',
  });
}

/**
 * Marmot脚本
 * @export
 * @param {object} params 保存
 */
export async function optionsMarmot(parmas) {
  const { method, param } = parmas;
  return request(
    isLevelFlag
      ? `${SRM_INTERFACE}/v1/${organizationId}/itf-def-rel-marmots`
      : `${SRM_INTERFACE_CONFIG}/v1/itf-def-rel-marmots`,
    {
      method,
      body: param,
    }
  );
}
