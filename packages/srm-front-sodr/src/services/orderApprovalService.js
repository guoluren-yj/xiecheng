/*
 * orderApprovalService - 订单审批
 * @date: 2018/10/13 11:50:23
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { HZERO_FILE } from 'utils/config';
import { SRM_SPUC, SRM_FINANCE, SRM_SLOD } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/approving`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 采购订单列表审批
 * @async
 * @function passApprovalList
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function passApprovalList(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-approve`, {
    method: 'POST',
    body: data,
  });
}
/**
 * 采购订单列表拒绝
 * @async
 * @function passApprovalList
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function rejectApprovalList(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-reject`, {
    method: 'POST',
    body: data,
  });
}
/**
 * 采购订单头明细查询
 * @async
 * @function queryDetailHeader
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailHeader(poHeaderId, params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`, {
    query: {
      camp: 1,
      ...params,
    },
  });
}

/**
 * 订单行基本信息
 * @async
 * @function queryDetailBasic
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailBasic(poHeaderId, params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/basic`, {
    query: {
      camp: 1,
      ...params,
    },
  });
}

/**
 * 订单行其他信息
 * @async
 * @function queryDetailOther
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailOther(poHeaderId, params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/other`, {
    query: {
      camp: 1,
      ...params,
    },
  });
}

/**
 * 保存订单
 * @async
 * @function saveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function saveDetail(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/supplier/save`, {
    method: 'PUT',
    body: data,
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
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    query: params,
  });
}

/**
 * 新Bom查询Api
 * @async
 * @function newQueryPoItemBOM
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.poHeaderId - 采购订单头ID
 * @param {String} params.poLineId - 采购订行ID
 * @returns {object} fetch Promise
 */
export async function newQueryPoItemBOM(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms/query`, {
    query,
  });
}

/**
 *  获取上传附件UUID
 * @async
 * @function getAttachmentuuid
 * @returns {string} fetch Promise
 */
export async function getAttachmentuuid() {
  return request(`${HZERO_FILE}/v1/${organizationId}/files/uuid`, {
    method: 'POST',
  });
}

/**
 * 采购订单操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.tenantId - 租户Id
 * @param {String} params.poHeaderId - 头Id
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
 * 采购订单确认
 * @async
 * @function confirm
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function confirm(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/confirm`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 采购订单反馈
 * @async
 * @function feedback
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function feedback(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/feedback`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 采购订单操作记录列表
 * @async
 * @function fetchChangedHistoryList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.organizationId - 组织Id
 * @returns {object} fetch Promise
 */
export async function fetchChangedHistoryList(params) {
  const { poHeaderId, page, size } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-records/${poHeaderId}/paging`, {
    method: 'GET',
    query: { page, size },
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
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/attachmentUUID`, {
    method: 'PUT',
    query: params,
  });
}
/**
 * 采购订单反馈
 * @async
 * @function feedback
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function feedbackDetail(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/feedback-detail`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 采购订单确认
 * @async
 * @function confirm
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function confirmDetail(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/confirm-detail`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 采购订单行明细查询
 * @async
 * @function queryDetailList
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailList(poHeaderId, params) {
  const query = { ...filterNullValueObject(parseParameters(params)), camp: 1, sortType: 1 };
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`, {
    query,
  });
}

/**
 * 分页查询采购订单合作方
 * @async
 * @function queryDetailList
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryPartners(poHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/partners`, {
    query,
  });
}

/**
 * 手工审批通过采购订单
 * @async
 * @function detailApprove
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function detailApprove(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/detail-approve`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 手工审批通过采购订单
 * @async
 * @function detailReject
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function detailReject(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/detail-reject`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 采购订单详情页-关联单据-送货单
 * @async
 * @function fetchAsnLines
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchAsnLines(poLineLocationId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-lines/${poLineLocationId}/es-asn-lines`);
}

/**
 * 采购订单详情页-关联单据-送货单(新)
 * @async
 * @function fetchAsnLinesNew
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchAsnLinesNew(poLineLocationId) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/asn/link-line/po/${poLineLocationId}`);
}

/**
 * 采购订单详情页-关联单据-收货记录
 * @async
 * @function fetchRcvRecords
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchRcvRecords(poLineLocationId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/po-rcv-records`, {
    method: 'POST',
    query: { poLineLocationId },
  });
}
/**
 * 采购订单详情页-关联单据-对账单
 * @async
 * @function fetchBillLines
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchBillLines(params) {
  return request(`/ssta/v1/${organizationId}/bill-lines/purchaser`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 采购订单详情页-关联单据-老对账单
 * @param {*} poLineLocationId
 */
export async function fetchOldBillLines(poLineLocationId) {
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill-lines/po-line-location/${poLineLocationId}`,
    {
      method: 'GET',
    }
  );
}
/**
 * 采购订单详情页-关联单据-网上发票
 * @async
 * @function fetchInvoiceLines
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchInvoiceLines(params) {
  return request(`/ssta/v1/${organizationId}/settle-lines/purchaser`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 采购订单详情页-关联单据-老网上发票
 * @param {*} poLineLocationId
 */
export async function fetchOldInvoiceLines(poLineLocationId) {
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice-line/po-line-location/${poLineLocationId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取业务规则定义-【是否启用新结算平台】设置值
 */
export async function fetchAssociatedConfigFlag() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/enable/budget`, {
    method: 'GET',
  });
}
/**
 * 打印
 * @async
 * @param {!number} poHeaderId - 订单发运行id
 * @function print
 */
export async function print(poHeaderId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}
