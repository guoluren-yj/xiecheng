/*
 * appStoreService - 应用商城
 * @date: 2019/07/09
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询应用商店模块列表
 */
export async function fetchClientModule(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/module`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询应用商店服务列表
 */
export async function fetchClientService(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/product-service`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 添加购物车
 */
export async function addCart(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/shopping-carts`, {
    method: 'POST',
    body: params,
  });
}
