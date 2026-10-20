/*
 * index-印章管理
 * @date: 2019-08-07
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';

const organizationId = getCurrentOrganizationId();

// 查询-列表页
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/page`, {
    method: 'GET',
    query,
  });
}

/**
 * -详情头查询
 * @param {String} pcTypeId - 头id
 */
export async function queryModalList(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { companyId } = query;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${companyId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 模态框保存修改
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function update(body) {
  const { sealType } = body;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/seal/company/${body.companyId}/batch-save/${sealType}`,
    {
      method: 'POST',
      body: body.lines,
    }
  );
}

/**
 * -模态框删除功能
 */
export async function deletes(params) {
  const { body, companyId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${companyId}/batch-delete`, {
    method: 'DELETE',
    body,
  });
}

export async function fetchAuthentication(params) {
  const { userId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/get-auth-type`, {
    method: 'GET',
    query: userId,
  });
}

//  查询子账户权限
export async function queryAuthorizeList(params) {
  const { companyId } = params;
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-user-impowers/${companyId}`, {
    method: 'GET',
    query,
  });
}

export async function queryAuthorizeDetail(params) {
  const { userId } = params;
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_IAM}/v1/${organizationId}/user-auth-info/auth-detail/${userId}`, {
    method: 'GET',
    query,
  });
}

export async function saveAuthSign(params) {
  const { companyUserImpowers } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-user-impowers`, {
    method: 'POST',
    body: companyUserImpowers,
  });
}

export async function deleteAuthSign(params) {
  const { companyUserImpowers } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-user-impowers`, {
    method: 'DELETE',
    body: companyUserImpowers,
  });
}

// 同步印章
export async function autoSignature(params) {
  const { record, companyId, ...otherParams } = params;
  const fddBaseResultDTO = [{ ...record, ...otherParams }];
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${companyId}/add-signature`, {
    method: 'POST',
    body: fddBaseResultDTO,
  });
}

// 删除法大大印章
export async function daleteSeal(params) {
  const { companyId, lines } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${companyId}/batch-delete`, {
    method: 'POST',
    body: lines,
  });
}

// 生成印章
export async function generateSeal(params) {
  const { companyId, partnerTenant } = params;

  let url = `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-seal/company/${companyId}/generation-seal`;
  if (partnerTenant || partnerTenant == 0) {
    url = `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-seal/company/${companyId}/generation-seal?partnerTenant=${partnerTenant}`;
  }
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 同步到系统
export async function synchronize(params) {
  const { companyId, partnerTenant } = params;

  let url = `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-seal/company/${companyId}/sync-seal/seal-management`;
  if (partnerTenant || partnerTenant == 0) {
    url = `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-seal/company/${companyId}/sync-seal/seal-management?partnerTenant=${partnerTenant}`;
  }

  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 查询印章历史版本(确认印章编码是否重复)
export async function queryHistoryVersion(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/generate-seal-record/manage-generate/union-all`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 查询可授权印章列表(左)
 * @param {Object} params 修改参数
 */
export async function fetchLeftSealList(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { companyId } = query;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${companyId}/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询已授权印章列表(右)
 * @param {Object} params 修改参数
 */
export async function fetchRightSealList(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { impowerId } = query;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-seal-authorizes/${impowerId}/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 授权印章-添加
 * @param {Object} params 修改参数
 */
export async function fddAuthorize(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-user-impowers/fdd-authorize`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 授权印章-删除
 * @param {Object} params 修改参数
 */
export async function fddCancelAuthorize(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-user-impowers/fdd-cancel-authorize`,
    {
      method: 'POST',
      body: params,
    }
  );
}
