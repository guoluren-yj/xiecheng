import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 查询是否能撤销
 */
export async function fetchRevokeWorkflow(body) {
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag?revokeFlag=1`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 撤销工作流审批
 */
export async function revokeWorkflow(params) {
  const { businessKey } = params;
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    {
      method: 'GET',
    }
  );
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
    realRes = JSON.parse(res || '');
  } catch (error) {
    realRes = res;
  }
  return realRes;
}
