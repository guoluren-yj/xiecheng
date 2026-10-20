import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
// import { parseParameters } from 'utils/utils';

/**
 * 适用范围-配置列表查询
 * */
export async function fetchApplicationScoreUnitList(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/source-app-scopes`, {
    method: 'GET',
    query: otherParams,
  });
}

// /**
//  * 适用范围-配置列表下配置表格查询
//  * */
// export async function fetchApplicationScoreLine(params = {}) {
//   const { organizationId, sourceAppScopeId, ...otherParams } = params;
//   const lineParam = parseParameters(otherParams);
//   return request(`${SRM_SSRC}/v1/${organizationId}/source-app-scopes/${sourceAppScopeId}/line`, {
//     method: 'GET',
//     query: lineParam,
//   });
// }

/**
 * 适用范围-适用范围-配置列表下配置表格保存
 * */
export async function submitApplicationScopeLine(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/source-app-scopes`, {
    method: 'POST',
    body: otherParams,
  });
}
