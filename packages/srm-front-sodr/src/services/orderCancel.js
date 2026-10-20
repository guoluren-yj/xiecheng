/**
 * cancelOrderService - 订单取消
 * @date: 2019-2-20
 * @author: lixiaolong <xiaolong.li02@hand-china>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 订单取消/整单取消查询请求
 * @param {string} PoNum - 订单号
 * @param {string} supplierCompanyId - 供应商id
 * @param {string} companyId - 公司
 * @param {string} purchaseOrgId - 采购组织id
 * @param {string} ouId - 供应商id
 * @param {string} purchaseAgentId - 采购员id
 * @param {string} releaseNum - 发放号
 * @param {string} orderTypeId - 订单类型id
 * @param {string} creationDateStart - 创建日期从
 * @param {string} creationDateEnd - 创建日期至
 * @param {string} loginName - 创建人
 * @param {string} supplierSiteId - 供应商地点id
 * @param {string} poSourcePlatform - 单据来源
 */
export async function querySingleList(params) {
  const query = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/process-control`, {
    method: 'GET',
    query,
  });
}

export async function fetchCancelList(params) {
  const query = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/purchaser/process-control-lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 订单取消请求
 * @param {object[]} params - 取消的订单行
 */
export async function cancelOrder(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/cancel`, {
    method: 'PUT',
    body: params.singleSelectedRemarkRows || params,
    query: {
      customizeUnitCode:
        Object.prototype.toString.call(params) === '[object Array]'
          ? params[0].customizeUnitCode
          : params.customizeUnitCode,
    },
  });
}

/**
 * 订单关闭请求
 * @param {object[]} params - 关闭的订单行
 */
export async function closeOrder(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/close`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 订单关闭请求
 * @param {object[]} params - 关闭的订单行
 */
export async function closeLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/close`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 订单取消请求
 * @param {object[]} params - 取消的订单行
 */
export async function cancelLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/cancel`, {
    method: 'PUT',
    body: params.cancelSelectedRemarkRows,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
  });
}

/**
 * 订单变更头信息查询
 * @param {object} params - 查询参数
 */
export async function fetchChangeHeader(params) {
  const { poHeaderId, customizeUnitCode } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/change-detail`, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 订单变更行查询
 * @param {object} params - 查询参数
 */
export async function fetchChangeLines(params) {
  const { poHeaderId, ...query } = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/change-detail`, {
    method: 'GET',
    query,
  });
}

/**
 * 订单变更行可修改字段查询
 * @param {object} params - 查询参数
 */
export async function fetchChangeFields(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-configs/query`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 订单变更提交
 * @param {object} params - 查询参数
 */
export async function submitChangeOrder(params) {
  const { poHeaderId, customizeUnitCode, ...body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/change/${poHeaderId}/submit`, {
    method: 'POST',
    body,
    query: {
      customizeUnitCode,
    },
  });
}

/*
 * 订单变更提交添加一个新接口
 * @async
 * @function addNewSubmitDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function addNewSubmitDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/submit-warn`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取操作记录列表
 * @async
 * @function fetchActionHistoryList
 * @param {!number} organizationId - 组织ID
 * @param {!number} poHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(poHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存文件上传后的UUID
 * @async
 * @function saveAttachmentUUID
 * @param {String} organizationId - 组织Id
 * @returns {object} fetch Promise
 */
export async function saveAttachmentUUID(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-vers/attachmentUUID`, {
    method: 'PUT',
    query: params,
  });
}

/**
 * 参考价
 * @export
 * @param {Object} params
 */
export async function priceList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/reference-price`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询相关的poItemBom
 * @async
 * @function queryPoItemBOM
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.poHeaderId - 采购订单头ID
 * @param {String} params.poLineId - 采购订行ID
 * @param {String} params.poLineLocationId - 采购订行ID
 * @returns {object} fetch Promise
 */
export async function queryPoItemBOM(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    query,
  });
}

// 校验物料&库存组织关联关系
export async function checkInvOrganization(params) {
  const { list, invOrganizationId } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-line/check/invOrganization/${invOrganizationId}`,
    {
      method: 'POST',
      responseType: 'text',
      body: list,
    }
  );
}

// 订单提交预算校验
export async function oldBudgetVerification(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-budget-check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 撤销变更
 * @param {object} params - 接口传参
 */
export async function handleRevoke(params) {
  const { poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-vers/recall`, {
    method: 'POST',
    query: {
      poHeaderId,
    },
  });
}
