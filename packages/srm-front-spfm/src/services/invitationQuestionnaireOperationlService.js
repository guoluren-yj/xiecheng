/*
 * invitationQuestionnaireOperationlService - 合作邀约-调查表-操作记录
 * @date: 2021/11/12
 * @author: DTM <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, ZhenYun
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { parseParameters, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

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
  const { businessKeyList } = params;
  const lang = getCurrentLanguage();
  return request(`/hwfp/v1/${organizationId}/activiti/task/historyApproval-batch`, {
    method: 'POST',
    query: { lang },
    body: businessKeyList,
  });
}
