/**
 * model - 送样申请查询采
 * @date: 2021-6-15
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询选中单据上次操作时间是否超过7天
export async function sampleCheckLastOperationTime(payload) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/check_last_operation_time`, {
    method: 'POST',
    body: payload,
  });
}
