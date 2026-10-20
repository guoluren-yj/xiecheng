/**
 * searchPurchaserServices - 发现采购方
 * @date: 2023-11-14
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *查询公司所有信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryCompanyInformation(params) {
  return request(`${SRM_PLATFORM}/v1/companies/latest`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商发出邀约
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {!Number} params.inviteCompanyId 被邀请公司的Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function companySearchInviteSupplier(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-invite`, {
    method: 'POST',
    body: { ...others, tenantId: organizationId },
    query: {
      customizeUnitCode,
    },
  });
}
