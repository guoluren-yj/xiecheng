/**
 * service - 流程转交
 */

import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 查询审批人流程
export async function queryApproverProcess(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_HWFP}/v1/${tenantId}/task/delegate`, {
    query,
  });
}

// 查询申请人流程
export async function queryApplicantProcess(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_HWFP}/v1/${tenantId}/delegate/delegate-initiator/list`, {
    query,
  });
}

// 流程转交
export async function delegateApprovalProcess(params) {
  return request(`${HZERO_HWFP}/v1/${tenantId}/task/delegate`, {
    method: 'POST',
    body: params,
  });
}

// 流程转交
export async function delegateApplicantProcess(params) {
  return request(
    `${HZERO_HWFP}/v1/${tenantId}/delegate/delegate-initiator
  `,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 新增/编辑处理规则
export async function saveProcess(flag, params) {
  return request(
    `${HZERO_HWFP}/v1/${tenantId}/automatic-process/tenant/${flag ? 'update' : 'create'}`,
    {
      method: flag ? 'PUT' : 'POST',
      body: params,
    }
  );
}

// 新增/编辑转交规则
export async function saveDelegate(flag, params) {
  return request(
    `${HZERO_HWFP}/v1/${tenantId}/delegate/${flag ? 'update-config' : 'insert-config'}`,
    {
      method: 'POST',
      body: params,
    }
  );
}
