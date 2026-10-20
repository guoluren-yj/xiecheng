/*
 * investigationDetailMaintainService - 调查表明细维护
 * @date: 2018/10/13 10:41:17
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
export async function fetchInvestigationDetail(params) {
  const { desensitize = false } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${params.investgHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode: params.customizeUnitCode, desensitize },
  });
}
export async function handleRelease(params = {}) {
  const { customizeUnitCode = '', ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/release`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body,
  });
}
export async function handleDelete(params) {
  const { customizeUnitCode, investigateHeaderIdList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate`, {
    method: 'DELETE',
    body: investigateHeaderIdList,
    query: {
      customizeUnitCode,
    },
  });
}
export async function handleSave(params = {}) {
  const { customizeUnitCode = '', ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate`, {
    method: 'PUT',
    query: {
      customizeUnitCode,
    },
    body,
  });
}
