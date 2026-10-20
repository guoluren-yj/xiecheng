import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';

const organizationId = getCurrentOrganizationId();

// 告警详情
export async function getAppDetailFormInfo(applicationHeaderId) {
  return request(`${HZERO_HITF}/v1/${organizationId}/open-warn-rules/${applicationHeaderId}`, {
    method: 'GET',
  });
}

// 保存应用
export async function saveApplication(params) {
  return request(`${HZERO_HITF}/v1/open-application-headers/save`, {
    method: 'POST',
    body: params,
  });
}

// 保存告警头信息
export async function giveAnAlarmHeader(params) {
  return request(`${HZERO_HITF}/v1/${organizationId}/open-warn-rules`, {
    method: 'POST',
    body: params,
  });
}

// 保存告警行信息
export async function giveAnAlarmLine(params) {
  return request(`${HZERO_HITF}/v1/${organizationId}/open-warn-rule-lines`, {
    method: 'POST',
    body: params,
  });
}

// 发布应用
export async function publishApplication(applicationHeaderId) {
  return request(`${HZERO_HITF}/v1/open-application-headers/submit/${applicationHeaderId}`, {
    method: 'POST',
  });
}

// 操作记录
export async function getAppRecord(id) {
  return request(`${HZERO_HITF}/v1/${organizationId}/open-warn-rule-records`, {
    method: 'GET',
    query: { warnRuleId: id },
  });
}
