/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-08-20 10:43:10
 * @LastEditTime: 2024-09-14 09:38:01
 * @Description: 发现商机service
 * @copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *
 * 查询会员身份
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryMemberShip(data) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx-header-vips/check`, {
    method: 'POST',
    body: data,
  });
}

/**
 *
 * 查询打印的文件UUID
 * @export
 * @param {Object} body - rfxHeaderVipId
 * @returns
 */
export async function queryPrintUuid(data) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx-header-vips/print/get-file`, {
    method: 'POST',
    body: data,
  });
}
