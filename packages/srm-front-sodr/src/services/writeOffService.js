/**
 * service SRM冲销
 * @date: 2019-01-26
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
// const prefix = `${SRM_SPUC}/v1`;

export function queryWriteOffList({ tenantId, ...params }) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${tenantId}/rcv-trx-header/permit-reverse-asn-line`, {
    method: 'GET',
    query: param,
  });
}

export function queryTrxLineList({ tenantId, lineIds, ...params }) {
  // const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${tenantId}/rcv-trx-line/permit-reverse`, {
    method: 'POST',
    query: params,
    body: { lineIds },
  });
}

export function queryWriteOffListAdd({ tenantId, lineIds, rcvTrxLineIds, ...params }) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${tenantId}/rcv-trx-header/permit-reverse-asn-line-add`, {
    method: 'POST',
    query: param,
    body: { lineIds, rcvTrxLineIds },
  });
}

export function addTrx({ tenantId, params, customizeUnitCode }) {
  return request(`${SRM_SPUC}/v1/${tenantId}/rcv-trx-header/reverse-rcv-trx`, {
    method: 'POST',
    body: params,
    query: {
      customizeUnitCode,
    },
  });
}

export function validateWriteOff(params) {
  const { tenantId } = params;
  return request(`${SRM_SPUC}/v1/${tenantId}/rcv-trx-header/writeVerification`, {
    query: { receiveOrderType: params.receiveOrderType, organizationId: tenantId },
    method: 'POST',
    body: params.lineIds,
  });
}
