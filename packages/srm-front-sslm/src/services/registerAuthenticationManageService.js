/**
 * service - registerAuthenticationManageService
 * @date: 2024-04-23
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询注册策略历史版本
 */
export async function fetchHistoryVersion(params) {
  const { assignId, isPlatform = false, ...other } = params;
  const url = isPlatform
    ? `${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-basics/history/site/${assignId}`
    : `${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-basics/history/${assignId}`;
  return request(url, {
    method: 'POST',
    body: {},
    query: other,
  });
}
