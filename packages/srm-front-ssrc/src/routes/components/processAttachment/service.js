import request from 'utils/request';
import { Prefix, PrefixV2 } from '@/utils/globalVariable';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询过程附件
 * @async
 */
export async function fetchOperationRecords(params) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/files/query`, {
    method: 'GET',
    query: { fileSelectFlag: 1, ...params },
  });
}

export async function downloadAllFile(params) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/files/download`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

// 评分中推荐候选人附件信息查询
export async function fetchOperationScoreRecords(params) {
  return request(`${Prefix}/${organizationId}/score-rpt/files/query`, {
    method: 'GET',
    query: { fileSelectFlag: 1, ...params },
  });
}

export async function downloadAllFileNew(params) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/files/subpackage/download`, {
    method: 'GET',
    query: params,
  });
}

export async function downloadAllScoreFileNew(params) {
  return request(`${Prefix}/${organizationId}/files/score-rpt/download`, {
    method: 'GET',
    query: params,
  });
}
