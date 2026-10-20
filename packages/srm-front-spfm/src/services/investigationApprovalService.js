/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-24 10:34:25
 * @FilePath: /srm-front-spfm/src/services/investigationApprovalService.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
/*
 * investigationApprovalService - 调查表审批
 * @date: 2018/10/13 10:49:37
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

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
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${params.investigateHeaderId}`, {
    method: 'GET',
  });
}
/**
 * 调查表审批同意
 * @export
 * @param {Object} params
 */
export async function handleAgree(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate/approve-site/${params.investgHeaderId}`,
    {
      method: 'POST',
      body: params,
      query: {
        customizeUnitCode:
          'SPFM.PARTNER_INVITE.SENDSUPTOP,SSLM.INVESTIGATION_APPROVAL_DETAIL.HEADER',
      },
    }
  );
}
/**
 * 邀约拒绝
 * @export
 * @param {Object} params
 */
export async function handleReject(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/invite-reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 调查表审批拒绝
 * @export
 * @param {Object} params
 */
export async function handleInvestigateReject(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/reject`, {
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
