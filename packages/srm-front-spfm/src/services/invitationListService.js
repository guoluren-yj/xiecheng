import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';

/**
 * 查询邀约汇总列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
const organizationId = getCurrentOrganizationId();
export async function fetchInviteList(params) {
  const { page, size, customizeUnitCode, ...otherParams } = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/invites`, {
    method: 'POST',
    body: otherParams,
    query: {
      page,
      size,
      customizeUnitCode,
    },
  });
}

/**
 * 查询是否启用隐私政策
 * @param {Object} params - 查询参数
 */
export async function fetchPrivacyPolicy(params) {
  const settingCode = '010011'; // 隐私政策code
  const partnerTenantId = params.tenantId;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/settings/${settingCode}/${partnerTenantId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询隐私政策详细
 * @param {Object} params - 查询参数
 */
export async function fetchPrivacyPolicyText(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/static-texts/text/by-code`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 批量拒绝
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function rejectInviteList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/batch-reject`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 批量审批
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function approveInviteList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/batch-approve-with-supplier-cate`, {
    method: 'POST',
    body: params,
  });
}

// 查询风险扫描
export async function fetchRiskScan(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan`, {
    method: 'GET',
    query: params,
  });
}

// /**
//  * 校验是否开启了风控服务
//  * @param {Object} params 修改参数
//  */
// export async function riskEmbedFlag() {
//   // return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
//   return request(`${SRM_SSLM}/v1/${organizationId}/monitor/isExistsAccount`, {
//     method: 'GET',
//   });
// }
/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function riskEmbedPage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    query: params,
  });
}

// 我收到的邀约-同意合作弹框表单数据源
export async function fetchApproveForm(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/invite-list/customize`, {
    method: 'GET',
    query: params,
  });
}
