/*
 * @Date: 2026-06-17 14:48:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import {getCurrentOrganizationId} from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询业务规则是否开始AI审批
export async function queryAiConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/getCnf`, {
    method: 'GET',
    query: params,
  });
}

// 智能预审
export async function aiApprove(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/doAiApprove`, {
    method: 'POST',
    query: params,
  });
}

// 轮询智能预审返回的状态
export async function fetchApproveStatus(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/getApproveStatus`, {
    method: 'GET',
    query: params,
  });
}