/**
 * purchaseRequisitionCancelService - 需求取消
 * @date: 2019-1-25
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SPUC, SRM_PLATFORM, SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 需求取消 - 按行统一事务处理
 * @param {Array[]} params
 */
export async function cancelPurchase(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/lines/cancel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 需求取消 - 按单分事务处理
 * @param {Array[]} params
 */
export async function cancelPurchaseByWhole(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/lines/cancel-by-whole`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 需求关闭列表
 * @param {Array[]} params
 */
export async function fetchPurchaseLinesClose(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/lines/close`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 需求关闭列表
 * @param {Array[]} params
 */
export async function fetchPurchaseSubmit(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/submit-change`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 需求关闭列表
 * @param {Array[]} params
 */
export async function fetchPrChangeConfigs(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-change-configs/query`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 需求关闭整单
 * @param {Array[]} params
 */
export async function fetchPurchaseClose(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/close`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 需求退回整单
 * @param {object} body - 头数据
 */
export async function sendBack(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/send-back`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询请求
 * @export
 * @param {?string} params.prNum - 申请编号
 * @param {?string} params.prStatusCode - 状态
 * @param {?string} params.prSourcePlatform - 单据来源
 * @param {?string} params.createdDateStart - 创建日期从
 * @param {?string} params.createdDateEnd - 创建日期至
 * @param {?string} params.neededDateStart - 需求日期从
 * @param {?string} params.neededDateEnd - 需求日期至
 */
export async function searchList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/lines/cancel`, {
    method: 'GET',
    query,
  });
}
/**
 * 整单取消tab页查询请求
 */
export async function searchSingleList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/cancel`, {
    method: 'GET',
    query,
  });
}
/**
 * 取消采购申请
 * @async
 * @function cancel
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function cancel(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/cancel`, {
    method: 'POST',
    body,
  });
}

/**
 * erp 详情页获取信息请求
 * @param {string} params.id - 需要获取数据的 id
 */
export async function fetchSingleData(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/purchase-requests/lines/erp-cancel`, {
    method: 'GET',
    query: params,
  });
}

/**
 * -erp 详情页获取信息请求 - 请求头
 * @param {string} params.id - 需要获取数据的 id
 */
export async function queryErpHeader(payload) {
  const { prHeaderId, customizeUnitCode } = payload;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * -erp 详情页获取消请求 - 请求行
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
 * erp 详情页获取消请求
 * @param {string} params.id - 需要获取数据的 id
 */
export async function cancelERP(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/purchase-requests/lines/erp-cancel`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 非erp 详情页获取消请求
 * @param {String} prHeaderId - 头id
 */
export async function queryDetailHeader(payload) {
  const { prHeaderId, customizeUnitCode } = payload;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 非erp 详情页获取消请求
 * @param {String} prHeaderId - 头id
 */
export async function queryDetailList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/lines`, {
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
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}

/**
 * 获取操作记录列表
 * @async
 * @function fetchUpdateRecordList
 * @returns {object} fetch Promise
 */
export async function fetchChangeConfig() {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/change-config`, {
    method: 'GET',
  });
}

/**
 * 查询配置表中的配置
 */
export async function fetchConfig(params) {
  const tableCode = 'spuc_old_tenant_sprm_cancel';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-platform-rel-table`,
    {
      method: 'POST',
      // query: { fullPathCode },
      body: params,
    }
  );
}

/**
 * 查询配置表中的变更配置
 */
export async function fetchChangeOldConfig(params) {
  const tableCode = 'sprm_pr_change_old_tenant';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-platform-rel-table`,
    {
      method: 'POST',
      // query: { fullPathCode },
      body: params,
    }
  );
}

/**
 * 撤销变更
 */
export async function revokeChange(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/revoke-change`, {
    method: 'POST',
    // query: { fullPathCode },
    body: params,
  });
}

/**
 * 获取关闭按钮的提示信息--pur-26693
 * @async
 * @function fetchUpdateRecordList
 * @returns {object} fetch Promise
 */
export async function getCloseInfo(data) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/close-before/detail`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 业务规则是否有记录的接口
 */
export async function cnfModified(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/is-modified`, {
    method: 'GET',
    query: params,
  });
}
