/*
 * @Description:
 * @Date: 2020-09-06 10:26:19
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function getUrl(listStatus, allFlag = false) {
  let url;
  switch (listStatus) {
    case 'WAITING':
      if (!allFlag) {
        url = 'waiting-todo-sinv';
      } else {
        url = `waiting-todo-sinv-all`;
      }
      break;
    case 'DOING':
      url = 'doing-sinv';
      break;
    case 'FINISHED':
      url = 'finished-line-waiting-todo-sinv';
      break;
    default:
      url = 'waiting-todo-sinv';
      break;
  }
  return url;
}

export async function fetchTreeList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/left-tree`, {
    query: params,
    method: 'GET',
  });
}

export async function fetchProcessList(params, type) {
  const url = type === 'WAITING' ? 'waiting-top-tree' : 'top-tree';
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${url}`, {
    query: params,
    method: 'GET',
  });
}

export async function queryExecLov(params) {
  const { listStatus, ...param } = params;
  const url =
    listStatus === 'WAITING'
      ? `${SRM_SPUC}/v1/lovs/sql/data`
      : `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/line/reverse-node-url`;
  return request(url, {
    query: param,
    method: 'GET',
  });
}

/**
 * 执行
 * @param {勾选数据} list
 */
export async function handleExecute(param) {
  const { lines, listStatus, allFlag = false, ...other } = param;
  const url = getUrl(listStatus, allFlag);
  const { rcvTrxTypeId, rcvTypeCode, ...allParams } = other;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${url}`, {
    query: !allFlag ? other : { rcvTrxTypeId, ...allParams },
    method: 'POST',
    body: !allFlag ? lines : allParams,
  });
}

/**
 * 明细保存
 * @param {勾选数据} list
 */
export async function handleSave(params) {
  const { customizeUnitCode, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/save`, {
    query: { customizeUnitCode },
    method: 'PUT',
    body: data,
  });
}

/**
 * 明细提交
 * @param {勾选数据} list
 */
export async function handleSubmit(params) {
  const { customizeUnitCode, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/submitted`, {
    query: { customizeUnitCode },
    method: 'POST',
    body: data,
  });
}

/**
 * 打印
 * @async
 * @param {!number} poHeaderId - 订单发运行id
 * @function print
 */
export async function print(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print`, {
    method: 'POST',
    responseType: 'blob',
    body: payload,
  });
}
