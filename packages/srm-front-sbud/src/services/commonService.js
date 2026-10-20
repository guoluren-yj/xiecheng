import { HZERO_HWFP } from 'utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag`, {
    body,
    query,
    method: 'POST',
  });
}

/**
 * 工作流流程撤销
 * @param {object} params - 接口传参
 */
export async function revokeWorkFlowByKey(params) {
  const { businessKey } = params;
  let realRes;
  const res = await request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}
