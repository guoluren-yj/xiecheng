/*
 * bankService - 企业注册/银行信息
 * @date: 2018/10/13 10:42:57
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const prefix = `${SRM_PLATFORM}/v1`;
const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
/**
 * 查询银行信息列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function fetchBankData(params = {}) {
  const { desensitize } = params;
  if (TenantRoleLevel) {
    return request(`${prefix}/${organizationId}/companies/bank-accounts/${params.companyId}`, {
      method: 'GET',
      query: { desensitize },
    });
  } else {
    return request(`${prefix}/companies/bank-accounts/${params.companyId}`, {
      method: 'GET',
      query: { desensitize },
    });
  }
}
export async function saveBankData(params = {}) {
  const { desensitize } = params;
  if (TenantRoleLevel) {
    return request(`${prefix}/${organizationId}/companies/bank-accounts/${params.companyId}`, {
      method: 'POST',
      body: params.companyBankAccountList,
      query: { desensitize },
    });
  } else {
    return request(`${prefix}/companies/bank-accounts/${params.companyId}`, {
      method: 'POST',
      body: params.companyBankAccountList,
      query: { desensitize },
    });
  }
}

/**
 * 删除银行信息
 * @param {!Number} companyId 公司Id
 */
export async function deleteBankAccount(payload) {
  const { deleteRows, companyId } = payload;
  return request(`${SRM_PLATFORM}/v1/companies/bank-accounts/${companyId}/batch-delete`, {
    method: 'DELETE',
    body: deleteRows,
  });
}
