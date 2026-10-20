import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * 查询当前最新的业务信息.
 * @export
 */
export async function queryCompanyBusiness(companyId) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/business/${companyId}`);
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/business/${companyId}`);
  }
}

/**
 * 更新公司业务信息.
 * @export
 */
export async function updateBusiness(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/business/${params.companyId}`, {
      method: 'PUT',
      body: params,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/business/${params.companyId}`, {
      method: 'PUT',
      body: params,
    });
  }
}

/**
 * 创建公司业务信息.
 * @export
 */
export async function createBusiness(params) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/business/${params.companyId}`, {
      method: 'POST',
      body: params,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/business/${params.companyId}`, {
      method: 'POST',
      body: params,
    });
  }
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
