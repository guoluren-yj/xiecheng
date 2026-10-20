/*
 * @Description: certificateAuthorityService - CA认证
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-06 16:09:07
 * @LastEditTime: 2022-09-06 14:49:20
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hands
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';

const organizationId = getCurrentOrganizationId();
/**
 * 查询列表
 * @param {Object} params - 查询参数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存列表页
 */
export async function save(body) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/batch-save`, {
    method: 'PUT',
    body,
  });
}
/**
 * 查询明细
 * @param {Object} params - 查询参数
 */
export async function fetchDetailInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/detail`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存明细
 */
export async function saveDetail(body) {
  const { authType } = body;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info`, {
    method: 'PUT',
    body,
    query: { authType },
  });
}

/**
 * 提交明细
 */
export async function submitDetail(body) {
  const { companyId } = body;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/${companyId}/submit`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 提交明细
 */
export async function approve(body) {
  // const { companyId } = body;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/account_register`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 重置流程
 */
export async function resetProcess(body) {
  const { authInfoId, authType } = body;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/reset_process/${authInfoId}`,
    {
      method: 'PUT',
      query: { authType },
      body,
    }
  );
}

/**
 * 查询认证信息
 * @async
 * @function saveAvatar
 * @param {String} params - 保存参数
 */
export async function fetchAuthentication(params) {
  const { userId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/get-auth-type`, {
    method: 'GET',
    query: userId,
  });
}

/**
 * 实名认证详细信息
 * @async
 * @function saveAvatar
 * @param {String} params - 保存参数
 */
export async function fetchAuthInfo(params) {
  const { userId } = params;
  return request(`${HZERO_IAM}/v1/${organizationId}/user-auth-info/auth-detail/${userId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 公司实名认证详细信息
 * @async
 * @function saveAvatar
 * @param {String} params - 保存参数
 */
export async function companyVerify(params) {
  // const { userId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/company-verify-url`,
    {
      method: 'POST',
      body: params,
      responseType: 'text',
    }
  );
}

/**
 * 公司实名认证详细信息 通用
 * @async
 * @function saveAvatar
 * @param {String} params - 保存参数
 */
export async function commonCompanyVerify(params) {
  // const { userId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/common/company-verify-url`,
    {
      method: 'POST',
      body: params,
      responseType: 'text',
    }
  );
}

/**
 * 获取开通电子签服务地址
 * @param {Object} params - 参数
 */
export async function fetchElectronicSignatureUrl(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/fdd-company-openService`,
    {
      method: 'POST',
      body: query,
      responseType: 'text',
    }
  );
}

/**
 * 查询是否有公司开通了电子签章服务
 * @param {Object} params - 参数
 */
export async function fetchElectronicSignatureFlag(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/get-open-service`, {
    method: 'GET',
    query,
  });
}

/**
 * 法大大添加关系
 * @param {Object} params - 参数
 */
export async function addRelationship(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/fdd-add-subCompany`, {
    method: 'POST',
    body: query,
    responseType: 'text',
  });
}

/**
 * 法大大移除关系
 * @param {Object} params - 参数
 */
export async function removeRelationship(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/fdd-remove-subCompany`,
    {
      method: 'POST',
      body: query,
      responseType: 'text',
    }
  );
}

/**
 * 查询配置表中（spfm新功能白名单）
 */
export async function fetchConfig(params) {
  const tableCode = 'spfm_ca_entrust_function';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}
