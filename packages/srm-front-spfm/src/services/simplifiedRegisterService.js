/**
 * simplifiedRegisterService.js
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel, parseParameters } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * orc识别
 * @param {*} params
 * @returns
 */
export async function fetchCompanyFromOcr(params) {
  const { url } = params;

  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/com-ocr`, {
      method: 'GET',
      query: {
        url,
      },
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/com-ocr`, {
      method: 'GET',
      query: {
        url,
      },
    });
  }
}

/**
 * 联系人保存
 * @param {*} params
 * @returns
 */
export async function saveContactsData(params) {
  const { companyId, contactData } = params;

  if (TenantRoleLevel) {
    return request(
      `${SRM_PLATFORM}v1/${organizationId}/companies/contacts/${companyId}/batch-save`,
      {
        method: 'POST',
        body: contactData,
      }
    );
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/contacts/${companyId}/batch-save`, {
      method: 'POST',
      body: contactData,
    });
  }
}

/**
 * 查询门户管理配置
 * @param {*} params
 * @returns
 */
export async function fetchPortal(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/portal-assigns-customize`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询注册信息
 * @param {*} params
 * @returns
 */
export async function fetchUserDetail() {
  return request(`${HZERO_IAM}/hzero/v1/users/self/detail`, {
    method: 'GET',
    query: {
      organizationId,
    },
  });
}

/**
 * 更新营业执照url
 * @param {*} params
 * @returns
 */
export async function updateLicenceUrl(params) {
  return request(`${SRM_PLATFORM}/v1/companies/basic/update-licence`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询征信配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/customize-settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 注销账号
 * @param {*} params
 * @returns
 */
export async function destroyAccount(params) {
  return request(`${SRM_PLATFORM}/v1/company-retrieves/users/recyle/internal`, {
    method: 'POST',
    body: params,
  });
}
