/*
 * enterpriseCertificationService - 新认证Service
 * @Date: 2022-07-05 15:36:24
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel, parseParameters } from 'utils/utils';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
// import { HZERO_PLATFORM } from 'utils/config';
// import { queryLovData } from 'services/api';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 *  公共值集查询默认值
 * @param {*} params lovCode: 值集编码，serverCode: 服务简码
 */
// export function handleDefaultLovData(params = {}) {
//   const { serverCode = SRM_PLATFORM, lovCode = '', page = 0, size = 10, ...others } = params;
//   return queryLovData(`${serverCode}/v1/lovs/sql/data`, {
//     lovCode,
//     page,
//     size,
//     ...others,
//   });
// }

/**
 * 查询门户管理配置
 * @param {*} params
 * @returns
 */
export async function fetchPortal(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-assigns-customize`, {
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
 * 保存登记信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveBasicInfo(params) {
  const { changeReqId, dataSource } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-basic-req`, {
    method: 'PUT',
    body: params,
    query: { changeReqId, dataSource },
  });
}

/**
 * 保存次要信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveSecondaryInfo(params) {
  const { dataSource, changeReqId, sourceKey, customizeUnitCode } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-change/update`, {
    method: 'PUT',
    body: params,
    query: { dataSource, sourceKey, changeReqId, customizeUnitCode },
  });
}

/**
 * 提交审批
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function submitApproval(params) {
  const { changeReqId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/submit-enteringReq`, {
    method: 'POST',
    body: params,
    query: { changeReqId },
  });
}

/**
 * 查询登记信息
 */
export async function queryCompanyBasic(params) {
  const { changeReqId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-basic-req/after/${changeReqId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询业务信息
 */
export async function queryBussiness(params) {
  const { changeReqId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-business-req/after/${changeReqId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 企业屏蔽查询
 * @export
 */
export async function fetchShield() {
  if (TenantRoleLevel) {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/companies/business/query-shield-setting`,
      {}
    );
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/business/query-shield-setting`, {});
  }
}

/**
 * orc识别
 * @param {*} params
 * @returns
 */
export async function fetchCompanyFromOcr(params) {
  const { url } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-attestations/new-com-ocr`, {
    method: 'GET',
    query: {
      url,
    },
  });
}

/**
 * 公共查询接口
 * @param {*} params
 * @returns
 */
export async function fetchPublicData(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-weburl`, {
    method: 'GET',
    query: {
      webUrl: params,
    },
  });
}

// 查询实名认证
export function queryRealNameAttestation(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-attestations`, {
    method: 'GET',
    query: params,
  });
}

// 查询页签配置
export function queryTabDataConfig(params = {}) {
  const { changeReqId, ...others } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-headers/${changeReqId}/all-detail`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 获取验证码
export async function getAuthCode(params, type) {
  switch (type) {
    case 'PHONE': {
      const saveData = params;
      const { idType, idCard } = saveData;
      if (idType !== 'I') {
        saveData.idCard = null;
        saveData.passport = idCard;
      }
      return request(`${SRM_PLATFORM}/v1/${organizationId}/user-attestations/auth`, {
        method: 'POST',
        body: saveData,
      });
    }
    case 'EMAIL':
      return request(`${SRM_PLATFORM}/v1/${organizationId}/company-attestations/send-captcha`, {
        method: 'GET',
        query: params,
      });
    default:
      break;
  }
}

/**
 * 动态查询地区
 * @param {*} params
 * @returns
 */
export async function loadCityData(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/regions/regional-linkage`, {
      method: 'GET',
      query: params,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/regions/regional-linkage`, {
      method: 'GET',
      query: params,
    });
  }
}

// 查询关联企业-企业信息
export async function queryEnterprisesInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-attestations`, {
    method: 'GET',
    query: params,
  });
}

// 关联企业 认证
export async function relevanceEnterpriseVerify(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-attestations/attestation`, {
    method: 'POST',
    body: params,
  });
}

// 提交企业认证
export async function submitData(params) {
  const { changeReqId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/register-company/subimt/${changeReqId}`, {
    method: 'POST',
    body: params,
  });
}

// 重新关联企业
export async function reassociateEnterprise(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-attestations/reassociation`, {
    method: 'POST',
    body: params,
  });
}

// 重新实名认证
export async function reAuthenticate(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-attestations/reassociation`, {
    method: 'POST',
    body: params,
  });
}

// 次要信息提交
export async function submitSecondaryInfoData(params) {
  const { dataSource, changeReqId, sourceKey, customizeUnitCode } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/register-company/save-and-submit/enterprise/${changeReqId}`,
    {
      method: 'POST',
      body: params,
      query: { dataSource, changeReqId, sourceKey, customizeUnitCode },
    }
  );
}

// 管理员申请提交
export async function submitApplyManager(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/register-company/save-and-submit/enterprise-role/${params.changeReqId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 调查表提交
export async function submitInvestigation(params) {
  const { investgHeaderId, changeReqId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate/save-and-submit/${investgHeaderId}`,
    {
      method: 'POST',
      body,
      query: { changeReqId },
    }
  );
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
 * 认证地址信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryAddressInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/no-basic`, {
    method: 'GET',
    query: {
      ...params,
      page: 0,
      size: 0,
    },
  });
}

/**
 * 认证银行信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryBankInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/no-basic`, {
    method: 'GET',
    query: {
      ...params,
      page: 0,
      size: 0,
    },
  });
}

/**
 * 认证开票信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryInvoiceInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-invoice-reqs/all`, {
    method: 'GET',
    query: {
      ...params,
      page: 0,
      size: 0,
      companyId: -1,
    },
  });
}

/**
 * 认证财务信息
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function queryFinanceInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/all`, {
    method: 'GET',
    query: {
      ...params,
      page: 0,
      size: 0,
      companyId: -1,
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

/**
 * 校验银行账户
 *
 * @export
 * @param {*} params.companyId - 公司Id
 * @returns
 */
export async function checkBankAccount(params) {
  const { changeReqId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/register-company/check-bank/${changeReqId}`,
    {
      method: 'GET',
    }
  );
}

// 更新公司信息
export async function updateCompanyInfo() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-attestations/perfect`, {
    method: 'POST',
  });
}

// 打款成功-更换验证方式
export async function changeVerification() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-attestations/validation`, {
    method: 'POST',
  });
}

/**
 * 校验调查表是否更换
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function checkChangeInvestigate(params) {
  const { changeReqId, ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-change/is-switch-investigate`, {
    method: 'POST',
    body: others,
    query: { changeReqId },
  });
}

/**
 * 保存合作条款已读状态
 *
 */
export async function saveCooperateTermsStatus(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/read`, {
    method: 'GET',
    query: params,
  });
}

// 查询合作条款
export async function fetchCooperateTerms(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/static-texts/text/by-code/list-new`, {
    method: 'GET',
    query: params,
  });
}

// 查询智能审核相关数据
export async function fetchAiApproveData(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/getAiApproveResultsIdData`, {
    method: 'GET',
    query: params,
  });
}
