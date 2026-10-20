/*
 * investigationReceivedService - 我收到的调查表
 * @date: 2018/10/13 10:53:21
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
export async function fetchReceivedList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/received`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
export async function fetchReceivedInvestigationDetail(params) {
  const { investgHeaderId, ...query } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/detail/${investgHeaderId}`, {
    method: 'GET',
    query,
  });
}
