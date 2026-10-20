/**
 * service - 处理邀约
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
/**
 *获取邀请信息
 *
 * @export
 * @param {Number} params.invitedId 邀请Id
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function getInvitingInformation(params) {
  const { inviteId, organizationId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/invites/${inviteId}`, {
    method: 'GET',
    query: {
      customizeUnitCode: 'SPFM.PARTNER_INVITE.SENDSUPTOP',
    },
  });
}
/**
 *同意邀约
 *
 * @export
 * @param {Number} params.invitedId 邀请Id
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.objectVersionNumber 版本号
 * @returns
 */
export async function approveCoop(params) {
  return request(
    `${SRM_PLATFORM}/v1/${params.organizationId}/approve-with-supplier-cate/${params.inviteId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}
/**
 *拒绝邀约
 *
 * @export
 * @param {Number} params.invitedId 邀请Id
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.textValue 邀请说明
 * @param {Number} params.objectVersionNumber 版本号
 * @returns
 */
export async function rejectCoop(params) {
  const { textValue, objectVersionNumber } = params;
  return request(`${SRM_PLATFORM}/v1/${params.organizationId}/reject/${params.inviteId}`, {
    method: 'PUT',
    body: textValue
      ? { processMsg: params.textValue, objectVersionNumber }
      : { objectVersionNumber },
  });
}
/**
 *发送调查表
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
  return request(`${SRM_PLATFORM}/v1/${params.organizationId}/send-investigate`, {
    method: 'POST',
    body: params,
  });
}
/**
 *查询公司信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryCompany(params) {
  return request(`${SRM_PLATFORM}/v1/companies/latest`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询邀约公司信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryInviteCompanyInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/invite/latest`, {
    method: 'GET',
    query: params,
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
  const { organizationId, ...other } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/by-trigger`, {
    method: 'GET',
    query: other,
  });
}
/**
 *查找调查表详情
 *
 * @export
 * @param {*} params.investigateHeaderId - 调查表头Id
 * @returns
 */
export async function fetchInvestigationDetail(params) {
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate/${params.investigateHeaderId}`,
    {
      method: 'GET',
      query: { ...params },
    }
  );
}

/**
 * 查询是否启用隐私政策
 * @param {Object} params - 查询参数
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
 * @param {Object} params - 查询参数
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

/**
 *查询供应商分类信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function querySupplierCategoryDate(params) {
  const organizationId = getCurrentOrganizationId();
  const query = filterNullValueObject(parseParameters({ ...params }));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/list-partner`, {
    method: 'GET',
    query,
  });
}

/**
 * 校验供应商分类
 * @param {Object} params
 */
export async function checkClassify(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/check-intro-category`, {
    method: 'GET',
    query: params,
  });
}

/*
 * 查询中国值集对象
 * @async
 * @returns {Object} fetch Promise
 */
export async function getDefaultCountryInfo(params = {}) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/bank-account/default`, {
    method: 'POST',
    body: params,
  });
}

/*
 * pdf打印
 */
export async function handlePrint(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/${params.investgHeaderId}/print`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

/*
 * excel打印
 */
export async function handleExcelPrint(params) {
  const organizationId = getCurrentOrganizationId();
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

/**
 * 邀约邀请供应商校验合作伙伴
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function checkPartner(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/check-partner`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 查询单个隐私政策详细
 * @param {Object} params - 查询参数
 */
export async function fetchSelectPolicyText(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/static-texts/text/by-code-list`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}

// 撤回邀约
export async function handleWithdrawnInvite(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/supplier-withdrawn-invite/${params.inviteId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}
