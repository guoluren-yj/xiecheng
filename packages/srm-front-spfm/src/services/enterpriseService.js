import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * 查询公司信息.
 * @export
 */
export async function fetchEnterpriseInfo(params) {
  let companyId;
  let desensitize;
  if (typeof value === 'string'){
    companyId = params;
  }else {
    // 第二个参数是去脱敏标识，h0组件没有脱敏组件
    const { companyId: paramCompanyId, desensitize: paramDesensitize } = params || {};
    companyId = paramCompanyId;
    desensitize = paramDesensitize;
  }
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/collect`, {
      method: 'GET',
      query: {
        companyId,
        desensitize,
      },
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies`, {
      method: 'GET',
      query: {
        companyId,
        desensitize,
      },
    });
  }
}

/**
 * 查询当前最新的业务信息.
 * @export
 */
export async function queryCompanyBusiness(companyId) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/business/${companyId}`, {
      method: 'GET',
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/business/${companyId}`, {
      method: 'GET',
    });
  }
}

/*
 * 校验银行信息账户名称是否一致
 * @async
 * @returns {Object} fetch Promise
 */
export async function checkBankAccount(params) {
  const { companyId } = params;
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/${companyId}`, {
      method: 'GET',
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/${companyId}`, {
      method: 'GET',
    });
  }
}

/*
 * 校验银行信息（账户名称是否一致，银行账号是否重复）
 * @async
 * @returns {Object} fetch Promise
 */
export async function checkBankAccountCommon(params) {
  return request(`${SRM_PLATFORM}/v1/companies/bank`, {
    method: 'POST',
    body: params,
  });
}
