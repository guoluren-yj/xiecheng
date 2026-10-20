/*
 * moduleManageService -模块管理
 * @date: 2019/07/02
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询应用商店模块列表
 */
export async function fetchClientModule(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/products`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询模块下已分配服务列表
 */
export async function fetchExistentService(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/products/modules-services/existent`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询模块下未分配服务列表
 */
export async function fetchNoExistentService(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/client/products/modules-services/non-existent`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 添加服务
 */
export async function addService(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/products/modules-services-add`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 删除服务
 */
export async function removeService(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/products/modules-services-cancel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存模块
 */
export async function saveModule(params) {
  const { modules } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/products`, {
    method: 'POST',
    body: modules,
  });
}
