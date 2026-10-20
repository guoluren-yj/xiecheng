/*
 * @Description:
 * @Date: 2020-08-19 14:31:54
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SPRM}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 保存
 * @param {单条数据DTO} Object
 */
export async function save(data) {
  return request(`${prefix}/${organizationId}/budget-item`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 引用预定义预算维度
 * @param {单条数据DTO} Object
 */
export async function quotePredefined(data) {
  return request(`${prefix}/${organizationId}/budget-item/quote/predefined`, {
    method: 'POST',
    body: data,
  });
}
