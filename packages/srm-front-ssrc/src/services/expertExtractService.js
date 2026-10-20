import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 随机抽取
 */
export async function randomExtract(params) {
  const { query = {}, body = {} } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 发送抽取
 */
export async function sendExtract(params) {
  const { query = {}, body } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results/send`, {
    method: 'PUT',
    query,
    body,
  });
}

/**
 * 提交抽取
 */
export async function submitExtract(params) {
  const { query = {}, body } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results/submit`, {
    method: 'PUT',
    query,
    body,
  });
}
