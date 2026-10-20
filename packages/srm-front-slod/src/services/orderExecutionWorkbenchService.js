import { SRM_SPUC, SRM_PLATFORM, SRM_SPCM, SRM_MDM } from '_utils/config';
import { HZERO_FILE, HZERO_PLATFORM } from 'utils/config';
import { HZERO_HFLE } from 'hzero-front/lib/utils/config.js';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

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
 * 撤回留言
 */
export async function recallMessage(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'DELETE',
    body: data,
  });
}

// 查询留言板数据
export async function queryMessage(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'GET',
    query,
  });
}

// 提交留言板数据
export async function sendMessage(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 打印
 * @async
 * @param {!number} poHeaderId - 订单头id
 * @function print
 */
export async function print(poHeaderId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 * 查询是否按行协同
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise
 */
export async function queryCollByLine() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/enable/coll_by_line`, {
    method: 'GET',
  });
}

/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
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
export async function confirmDetail(params) {
  const { query = {}, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/confirm-detail`, {
    method: 'POST',
    query,
    body: data,
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
export async function saveDetail(params) {
  const { query = {}, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/supplier/save`, {
    method: 'PUT',
    body: data,
    query,
  });
}

/**
 * 再次反馈
 */
export async function submitAfterConfirm(params) {
  const { data, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/submit/after-confirm`, {
    method: 'POST',
    body: data,
    query,
  });
}

/**
 * 列表按行反馈
 */
export async function listByLineFeedback(params) {
  const { data, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/confirm/line`, {
    method: 'POST',
    body: data,
    query,
  });
}

/**
 * 列表按行保存
 */
export async function listByLineSave(params) {
  const { data, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/confirm/save`, {
    method: 'POST',
    body: data,
    query,
  });
}

/**
 * 列表按行再次反馈
 */
export async function listByLineFeedbackAgain(params) {
  const { data, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/confirm/again_line`, {
    method: 'POST',
    body: data,
    query,
  });
}

/**
 * 查询附件列表
 */
export async function searchUuid(params) {
  const { bucketName, uuidList } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/check-uuids?bucketName=${bucketName}`, {
    method: 'POST',
    body: uuidList,
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
export async function confirm(params) {
  const { data, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/confirm`, {
    method: 'POST',
    body: data,
    query,
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
  if (pcHeaderId) {
    return request(`${SRM_SPUC}/v1/${organizationId}/po-header-signs/${pcHeaderId}`, {
      method: 'POST',
      body,
    });
  }
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

/**
 * 无手机验证 签章
 * @param {Object} body
 */
export async function confirmChapter(body) {
  const { pcHeaderId } = body;
  if (pcHeaderId) {
    return request(`${SRM_SPUC}/v1/${organizationId}/po-header-signs/${pcHeaderId}`, {
      method: 'POST',
      body,
    });
  }
}

/**
 * 获取文件列表 用于下载预览
 * @param {Object} body
 */
export async function getFileList(body) {
  return request(`${HZERO_HFLE}/v1/${organizationId}/files?bucketName=private-bucket`, {
    method: 'POST',
    body,
  });
}

/**
 * 整单-列表页反馈校验
 * @param {Object} body
 */
export async function getFeedbackVerificationList(params) {
  const { poHeaderList = [] } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-workbench/po-header/feedback/verify/sidebar`,
    {
      method: 'POST',
      body: poHeaderList,
      responseType: 'text',
    }
  );
}

/**
 * 明细-列表页反馈校验
 * @param {Object} body
 */
export async function getFeedbackVerificationDetailList(params) {
  const { data, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/po-line/feedback/verify/sidebar`, {
    method: 'POST',
    body: data,
    query,
    responseType: 'text',
  });
}

/**
 * 查询是否开启双单位配置
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise 0不开启双单位，1上下游和订单都开启，2仅订单开启
 */
export async function queryDoubleUomConfig(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/secondary/getcnf`, {
    method: 'GET',
    query: params,
  });
}

// 查询双单位基本数量换算关系
export async function queryDoubleUnitConversion(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 数量总计
 */
export async function OrderQuantity() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/count-supplier`, {
    method: 'GET',
  });
}

/**
 * 在线聊天室
 * @param {object} params - 接口传参
 */
export async function initChatOnlineRoom(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sodrChatOnlineRoom`, {
    query: params,
  });
}
