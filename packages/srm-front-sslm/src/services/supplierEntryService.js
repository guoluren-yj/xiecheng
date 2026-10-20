/**
 * supplierEntryServices - 供应商录入 - service
 * @date: 2022-03-26
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { HZERO_PLATFORM, HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel, parseParameters } from 'utils/utils';

const TenantRoleLevel = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

/**
 * 保存录入单基本信息和企业基本信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveBasicInfo(params) {
  const { changeReqId, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq/save`, {
    method: 'POST',
    body: params,
    query: { changeReqId, customizeUnitCode },
  });
}

/**
 * 保存录入单企业信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveCompanyInfo(params) {
  const { dataSource, sourceKey, changeReqId, customizeUnitCode } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-change/update`, {
    method: 'PUT',
    body: params,
    query: { dataSource, sourceKey, changeReqId, customizeUnitCode },
  });
}

/**
 * 企业信息下一步
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function companyInfoNext(params) {
  const { dataSource, sourceKey, changeReqId, customizeUnitCode } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-change/must-tab-check`, {
    method: 'POST',
    body: params,
    query: { dataSource, sourceKey, changeReqId, customizeUnitCode },
  });
}

/**
 * 保存录入单合作信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveCooperativeInfo(params) {
  const { changeReqId, customizeUnitCode, wfParams, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/firm-entering-parents/save`, {
    method: 'POST',
    body: { changeReqId, ...rest },
    query: { changeReqId, customizeUnitCode, ...wfParams },
  });
}

/**
 * 录入单---提交审批
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
 * 查询门户管理配置
 * @param {*} params
 * @returns
 */
export async function fetchPortal(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-assigns-customize/tabs`, {
    method: 'GET',
    query,
  });
}

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
 *查询模板定义
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryTmpl(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/score-indicators/std`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询查询当前登录人对应的采购员
 * @param {Object} params
 */
export async function queryCurrentUserPurchaseAgent() {
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/list-current-user-purchase-agent`, {
    method: 'GET',
  });
}

/**
 *保存模板定义
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function createEntryForm(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取行业.
 * @export
 */
export async function fetchIndustries(payload) {
  return request(`${HZERO_PLATFORM}/v1/industries/tree?domesticFlag=${payload || 0}`);
}

/**
 * 获取行业品类.
 * @export
 */
export async function fetchIndustryCategories(idList) {
  // TODO:
  return request(`${HZERO_PLATFORM}/v1/industries/categories/tree`, {
    method: 'GET',
    query: {
      industryIdList: idList.join(','),
      enabledFlag: 1,
    },
  });
}

/**
 * 查询公司信息.
 * @export
 */
export async function fetchEnterpriseInfo(changeReqId) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-business-req/after/${changeReqId}`, {
    method: 'GET',
    query: {
      changeReqId,
      dataSource: 3,
      // customizeUnitCode: customizeUnitCode.join(),
    },
  });
}

/**
 * 查询公司开票信息
 * @async
 * @function fetchInvoiceInfo
 * @param {object} params - 查询条件
 * @param {!string} params.companyId - 公司id
 * @returns {object} fetch Promise
 */
export async function fetchInvoiceInfo(params) {
  if (TenantRoleLevel) {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/company-invoices/queryInvoiceNotCreate/${params.companyId}/${params.companyBasicId}`,
      {
        method: 'GET',
      }
    );
  } else {
    return request(
      `${SRM_PLATFORM}/v1/company-invoices/queryInvoiceNotCreate/${params.companyId}/${params.companyBasicId}`,
      {
        method: 'GET',
      }
    );
  }
}

/**
 * 获取附件类型
 * @async
 * @function queryAttachmentType
 * @param {object[]} params - 查询条件
 * @param {?string} params.SPFM.COMPANY.ATTACHMENT_TYPE - 附件类型
 * @param {?string} params.SPFM.COMPANY.SUB_ATTACHMENT - 附件子类型
 * @returns {object} fetch Promise
 */
export async function queryAttachmentType(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询公司信息.
 * @export
 */
export async function handleDeleteEntry(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询公司信息.
 * @export
 */
export async function handleQueryCount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq/count`, {
    // sslm/v1/{organizationId}/enterprise-change/enteringReq/count
    method: 'GET',
    body: params,
  });
}

/**
 * 查询录入的供应商和当前采购方合作伙伴关系
 * @param {*} params
 * @returns
 */
export async function fetchPartnerShip(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/com-basic-req/company-basic`, {
    method: 'GET',
    query: params,
  });
}

/**
 *调查表模板切换标识
 * @export
 * @param {*} params
 * @returns
 */
export async function checkSwitchInvestigate(params) {
  const { changeReqId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/firm-entering-parents/is-switch-investigate`, {
    method: 'POST',
    body: params,
    query: { changeReqId },
  });
}

/**
 * 整单大保存
 * @export
 * @param {*} params
 * @returns
 */
export async function saveWholeOrderData(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq/save-wlf`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

// 查询智能审核相关数据
export async function fetchAiApproveData(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ai-approve-resultss/getAiApproveResultsIdData`, {
    method: 'GET',
    query: params,
  });
}
