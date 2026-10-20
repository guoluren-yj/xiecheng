import request from 'utils/request';
import { Prefix } from '@/utils/globalVariable';

/**
 * 查询操作记录
 * @async
 */
export async function fetchOperationRecords(params) {
  const { organizationId, sourceProjectId, ...otherPrams } = params;
  return request(`${Prefix}/${organizationId}/source-projects/${sourceProjectId}/actions`, {
    method: 'GET',
    query: { organizationId, ...otherPrams },
  });
}

/**
 * 查询审批记录
 * @async
 */
export async function fetchApprovalRecords(params) {
  const { organizationId, sourceProjectId } = params;
  return request(
    `${Prefix}/${organizationId}/source-projects/${sourceProjectId}/approval-records`,
    {
      method: 'GET',
    }
  );
}
