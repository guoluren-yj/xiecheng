/*
 * purchaseRequisitionApproval - 采购申请审批
 * @date: 2019-01-24
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_SPUC, SRM_MALL, SRM_PLATFORM, SRM_SPRM } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/approve`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 采购申请erp列表通过
 * @async
 * @function passApprovalList
 * @param {!number} organizationId - 组织ID
 * @param {object} body - 数据
 * @returns {object} fetch Promise
 */
export async function approval(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/erp/approve/approval`, {
    method: 'POST',
    body,
  });
}

/**
 * 采购申请erp列表拒绝
 * @async
 * @function passApprovalList
 * @param {!number} organizationId - 组织ID
 * @param {object} body - 数据
 * @returns {object} fetch Promise
 */
export async function reject(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/erp/approve/reject`, {
    method: 'POST',
    body,
  });
}

/**
 * 采购申请非erp列表通过
 * @async
 * @function passApprovalList
 * @param {!number} organizationId - 组织ID
 * @param {object} body - 数据
 * @returns {object} fetch Promise
 */
export async function approvalApprovalList(body) {
  const { approvalPendingStatus = '', prHeaderList } = body;
  let url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/approve/approval`;
  switch (approvalPendingStatus) {
    case 'CANCELLEDING':
      url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/cancel/approve`;
      break;
    //
    case 'CLOSEDING':
      url = `${SRM_SPUC}/v1/${organizationId}/purchase-requests/closed/approve`;
      break;
    default:
      url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/approve/approval`;
  }
  return request(`${url}`, {
    method: 'POST',
    body: prHeaderList,
  });
}

/**
 * 采购申请非erp列表拒绝
 * @async
 * @function passApprovalList
 * @param {!number} organizationId - 组织ID
 * @param {object} body - 数据
 * @returns {object} fetch Promise
 */
export async function rejectApprovalList(body) {
  const { approvalPendingStatus = '', prHeaderList } = body;
  let url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/approve/reject`;
  switch (approvalPendingStatus) {
    case 'CANCELLEDING':
      url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/cancel/reject`;
      break;
    //
    case 'CLOSEDING':
      url = `${SRM_SPUC}/v1/${organizationId}/purchase-requests/closed/reject`;
      break;
    default:
      url = `${SRM_SPRM}/v1/${organizationId}/purchase-requests/approve/reject`;
  }
  return request(`${url}`, {
    method: 'POST',
    body: prHeaderList,
  });
}

/**
 * 需求审批头查询
 * @param {String} prHeaderId - 头id
 */
export async function queryDetailHeader(payload) {
  const { customizeUnitCode, prHeaderId } = payload;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 需求审批行查询
 * @param {String} prHeaderId - 头id
 */
export async function queryDetailList(params) {
  const { approvalPendingStatus } = params;
  const query = filterNullValueObject(parseParameters(params));
  const url =
    approvalPendingStatus === 'CANCELLEDING' || approvalPendingStatus === 'CLOSEDING'
      ? `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/cancleing-or-closeding/lines`
      : `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/lines`;
  return request(`${url}`, {
    method: 'GET',
    query,
  });
}

/**
 * erp 详情页获取消请求 - 请求行
 * @param {String} prHeaderId - 头id
 */
export async function queryErpList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/query-detail/page`, {
    method: 'GET',
    query,
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

// 比价单查询
export async function fetchPriceList(prHeaderId) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-compares/pr-list/${prHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 采购申请审批(新)-配置表配置新老节点
 * */
export async function fetchConfigSheetRfxPrepare(params) {
  const tableCode = 'sprm_old_ui_config';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-old-ui-config`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// /**
//  * 查询业务规则定义
//  */
// export async function fetchDoExecute(body) {
//   const fullPathCode = body.map((ele) => ele.fullPathCode);
//   return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
//     method: 'POST',
//     query: { fullPathCode },
//     body,
//   });
// }
