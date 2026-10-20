/*
 * supplyAbilityDocService - 供货能力申请单
 * @date: 2024/06/18 11:50:23
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 采购方整单保存
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function saveAll(params) {
  const { customizeUnitCode = '', wfParams, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/save`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
      ...wfParams,
    },
  });
}

/**
 * 提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function submitAll(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/submit`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 删除
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function deleteAll(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 详情-审批通过
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function approveReq(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/approve`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 详情-审批拒绝
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function rejectReq(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量审批
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function batchApprove(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/batch-approve`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量拒绝
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function batchReject(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/batch-reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量编辑保存
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function batchSaveLine(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-lines/batch-edit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除申请单
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteReq(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 供应商租户-整单保存
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function saveAllAsSupplier(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/sup/save`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 供应商租户-提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function submitAllAsSupplier(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/sup/submit`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 采购方申请单-查询数量
 *
 * @export
 * @returns
 */
export async function fetchTabCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/tab-count`, {
    method: 'GET',
  });
}

/**
 * 供应商申请单-查询数量
 *
 * @export
 * @returns
 */
export async function fetchSupTabCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/tab-count-sup`, {
    method: 'GET',
  });
}

// 提交前数据校验
export async function submitCheck(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/submit-check`, {
    method: 'POST',
    body: params,
  });
}
