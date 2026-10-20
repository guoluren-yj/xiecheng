/**
 * supplierRelatedDocService - 供应商关联业务单据Service
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询协议文本对比
 * @param {*} params
 */
export async function fetchTextComparison(params) {
  const { pcHeaderId, version, isSupplier } = params;
  const path = isSupplier ? 'purchase-contract-file' : 'purchase-contract';
  return request(`${SRM_SPCM}/v1/${organizationId}/${path}/${version}-contrast`, {
    method: 'POST',
    query: { pcHeaderId },
  });
}

/**
 * 查询协议存证证明Url
 * @param params
 */
export function queryViewCertificateDeposit(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/sign/get-proof-link`, {
    responseType: 'text',
    query: params,
  });
}
