import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询业务单签署列表
 */
export async function fetchNoticeSign(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify/sign`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 明细页头查询
export async function fetchDetail(params) {
  const { notificationReceiveId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/notify/sign-detail/${notificationReceiveId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 批量签收
export async function batchSignFor(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify/sign`, {
    method: 'POST',
    body: params,
  });
}

// 操作记录
export async function fetchOperationRecord(params) {
  const { notificationId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify-actions/${notificationId}`, {
    method: 'GET',
  });
}

// 附件uuid
export async function receivesAttachmentUuidSave(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess`, {
    method: 'PUT',
    body: params,
  });
}
