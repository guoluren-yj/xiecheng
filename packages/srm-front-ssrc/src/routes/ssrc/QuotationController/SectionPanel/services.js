import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

const organizationId = getCurrentOrganizationId();

/**
 * 获取相同询价单状态下的标段信息
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchSectionInfo(params = {}) {
  const { adjustRecordId, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/section-batch-list/query`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 获取相同询价单状态下的标段信息
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchApprovalSectionInfo(params = {}) {
  const { adjustRecordId, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/rfx/adjust/${adjustRecordId}/quote-section-batch-list/approve-query`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
