/*
 * @Description:
 * @Date: 2020-08-20 11:33:13
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
const organizationId = getCurrentOrganizationId();

/**
 * 获取详情
 */
export async function getDetail(settleConfigId) {
  return request(`/ssta/v1/${organizationId}/price-services/${settleConfigId}`, {
    method: 'GET',
  });
}

export async function savePricingModel(data, settleConfigId) {
  return request(`/ssta/v1/${organizationId}/price-services/${settleConfigId}`, {
    method: 'PUT',
    body: data,
  });
}
