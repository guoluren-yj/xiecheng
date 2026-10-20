/**
 * consumeRecordOrgService - 消费明细 - service
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_CREDIT } from '_utils/config';

/**
 *查询消费明细详情
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchConsumeRecordOrg(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_CREDIT}/v1/${organizationId}/consume-records`, {
    method: 'GET',
    query: param,
  });
}
