/*
 * @Date: 2024-08-19 11:25:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 补充信息
export async function createSupplementaryInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/create`, {
    method: 'POST',
    body: params,
  });
}

// 查询当前租户会员供应商装修信息
export async function fetchMemberInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/tenant-member-info`, {
    method: 'GET',
    query: params,
  });
}

// 更新当前租户会员供应商装修信息
export async function updateMemberInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/update`, {
    method: 'POST',
    body: params,
  });
}

// 发布当前租户会员供应商装修信息
export async function releaseMemberInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/release`, {
    method: 'POST',
    body: params,
  });
}

// 查询公司信息
export async function fetchCompanyInfo(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/query-member-company-info`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 删除卡片
export async function deleteCard(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-customizes/delete`, {
    method: 'DELETE',
    body: params,
  });
}

// 重新获取风险信息
export async function updateRiskInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/reacquire-risk-info`, {
    method: 'POST',
    body: params,
  });
}

// 重新获取标签信息
export async function updateLabelInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/reacquire-label-info`, {
    method: 'POST',
    body: params,
  });
}

// 判断当前租户是否能正常使用会员供应商功能
export async function checkMemberSupplierPayment(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/payment-enabled`, {
    method: 'GET',
    query: params,
  });
}
