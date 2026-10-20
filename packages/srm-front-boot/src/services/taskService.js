import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

/**
 *  根据传入的多个businessKey返回businessKey对应的流程是否可审批
 *  若可审批返回taskId和processInstanceId
 *  否则返回null
 * */
export async function queryApprovaFlag(params) {
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/approval-flag`, {
    method: 'POST',
    body: params,
  });
}

/**
 *  根据传入的多个businessKey返回businessKey对应的流程是否可审批
 *  若可审批返回taskId和processInstanceId
 *  否则返回null
 * */
export async function querySimpleApprovaHistory(params) {
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/activiti/task/simple-approval-history`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 查询流程定义全局配置
export async function getProcessDefineConfig() {
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/notification`, {
    method: 'POST',
  });
}

export async function submitDocumentApprove(data) {
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/document-approver-submit-records/save`,
    {
      method: 'POST',
      body: data,
    }
  );
}
