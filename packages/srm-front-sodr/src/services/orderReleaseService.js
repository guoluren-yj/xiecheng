/*
 *
 * @date: 2018/11/20 11:44:39
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { HZERO_FILE, HZERO_PLATFORM } from 'utils/config';
import { SRM_SPUC, SRM_SPCM, SRM_FINANCE, SRM_SLOD } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询订单发布列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryOrderReleaseList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/publishing`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询订单发布列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryOrderSignList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header-signs`, {
    method: 'GET',
    query,
  });
}

/**
 * 发布订单
 * @param {!number} organizationId - 组织ID
 * @param {params} -选中的订单列表
 */
export async function publish(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-publish`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 按订单发运行查询 - 采购方
 * @async
 * @function querySendDetailList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {!number} organizationId - 组织ID
 */
export async function querySendDetailList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/purchaser`, {
    method: 'GET',
    query: params,
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
 * 发运行加急
 * @async
 * @function detailUrgent
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function detailUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/urgent`, {
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
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 是否值集
 * @async
 * @function flag
 * @returns {object} fetch Promise
 */
export async function flag(params) {
  return request(`/hpfm/v1/lovs/value`, {
    method: 'GET',
    query: params,
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
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/purchase/save`, {
    method: 'PUT',
    body: data,
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
 * 获取uuid
 * @async
 * @function getAttachmentuuid
 * @param {!number} organizationId - 组织ID
 * @returns {string} fetch Promise
 */
export async function getAttachmentuuid() {
  return request(`${HZERO_FILE}/v1/${organizationId}/files/uuid`, {
    method: 'POST',
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
 * 获取修改记录列表
 * @async
 * @function fetchChangedHistoryList
 * @param {!number} organizationId - 组织ID
 * @param {!number} poHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchChangedHistoryList(params) {
  const { page, size, poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-records/${poHeaderId}/paging`, {
    method: 'GET',
    query: { page, size },
  });
}

/**
 * 获取操作记录列表
 * @async
 * @function saveAttachmentUUID
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function saveAttachmentUUID(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/attachmentUUID`, {
    method: 'PUT',
    query: params,
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
  const query = { ...filterNullValueObject(parseParameters(params)), camp: 1, sortType: 2 };
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`, {
    query,
  });
}

/**
 * 分页查询采购订单合作方
 * @async
 * @function queryPartners
 * @param {!number} poHeaderId - 组织ID
 * @param {object} params - 头ID
 * @returns {object} fetch Promise
 */
export async function queryPartners(poHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/partners`, {
    query,
  });
}

/**
 * 采购订单详情页发布
 * @async
 * @function detailPublish
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function detailPublish(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/detail-publish`, {
    method: 'POST',
    body: data,
  });
}
/**
 * 采购订单详情页-关联单据-送货单
 * @async
 * @function fetchAsnLines
 * @param {!number} poLineLocationId - 组织ID
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
 * @param {!number} poLineLocationId - 组织ID
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
 * @param {!number} poLineLocationId - 组织ID
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
 * @param {!number} poLineLocationId - 组织ID
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
 * 查询印章图片
 * @param {Object} body
 */
export async function querySealPictures(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/** 查询协议用章|协议签署时验证手机号
 * @param {*} params
 */
export async function fetchVerifyPhoneNum(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/query-phoneNum`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取手机验证码
 * @param {Object} body
 */
export async function getVerifyCode(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/send-verified-code`, {
    method: 'POST',
    body,
  });
}

/**
 * 手机验证 签章
 * @param {Object} body
 */
export async function confirmMobileChapter(body) {
  const { pcHeaderId } = body;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header-signs/${pcHeaderId}`, {
    method: 'POST',
    body,
  });
}

/**
 * 无手机验证 签章
 * @param {Object} body
 */
export async function confirmChapter(body) {
  const { pcHeaderId } = body;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header-signs/${pcHeaderId}`, {
    method: 'POST',
    body,
  });
}

/**
 * 获取文件列表 用于下载预览
 * @param {Object} body
 */
export async function getFileList(body) {
  return request(`/hfle/v1/${organizationId}/files?bucketName=private-bucket`, {
    method: 'POST',
    body,
  });
}

/**
 * 签章重试接口
 * @param {Object} body
 */
export async function signRetry(body) {
  return request(`${SRM_SPCM}/v1/purchase-contract-fdd/${organizationId}/fdd-sign-callback`, {
    method: 'POST',
    body,
  });
}
