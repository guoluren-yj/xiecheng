/**
 * mallAgreementApproveService
 * @date: 2020-05-26
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
// import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID
/**
 * 查询行
 */
export async function fetchAgreementList(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreements`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询详细行
 */
export async function fetchDetailLine(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-lines`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询阶梯价格
 */
export async function fetchPriceList(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-ladders/${param.agreementLineId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 协议审批同意
 */
export async function agreementApprove(params) {
  return request(`/sagm/v1/${organizationId}/agreements/approved`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 协议审批拒绝
 */
export async function agreementReject(params) {
  return request(`/sagm/v1/${organizationId}/agreements/reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 协议发布
 */
export async function agreementPublish(params) {
  return request(`/sagm/v1/${organizationId}/agreements/publish`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 操作记录
 */
export async function fetchOperate(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-records/${params.agreementId}`, {
    method: 'GET',
    query: param,
  });
}
