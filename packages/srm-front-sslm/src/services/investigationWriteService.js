/*
 * investigationWriteService - 调查表填写
 * @date: 2018/10/13 11:05:52
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchWriteList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/write`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
export async function fetchReceivedInvestigationDetail({
  investgHeaderId,
  customizeUnitCode = '',
  customizeTenantId = -1,
  desensitize = false,
}) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${investgHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode, customizeTenantId, desensitize },
  });
}
/*
 * pdf打印
 */
export async function handlePrint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${params.investgHeaderId}/print`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

/**
 * 查询采购方是否启用隐私政策
 */
export async function fetchPrivacyPolicy(params) {
  const settingCode = '010011'; // 隐私政策code
  const partnerTenantId = params.tenantId;
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/settings/${settingCode}/${partnerTenantId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询隐私政策详细
 */
export async function fetchPrivacyPolicyText(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/static-texts/text/by-code/list`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/*
 * excel打印
 */
export async function handleExcelPrint(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate/${params.investgHeaderId}/config-line-print`,
    {
      method: 'GET',
      query: params,
      responseType: 'text',
    }
  );
}

/**
 * 查询单个隐私政策详细
 * @param {Object} params - 查询参数
 */
export async function fetchSinglePrivacyPolicyText(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/static-texts/text/by-code`, {
    method: 'GET',
    query: params,
  });
}

/*
 * 保存操作人信息
 * @async
 * @returns {Object} fetch Promise
 */
export async function saveOperatorInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/consent_form`, {
    method: 'PUT',
    body: params,
  });
}
