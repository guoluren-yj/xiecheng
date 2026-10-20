/**
 * creditInfoService - 认证信息展示 - service
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CREDIT } from '_utils/config';

/**
 *企业基本信息查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function queryCreditInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_CREDIT}/v1/${organizationId}/enterprise`, {
    method: 'GET',
    query: params,
  });
}
