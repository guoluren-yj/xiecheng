/*
 * deliveryCreationService - 送货单创建
 * @date: 2018/11/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 审批通过
 * @param {Object} params 修改参数
 */
export async function approvalAdopt(params = {}) {
  const { changeReqId } = params;
  return request(`${SRM_PLATFORM}/v1/company-actions/new/approve`, {
    method: 'POST',
    query: { changeReqId },
  });
}

/**
 * 认证审批拒绝
 * @param {Object} params 修改参数
 */
export async function approvalReject(params = {}) {
  const { changeReqId, ...others } = params;
  return request(`${SRM_SSLM}/v1/enterprise-change/${changeReqId}/registerReject`, {
    method: 'POST',
    body: { ...others },
  });
}

/**
 * 查询公司信息
 * @param {Object} params 修改参数
 */
export async function queryCompanyInfo(params = {}) {
  const { changeReqId, ...others } = params;
  return request(`${SRM_PLATFORM}/v1/company-actions/info/${changeReqId}`, {
    method: 'GET',
    query: {
      ...others,
    },
  });
}

/**
 * 三证验证
 * @param {Object} params 修改参数
 */
export async function approveAutoCertification(params) {
  return request(
    `${SRM_PLATFORM}/v1/company-actions/enterprise-approve-auto
  `,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 查询页签配置
export function queryTabDataConfig(params = {}) {
  const { changeReqId, ...others } = params;
  return request(`${SRM_PLATFORM}/v1/strategy-cf-headers/customer/${changeReqId}/all-detail`, {
    method: 'GET',
    query: others,
  });
}

// 查询平台级用户账号是否注销
export function querySiteUserAccountLogOff(params = {}) {
  return request(`${SRM_PLATFORM}/v1/company-actions/${organizationId}/register/check-site`, {
    method: 'GET',
    query: params,
  });
}
