/*
 * contractSignService - 协议签署
 * @date: 2019-05-22
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';

import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';

import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * confirmContract - 协议终止确认
 * @export
 * @param {*} params signFlag 确认标识
 * @param {*} params pcHeaderList 头列表
 */
export async function sureContract(params) {
  const { pcHeaderList } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/supplier-change-status?pcHeaderStatus=TERMINATION`,
    {
      method: 'PUT',
      body: pcHeaderList,
    }
  );
}

/**
 * confirmContract - 协议终止拒绝
 * @export
 * @param {*} params signFlag 确认标识
 * @param {*} params pcHeaderList 头列表
 */
export async function sureRejectContract(params) {
  const { pcHeaderList } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/supplier-change-status`, {
    method: 'PUT',
    body: pcHeaderList,
  });
}

/**
 * confirmContract - 协议确认
 * @export
 * @param {*} params signFlag 确认标识
 * @param {*} params pcHeaderList 头列表
 */
export async function confirmContract(params) {
  const { pcHeaderList } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-supplier-sign-confirm`, {
    method: 'POST',
    body: pcHeaderList,
  });
}

/**
 * confirmContract - 协议确认
 * @export
 * @param {*} params signFlag 确认标识
 * @param {*} params pcHeaderList 头列表
 */
export async function confirmContractPURCHASE(params) {
  const { pcHeaderList } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-supplier-sign-confirm/one-sign`,
    {
      method: 'POST',
      body: pcHeaderList,
    }
  );
}
/**
 * rejectContract - 协议拒绝
 * @export
 * @param {*} params signFlag 确认标识
 * @param {*} params pcHeaderList 头列表
 */
export async function rejectContract(params) {
  const { pcHeaderList, processRemark } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-supplier-sign-reject`, {
    method: 'POST',
    query: { processRemark },
    body: pcHeaderList,
  });
}
/**
 * 协议拟制详情头查询
 * @param {String} pcHeaderId - 头id
 */
export async function fetchHeader(params) {
  const { pcHeaderId, companyId, customizeUnitCode, authType } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/${companyId}`, {
    method: 'GET',
    query: { customizeUnitCode, authType },
  });
}
export async function queryList(params) {
  // 过滤掉空的
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/supplier-sign/page`, {
    query,
  });
}
/**
 * 模板协议编码列表ID刷新
 * @async
 * @function getHeaderAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getHeaderAttachmentUuid(data) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/pc-template/list`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 模板协议编码列表ID刷新
 * @async
 * @function getLineAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getLineAttachmentUuid(data) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/pc-template/list`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 更新采模板协议编码列表
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function update(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/order-type/save`, {
    method: 'POST',
    body: body.lines,
  });
}

/**
 * 查询公司印章信息
 * @async
 * @function update
 * @param {object}  params - 信息
 * @returns {object} fetch Promise
 */
export async function fetchSignImgList(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 发送验证码信息
 * @async
 * @function update
 * @param {object}  mobileNumber - 手机号码
 * @returns {object} fetch Promise
 */
export async function getCheckCode(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/send-verified-code`, {
    method: 'POST',
    body,
  });
}

/**
 * 有手机验证签章
 * @async
 * @function update
 * @param {object}   - 手机号码及验证码
 * @returns {object} fetch Promise
 */
export async function confirmMobile(body) {
  const { pcHeaderId } = body;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/purchase-verified-sign/supplier`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 无手机验证签章 电签接口
 * @async
 * @function update
 * @param {object}   -头Id,
 * @returns {object} fetch Promise
 */
export async function contractSign(body) {
  const { pcHeaderId } = body;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/purchase-sign/supplier`,
    {
      method: 'POST',
      body,
    }
  );
}

// queryButtonAuthority - 查询按钮权限
export async function queryButtonAuthority(params) {
  const { pcHeaderId } = params || {};
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/queryFieldDisplay/${pcHeaderId}`
  );
}

/**
 * confirmContract - 协议确认
 * @export
 * @param {*} params signFlag 确认标识
 * @param {*} params pcHeaderList 头列表
 */
export async function batchCheckContractConfirm(params) {
  const { pcHeaderList } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-check-contract-confirm`,
    {
      method: 'POST',
      body: pcHeaderList,
    }
  );
}
