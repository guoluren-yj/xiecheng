/*
 * @Description:
 * @Date: 2026-06-16 16:08:38
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export async function fetchRuleResult(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/task-result`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchCheckResult(params) {
  return request(
    `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/task-dashboard?sort=${
      params?.sort || ''
    }&page=${params?.page || -1}&size=${params?.size || 10}`,
    {
      method: 'POST',
      body: params?.queryList ?? [],
    }
  );
}

/**
 * 提交智能审核结果反馈
 * @param {number} recordId - 记录ID
 * @param {string} feedbackType - 反馈类型 LIKE/DISLIKE
 * @param {string} feedbackContent - 反馈文本
 */
export async function submitAiCheckFeedback({ recordId, feedbackType, feedbackContent }) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/feedback`, {
    method: 'POST',
    body: { recordId, feedbackType, feedbackContent },
  });
}
