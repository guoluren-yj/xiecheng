import request from 'utils/request';
import { SRM_SCUX_2 } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 日历卡片
 * @export
 * @param {object} params 保存数据
 * @returns
 */
export async function fetchSave(params) {
  return request(`${SRM_SCUX_2}/v1/${organizationId}/aiwei-schedule-heards`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 日历卡片
 * @export
 * @param {object} params 同意或拒绝
 * @returns
 */
export async function fetchPosonInfo(params) {
  return request(`${SRM_SCUX_2}/v1/${organizationId}/aiwei-schedule-heards/update`, {
    method: 'PUT',
    body: params,
  });
}
