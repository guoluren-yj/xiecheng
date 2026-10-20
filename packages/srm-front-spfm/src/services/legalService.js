import { isUndefined, isNull } from 'lodash';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import request from 'utils/request';
import { HZERO_PLATFORM, HZERO_IAM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

const TenantRoleLevel = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

/**
 * 初始化值集.
 * @export
 */
export async function initValueList() {
  return queryMapIdpValue({
    companyType: 'HPFM.COMPANY_TYPE',
    taxpayerType: 'HPFM.TAXPAYER_TYPE',
  });
}

/**
 * 查询当前最新的企业信息.
 * @export
 */
export async function queryCompanyBasic() {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic`);
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/basic`);
  }
}

/**
 * 查询国家地区.
 * @param {Number} countryId 国家ID
 * @export
 */
export async function queryProvinceCity(countryId) {
  return request(`${HZERO_PLATFORM}/v1/countries/${countryId}/regions`, {
    method: 'GET',
    query: {
      enabledFlag: 1,
    },
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
 * 从百度OCR接口获取企业信息.
 * @param {Object} params
 * @export
 */
export async function fetchCompanyInfoFromOcr(params) {
  const { url } = params;

  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/ocr`, {
      method: 'GET',
      query: {
        url,
      },
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/ocr`, {
      method: 'GET',
      query: {
        url,
      },
    });
  }
}

/**
 * 保存.
 * @param {Object} params
 * @export
 */
export async function saveLegalInfo(params) {
  if ((isUndefined(params.companyId) || isNull(params.companyId)) && TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic`, {
      method: 'POST',
      body: params,
    });
  } else if ((isUndefined(params.companyId) || isNull(params.companyId)) && !TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/companies/basic`, {
      method: 'POST',
      body: params,
    });
  } else if (params.companyId && !TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/companies/basic/${params.companyId}`, {
      method: 'PUT',
      body: params,
    });
  } else if (params.companyId && TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic/${params.companyId}`, {
      method: 'PUT',
      body: params,
    });
  }
}

/**
 * 保存公司基础信息-租户级.
 * @param {Object} params
 * @export
 */
export async function saveOrgLegalInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${params.organizationId}/companies/basic`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 验证统一社会信用代码.
 * @param {Object} params
 * @export
 */
export async function validateUnifiedSocialCode(param) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic/unified-social-code`, {
      method: 'GET',
      query: param,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/basic/unified-social-code`, {
      method: 'GET',
      query: param,
    });
  }
}

/**
 * 验证统一社会信用代码.
 * @param {Object} params
 * @export
 */
export async function validateCompanyName(param) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/basic/company-name`, {
      method: 'GET',
      query: param,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/basic/company-name`, {
      method: 'GET',
      query: param,
    });
  }
}

/**
 * 查询用户注册时的企业名称.
 * @function queryCompanyName
 * @export
 */
export async function queryCompanyName() {
  return request(`${HZERO_IAM}/hzero/v1/users/self/company-name`, {
    method: 'GET',
  });
}

// 模糊查询企业名称-平台
export async function fetchPlatFormSimilarCompanyName(params) {
  return request(`${SRM_PLATFORM}/v1/companies/basic/qccSearch`, {
    method: 'POST',
    body: params,
  });
}
