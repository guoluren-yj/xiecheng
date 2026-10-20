/*
 * contractMaintainService - 协议审批
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  //   getResponse,
} from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

import { HZERO_PLATFORM } from 'utils/config';

const organizationId = getCurrentOrganizationId();

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
 * 是否开户电签
 */
export async function queryElectronicFlag(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/electronicFlag/query`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 是否开户
 */
export async function queryIsSign(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/isSign/query`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 是否手机号码
 */
export async function queryPhoneNumber(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/phoneNumber/query`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 生成文档
 */
export async function queryDocument(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/order-sign-file/document`, {
    method: 'POST',
    query: params,
    responseType: 'text',
  });
}

/**
 * 签署
 */
export async function signDocument(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/order-sign-file/signDocument`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 签署
 */
export async function smsParam(companyId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smsParam/${companyId}`, {
    method: 'GET',
  });
}
