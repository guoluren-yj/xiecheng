/**
 * service 采购订单维护入口
 * @date: 2019-01-26
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SPUC, SRM_SPCM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 获取汇总数据
 * @export
 * @param {object} params - 查询参数
 * @returns
 */
export function queryList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/maintain`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 获取操作记录数据
 * @export
 * @param {object} params - 查询参数
 * @returns
 */
export function queryOperationRecList(params) {
  const { poHeaderId } = params;
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}`, {
    method: 'GET',
    query: param,
  });
}

export function submit({ prHeaderList }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-submit`, {
    method: 'POST',
    body: prHeaderList,
  });
}

export async function fetchLine(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPCM}/v1/${organizationId}/sync-contract/po-header/from-contract/line`, {
    method: 'GET',
    query: param,
  });
}
export async function creation(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-contract-result/line`, {
    method: 'POST',
    body: params,
  });
}

export async function createCombineProtocol(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-contract-result/line/new`, {
    method: 'POST',
    body: params,
  });
}

export async function handleOrderType() {
  // return request(`${SRM_SPUC}/v1/${organizationId}/po-merge-rule`, {
  //   method: 'GET',
  // });
  return request(`${SRM_SPUC}/v1/${organizationId}/po-create-type/rule`, {
    method: 'GET',
  });
}

export async function fetchCopyOrderList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/copy/list`, {
    method: 'GET',
    query,
  });
}

export async function copyOrder(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/copy`, {
    method: 'PUT',
    query: params,
  });
}

// 查询订单并单规则列表
// export async function fetchOrderMergeRuleList() {
//   return request(`${SRM_SPUC}/v1/${organizationId}/po-merge-rule`, {
//     method: 'GET',
//   });
// }

/**
 * 按行引用创建前校验
 * @export
 * @param {Object} params
 */
export async function check(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/po_config`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 暂挂按钮
 */
export async function pendingFlag(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-source-contract-config`, {
    method: 'POST',
    body: data,
  });
}
