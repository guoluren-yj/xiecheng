/*
 * @Description:
 * @Date: 2020-07-24 10:26:19
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `/sbdm/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 重推异常
 * @param {勾选数据} list
 */
export async function rePushAbnormal(list) {
  return request(`${prefix}/${organizationId}/budget-account/repush`, {
    method: 'POST',
    body: list,
  });
}


/**
 * 异常已处理
 * @param {勾选数据} list
 */
export async function handledAbnormal(list) {
    return request(`${prefix}/${organizationId}/budget-account/handled`, {
      method: 'POST',
      body: list,
    });
};