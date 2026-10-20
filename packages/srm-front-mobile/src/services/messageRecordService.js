/* eslint-disable no-param-reassign */
import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 重推（租户）
 * @param {object} params
 * @returns
 */
export async function resendMessageRecord(params) {
  const url = `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/todo-record/resend`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 重推（平台）
 * @param {object} params
 * @returns
 */
export async function resendMessageRecordSite(params) {
  const url = `${SRM_SMBL}/v1/todo-record/resend`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 忽略（租户）
 * @param {object} params
 * @returns
 */
export async function ignoreMessageRecord(params) {
  const url = `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/todo-record/ignore`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 忽略（平台）
 * @param {object} params
 * @returns
 */
export async function ignoreMessageRecordSite(params) {
  const url = `${SRM_SMBL}/v1/todo-record/ignore`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}
