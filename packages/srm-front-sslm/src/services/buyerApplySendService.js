/**
 * model - 我发出的送样
 * @date: 2020-5-14
 * @author: ygg <gege.yao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 详情表单保存
 */
export async function handleFormSave(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/updateSendReq`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}
