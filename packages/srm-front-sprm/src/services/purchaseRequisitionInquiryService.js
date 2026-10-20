/**
 * demandQuery - 需求查询
 * @date: 2019-01-22
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SPUC, SRM_MALL, SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 请求API前缀
 * @type {string}
 */
// const prefix = `${SRM_SPUC}/v1`;

/**
 * 查询需求列表页数据 - 整单
 * @param {*} params
 * @returns
 */
export async function queryDemandList({ tenantId, ...params }) {
  const param = parseParameters(params);
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-requests`, {
    method: 'GET',
    query: param,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 查询需求列表页数据
 * @param {*} params
 * @returns
 */
export async function fetchDetailList(params) {
  const param = parseParameters(params);
  const { sort } = param || {};
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/query-detail/page`, {
    method: 'GET',
    query: { ...param, sort },
  });
}
/**
 * 查询非erp需求明细数据
 */
export async function queryNotErpDetail({ tenantId, prHeaderId, workFlowFlag }) {
  console.log(prHeaderId);
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
    query: { workFlowFlag, customizeUnitCode: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER' },
  });
}

/**
 * 评价页面数据
 */
export async function evaluate(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prHeader/evaluate`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 评价页面数据
 */
export async function modalSave(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prHeader/evaluate`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询erp需求明细数据
 */
export async function queryErpDetail({ tenantId, prHeaderId, customizeCode }) {
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
    query: {
      customizeUnitCode: customizeCode,
    },
  });
}
/**
 * 查询非erp采购申请行数据
 */
export async function queryNotErpLines({ tenantId, prHeaderId, approvalPendingStatus, ...params }) {
  const param = parseParameters(params);
  const url =
    approvalPendingStatus === 'CANCELLEDING' || approvalPendingStatus === 'CLOSEDING'
      ? `${SRM_SPRM}/v1/${tenantId}/purchase-requests/${prHeaderId}/cancleing-or-closeding/lines`
      : `${SRM_SPRM}/v1/${tenantId}/purchase-requests/${prHeaderId}/lines`;
  return request(`${url}`, {
    method: 'GET',
    query: {
      ...param,
      // customizeUnitCode,
    },
  });
}
/**
 * 查询erp采购申请行数据
 */
export async function queryErpLines({ tenantId, ...params }) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/query-detail/page`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询操作记录
 * @param {*} params
 * @returns
 */
export async function queryOperationRecords(params) {
  return request(`${SRM_SPUC}/v1`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 获取操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {!number} organizationId - 组织ID
 * @param {!number} prHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/actions`, {
    method: 'GET',
    query,
  });
}

/**
 * 获取操作记录列表
 * @async
 * @function fetchUpdateRecordList
 * @param {!number} organizationId - 组织ID
 * @param {!number} prHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchUpdateRecordList(params) {
  const { prHeaderId, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/actions/change`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 采购申请同步到ERP
 * @export
 * @param {Object} prHeaderIdList
 */
export async function reImportERP(prHeaderIdList) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-sync-erp`, {
    method: 'POST',
    body: prHeaderIdList,
  });
}

/**
 * 列表加急
 * @async
 * @function listUrgent
 * @param {[Number]} poHeaders - 要加急的头列表
 * @returns {object} fetch Promise
 */
export async function listUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prHeader/urgent`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 列表取消加急
 * @async
 * @function listCancelUrgent
 * @param {[Number]} poHeaders - 要取消加急的头列表
 * @returns {object} fetch Promise
 */
export async function listCancelUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prHeader/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发运行加急
 * @async
 * @function detailUrgent
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function detailUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prLine/urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发运单取消加急
 * @async
 * @function detailUrgent
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function detailCancelUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prLine/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 比价单查询
 * @param {number} prHeaderId - 头id
 */
export async function fetchPriceList(prHeaderId) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-compares/pr-list/${prHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 查询执行单据详情
 * @param {!number} prLineId - 行 ID
 * @returns {object} fetch Promise
 */
export async function fetchLineHistory(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-change-historys`, {
    query,
  });
}

/**
 * 查询需求执行人 分页
 * @param {Object} params - 查询参数
 */
export async function queryExecutedBys(params) {
  const param = parseParameters(params);
  return request(`/iam/v1/lovs/sql/data`, {
    method: 'GET',
    query: { lovCode: 'SSLM.KPI_USER', tenantId: organizationId, ...param },
  });
}
// 采购申请撤回
export async function fetchWithdraw(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/workflow-approval-withdraw`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 需求打印
 */
export async function print(payload) {
  const { prHeaderId, headers, responseType } = payload;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/print`, {
    headers,
    responseType,
    method: 'GET',
  });
}

// 采购申请审批保存个性化字段
export async function handleSaveArrtibuteData(body) {
  const { customizeUnitCode } = body;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/update-workflow`, {
    method: 'PUT',
    body,
    query: { customizeUnitCode },
  });
}
