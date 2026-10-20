/*
 * pcnmanageWorkbenchService - PCN工作台service
 * @date: 2021-06-07
 * @author: ZYF <yanfengz.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const SRM_SIEC = '/siec';

const organizationId = getCurrentOrganizationId();

/**
 * queryList - 查询列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SIEC}/v1/${organizationId}/pcn-headers/supplier`, {
    method: 'GET',
    query,
  });
}

/**
 * headerBtnAffairHandle - 头部按钮事务处理
 * @param {Object} params - 参数
 */
export async function headerBtnAffairHandle(params, type) {
  // /pcn-headers/do-operation
  const url = type === 1 ? 'pcn-headers/save' : 'pcn-headers/do-operation';
  return request(`${SRM_SIEC}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * batchApprovePass - 批量审批通过
 * @param {Object} params - 入参
 */
export async function batchApprovePass(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/batch-approve-pass`, {
    method: 'POST',
    body: query,
  });
}

/**
 * batchApproveRefused - 批量审批拒绝
 * @param {Object} params - 入参
 */
export async function batchApproveRefused(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/batch-approve-refused`, {
    method: 'POST',
    body: query,
  });
}

/**
 * initialMethod -
 * @param {Object} params - 入参
 */
export async function initialMethod() {
  return request(`${SRM_SIEC}/v1/${organizationId}/pcn-headers/queryStatusConfig`, {
    method: 'GET',
  });
}

/**
 * initialCreateMethod -
 * @param {Object} params - 入参
 */
export async function initialCreateMethod(param) {
  const { statusConfigId, operationCode } = param;
  return request(`${SRM_SIEC}/v1/${organizationId}/pcn-headers/${statusConfigId}`, {
    method: 'GET',
    query: { statusCode: operationCode },
  });
}

/**
 * 单位显示 -
 */
export async function fetchUom() {
  return request(`${SRM_SIEC}/v1/${organizationId}/pcn-headers/pcn-header/enable/uom`, {
    method: 'GET',
  });
}

// 审批记录
export async function handleGetOperationRecord(params) {
  const { pcnHeaderId } = params;
  return request(
    `${SRM_SIEC}/v1/${organizationId}/pcn-headers/list-history-approval/${pcnHeaderId}`,
    {
      method: 'GET',
    }
  );
}

export async function fetchTabDataList(id) {
  return request(
    `${SRM_SIEC}/v1/${organizationId}/pcn-headers/pcn/all/count?sellerFLag=0&statusConfigId=${id}`,
    {
      method: 'GET',
    }
  );
}

export async function fetchSupTabDataList(id) {
  return request(
    `${SRM_SIEC}/v1/${organizationId}/pcn-headers/pcn/all/count?sellerFLag=1&statusConfigId=${id}`,
    {
      method: 'GET',
    }
  );
}

/**
 *  重新执行
 * @param {Object} params - 查询参数
 */
export async function reExecuteApi(params) {
  return request(
    `${SRM_SIEC}/v1/${organizationId}/pcn-export-records/${params.pcnHeaderId}/${params.pcnLineId}/repost`,
    {
      method: 'POST',
      body: params.record,
    }
  );
}

// 查询客户
export async function init(params) {
  return request(
    `/siec/v1/${organizationId}/pcn-headers/pcnHeader/init?compKey=${params.compKey}`,
    {
      method: 'GET',
    }
  );
}
