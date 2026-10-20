import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 留言板数据查询
 * @param {Object} params - 查询参数
 */
export async function messageBoardQuiryList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv-rcv-messages?rcvTrxHeaderId=${params}`, {
    method: 'GET',
    // query: params,
  });
}

/**
 * 留言板数据更新
 * @param {Object} params - 参数
 */
export async function messageBoardPutList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv-rcv-messages`, {
    method: 'POST',
    body: params,
  });
}
