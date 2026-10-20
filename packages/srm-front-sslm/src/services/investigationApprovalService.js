/*
 * investigationApprovalService - 调查表审批
 * @date: 2018/10/13 10:49:37
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, getCurrentLanguage } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询调查表审批列表
 * @export
 * @param {Object} params
 */
export async function fetchApprovalList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/listSubmitted`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 查询调查表审批详情
 * @export
 * @param {Object} params
 */
export async function fetchInvestigationDetail(params) {
  const { desensitize = false } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${params.investigateHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode: params.customizeUnitCode, desensitize },
  });
}
/**
 * 调查表审批同意
 * @export
 * @param {Object} params
 */
export async function handleAgree(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate/approve/${params.investigateHeaderId}`,
    {
      method: 'POST',
      body: otherParams,
      query: { customizeUnitCode },
    }
  );
}
/**
 * 调查表审批拒绝
 * @export
 * @param {Object} params
 */
export async function handleReject({ customizeUnitCode, ...rest }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/reject`, {
    method: 'POST',
    body: rest,
    query: { customizeUnitCode },
  });
}

/**
 * 邀约拒绝
 * @export
 * @param {Object} params
 */
export async function inviteRefuse(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/invite-reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询调查表审批操作记录接口
 * @export
 * @param {Object} params --查询参数
 */
export async function fetchRecordList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/investg-process-recs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询调查表工作流审批记录接口
 * @export
 * @param {Object} params --查询参数
 */
export async function fetchReviewList(params) {
  const { businessKeyList, ...rest } = params;
  const lang = getCurrentLanguage();
  return request(`/hwfp/v1/${organizationId}/activiti/task/historyApproval-batch`, {
    method: 'POST',
    query: { lang, ...rest },
    body: businessKeyList,
  });
}
