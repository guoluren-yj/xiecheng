/*
 * @Description: contractChapterService - 协议用章
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:05:55
 * @LastEditTime: 2019-08-20 22:59:07
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * -查询列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-sign/page`, {
    method: 'GET',
    query,
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
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchOperationRecord(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { pcHeaderId, ...otherQuery } = query;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/page`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 手机验证 签章
 * @param {Object} body
 */
export async function confirmMobileChapter(body) {
  const { pcHeaderId } = body;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/purchase-verified-sign`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 无手机验证 签章
 * @param {Object} body
 */
export async function confirmChapter(body) {
  const { pcHeaderId } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/purchase-sign`, {
    method: 'POST',
    body,
  });
}

/**
 * 协议退回
 * @param {Object} body
 */
export async function rollbackContract(body) {
  const { pcHeaderIds, backReason } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/stamped-back`, {
    method: 'POST',
    body: pcHeaderIds,
    query: { backReason },
  });
}

/**
 * 协议退回至供应商
 * @param {Object} body
 */
export async function rollbackToSupplier(body) {
  const { pcHeaderIds, backReason } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/supplier/stamped-back`, {
    method: 'POST',
    body: pcHeaderIds,
    query: { backReason },
  });
}
