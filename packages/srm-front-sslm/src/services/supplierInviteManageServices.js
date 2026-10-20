/*
 * deliveryCreationService - 送货单创建
 * @date: 2018/11/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 认证审批通过
 * @param {Object} params 修改参数
 */
export async function approvalAdopt(params = {}) {
  // const { changeReqId } = params;
  return request(`${SRM_PLATFORM}/v1/company-actions/${organizationId}/new/approve`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 认证审批拒绝
 * @param {Object} params 修改参数
 */
export async function approvalReject(params = {}) {
  const { changeReqId, customizeUnitCode = '', ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/enterprise-change/${changeReqId}/registerReject`,
    {
      method: 'POST',
      body: { ...others },
      query: { customizeUnitCode },
    }
  );
}

/**
 * 采购方发出新邀约
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {!Number} params.inviteCompanyId 被邀请公司的Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function inviteSupplier(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/new/purchase-batch-invite`, {
    method: 'POST',
    body: { ...others },
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 邀请供应商注册
 * @async
 * @function companySearchInviteRegisterSupplier -函数名称
 * @param {Object} params - 更新参数
 * @returns {Object} fetch Promise
 */
export async function inviteRegisterSupplier(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-invite-register`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
    },
  });
}

export async function handleQueryCount(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/supplierInvite/count`, {
    method: 'GET',
    body: params,
  });
}

/**
 *不带调查表的拒绝邀约
 *
 * @export
 * @param {Number} params.invitedId 邀请Id
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.textValue 邀请说明
 * @param {Number} params.objectVersionNumber 版本号
 * @returns
 */
export async function inviteReject(params) {
  const { inviteId, ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/reject/${inviteId}`, {
    method: 'PUT',
    body: others,
  });
}

/**
 * 调查表的拒绝邀约
 *
 * @export
 * @param {Number} params.invitedId 邀请Id
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.textValue 邀请说明
 * @param {Number} params.objectVersionNumber 版本号
 * @returns
 */
export async function inviteInvestigateReject(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/invite-reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 调查表审批拒绝
 * @export
 * @param {Object} params
 */
export async function investigateReject(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/reject`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 *不带调查表的直接同意合作
 *
 * @export
 * @param {Number} params.invitedId 邀请Id
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.objectVersionNumber 版本号
 * @returns
 */
export async function approveCooperate(params) {
  const { inviteId, customizeUnitCode } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approve-with-supplier-cate/${inviteId}`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 *调查表的同意合作,勾选发送调查表
 *
 * @export
 * @param {String} params.investigateType - 调查类型
 * @param {Number} params.investigateTemplateId - 调查表模板Id
 * @param {Number} params.inviteId - 邀请Id
 * @param {Number} params.organizationId - 租户Id
 * @param {Number} params.objectVersionNumber - 版本号
 * @returns
 */
export async function sendInvestigate(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/send-investigate`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 带调查表同意合作
 * @export
 * @param {Object} params
 */
export async function handleAgree(params) {
  const { investgHeaderId, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/approve-site/${investgHeaderId}`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 *获取邀请信息
 *
 * @export
 * @param {Number} params.invitedId 邀请Id
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function queryInvitingInformation(params) {
  const { inviteId, code = '' } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/invites/${inviteId}`, {
    method: 'GET',
    query: {
      customizeUnitCode: code,
    },
  });
}

/**
 *查询调查表头信息
 *
 * @export
 * @param {*} params.investigateHeaderId - 调查表头Id
 * @returns
 */
export async function fetchHeaderInfo(params) {
  // const { ...other } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/by-trigger`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询公司所有信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryCompanyInfo(params) {
  return request(`${SRM_PLATFORM}/v1/companies/tenant/latest`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 认证联系人信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryContactInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/no-basic`, {
    method: 'GET',
    query: {
      ...params,
      page: 0,
      size: 0,
    },
  });
}

/**
 * 认证附件信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryAttachmentInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/no-basic`, {
    method: 'GET',
    query: {
      ...params,
      page: 0,
      size: 0,
    },
  });
}

// 查询页签配置
export function queryTabDataConfig(params = {}) {
  const { changeReqId, ...others } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-headers/customer/${changeReqId}/all-detail`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/*
 * 校验供应商分类
 * @param {Object} params
 */
export async function checkClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/check-intro-category`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * 三证验证
 * @param {Object} params 修改参数
 */
export async function approveAutoCertification(params) {
  return request(`${SRM_PLATFORM}/v1/company-actions/${organizationId}/enterprise-approve-auto`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询采购员，分类，品类多选单选标识（后端在这个接口api后置脚本）
 * @param {Object} params
 */
export async function companySearchOwn() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/corporation`, {
    method: 'GET',
  });
}

/**
 * 校验是否加入监控的企业
 * @param {Object} params 修改参数
 */
export async function checkJoinedMointor(params = {}) {
  const { companyId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/${companyId}/is-joined-mointor`, {
    method: 'GET',
  });
}

/**
 * 查询当前租户开通风控的服务
 */
export async function queryRiskMonitorType(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/opened-service-query`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 校验是否开启了风控服务
 * @param {Object} params 修改参数
 */
export async function checkRiskEmbed() {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/isExistsAccount`, {
    method: 'GET',
  });
}

/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function handleRiskEmbedPage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    query: params,
  });
}

// 获取最新风险扫描时间
export async function fetchLastRiskScanDate(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan/getRiskScanDate`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新邀约邀请供应商校验合作伙伴
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function checkPartner(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/check-partner`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 新邀约校验黑名单供应商
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function checkBlackListSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sup_black_list_check`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 *查询邀约处理公司所有信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryInviteCompanyInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/invite/latest`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 催办
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function urge(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-invite-register/urge`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 认证详情-保存
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveData(params) {
  const { changeReqId, customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/firm-entering-parents/save`, {
    method: 'POST',
    body: { ...others, changeReqId },
    query: { changeReqId, customizeUnitCode },
  });
}

/**
 * 邀约处理-批量拒绝
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function batchRejectInvite(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/batch-reject`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 邀约处理-批量同意-不带调查表
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function batchApproveInvite(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/batch-approve-with-supplier-cate`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 邀约处理-批量同意-带调查表
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function batchApproveInvestigate(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/batch-send-investigate`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 邀约处理-补发邀约校验
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function reInvitationCheck(params) {
  const { inviteId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/compensate-invite-check/${inviteId}`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 邀约处理-补发邀约
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function reInvitation(params) {
  const { inviteId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/compensate-invite/${inviteId}`, {
    method: 'POST',
    body: { ...params },
  });
}

// 查询租户级用户账号是否注销
export function queryTenantUserAccountLogOff(params = {}) {
  return request(`${SRM_PLATFORM}/v1/company-actions/${organizationId}/register/check`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询邀约处理公司所有信息
 *
 * @export
 * @param {*} params.inviteId - 邀约Id
 * @returns
 */
export async function queryCompanyOtherInfo(params) {
  const { inviteId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/query/${inviteId}`, {
    method: 'GET',
  });
}

// 获取最近一次风险扫描结果
export async function fetchLastRiskScanInfo(params) {
  return request(`/sdat/v1/${organizationId}/risk-report-record/risk-scan-latest`, {
    method: 'GET',
    query: params,
  });
}

// 会员供应商明细
export async function fetchMemberSupplierDetail({ memberInfoId, ...rest }) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-member-infos/member-detail-info/${memberInfoId}`,
    {
      method: 'GET',
      query: rest,
    }
  );
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

/**
 * 新邀约校验黑名单供应商
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function batchQueryBlackListSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sup_black_list_check_batch`, {
    method: 'POST',
    body: params,
  });
}
