/**
 * model - 送样采购员确认
 * @date: 2020-5-14
 * @author: ygg <gege.yao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 批量退回
 */
export async function backBuyerList(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/batchReturnReq`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 批量确认
 */
export async function confirmBuyerList(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/confirm/batchSubmit`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 批量关闭
 */
export async function batchClosed(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/batch-closed`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 退回
 */
export async function singleReturn(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/returnReq`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 确认
 */
export async function singleConfirm(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/confirm/submit`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 关闭
 */
export async function singleClosed(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/closed`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 保存
 */
export async function confirmSave(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/updateSendReq`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/*
 * 打印
 */
export async function confirmPrint(params) {
  const { detailReqId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/${detailReqId}/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}
