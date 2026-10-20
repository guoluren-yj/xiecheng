/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-06-07 13:59:50
 * @LastEditors: yanglin
 * @LastEditTime: 2023-06-08 09:40:24
 */
/**
 * entityDefineService.js
 * 结构定义
 * @date: 2020-08-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_ADAPTOR } from '_utils/config';
/**
 * 保存结构定义
 * @param {Object} params
 */
export async function savaEntityDefineData(params) {
  return request(`${SRM_ADAPTOR}/v1/adaptor-entity-structures`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除结构定义
 * @param {Object} params
 */
export async function deleteEntityDefineData(params) {
  return request(`${SRM_ADAPTOR}/v1/adaptor-entity-structures`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 更新结构定义
 * @param {Object} params
 */
export async function updateEntityDefineData(params) {
  return request(`${SRM_ADAPTOR}/v1/adaptor-entity-structures`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 导入结构定义
 * @param {Object} params
 */
export async function importEntityDefineData(params) {
  return request(`${SRM_ADAPTOR}/v1/adaptor-entity-structures/json-parse`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 导入完整结构定义
 * @param {Object} params
 */
export async function importFullEntityDefineData(params) {
  return request(`${SRM_ADAPTOR}/v1/adaptor-entity-structures/import`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 根据编码查询单条结构头信息
 * @param {Object} params
 */
export async function queryEntityDefineData(params) {
  return request(`${SRM_ADAPTOR}/v1/adaptor-entity-structures/${params.structureCode}`, {
    method: 'GET',
  });
}
