import request from 'utils/request';
import { Prefix, PrefixV2 } from '@/utils/globalVariable';

/**
 * 查询操作记录
 * @async
 */
export async function fetchOperationRecords(params) {
  const { organizationId, rfxHeaderId, ...otherPrams } = params;
  return request(`${Prefix}/${organizationId}/rfx/${rfxHeaderId}/actions`, {
    method: 'GET',
    query: { organizationId, size: 1000, ...otherPrams },
  });
}

// 查询操作记录v2
export async function fetchOperationRecord(params) {
  const { organizationId, rfxHeaderId, ...otherPrams } = params;
  return request(`${PrefixV2}/${organizationId}/rfx/${rfxHeaderId}/actions`, {
    method: 'GET',
    query: { organizationId, ...otherPrams },
  });
}

/**
 * 查询审批记录
 * @async
 */
export async function fetchApprovalRecords(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${Prefix}/${organizationId}/rfx/${rfxHeaderId}/approval-records`, {
    method: 'GET',
  });
}
