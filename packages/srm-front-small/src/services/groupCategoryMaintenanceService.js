/**
 * groupCategoryMaintenance - 租户目录 - service
 * @date: 2019-2-2
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const SRM_PRODUCT = '/smpc';

const organizationId = getCurrentOrganizationId(); // 租户ID
/**
 * 平台目录数据查询
 * @export
 * @param {object} params 查询目录列表
 * @returns
 */
export async function fetchEcCatalog(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/catalogs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 平台目录数据查询
 * @export
 * @param {object} params 查询平台分类列表
 * @returns
 */
export async function getCategoryTreeList(type) {
  return request(
    `${SRM_MALL}/v1/${organizationId}/category/get-tree-list/by-tenant/${type === 'filterList'}`,
    {
      method: 'GET',
    }
  );
}

// export async function getCategoryTreeList() {
//   return request(`${SRM_MALL}/v1/${organizationId}/category/getTreeList`, {
//     method: 'GET',
//   });
// }

/**
 * 启用平台分类作为目录
 */
export async function addCategoryToDirectory({ list, flag }) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalogs/${flag}`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 平台目录新增/修改
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function addOrUpdateEcCatalog(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalogs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量启用禁用平台目录
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function batchSetEnable(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalogs/batch-enable-catalog`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用禁用平台目录
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function setPermissionSetEnable(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalogs`, {
    method: 'PUT',
    body: params,
  });
}

// 查询目录分配公司
export async function fetchAssignCompany(params) {
  const { catalogId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_MALL}/v1/${organizationId}/invisible-catalogs/${catalogId}`, {
    method: 'GET',
    query: param,
  });
}

// 保存目录分配公司
export async function saveAssignCompany(params) {
  const { catalogId, list = [] } = params;
  return request(
    `${SRM_MALL}/v1/${organizationId}/invisible-catalogs/catalog-assign/${catalogId}`,
    {
      method: 'POST',
      body: list,
    }
  );
}

// 查询公司分配目录公司列表
export async function fetchCompanyList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/invisible-catalogs/companys`, {
    method: 'GET',
    query: param,
  });
}

// 保存公司/角色/账户分配目录
export async function saveAssignCatalog(params) {
  const { userType, userId, roleId, companyId, list = [] } = params;
  if (userType === 'role') {
    return request(`${SRM_MALL}/v1/${organizationId}/catalog-role-assigns/role-assign/${roleId}`, {
      method: 'POST',
      body: list,
    });
  } else if (userType === 'account') {
    const newList = list.map((item) => ({ ...item, userId, selectFlag: item.checked ? 1 : 0 }));
    return request(`${SRM_MALL}/v1/${organizationId}/catalog-assigns`, {
      method: 'POST',
      body: newList,
    });
  } else {
    const id = userType === 'role' ? roleId : companyId;
    return request(`${SRM_MALL}/v1/${organizationId}/invisible-catalogs/company-assign/${id}`, {
      method: 'POST',
      body: list,
    });
  }
}

/**
 * 平台目录新增/修改
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function configUpdateCompanyCatalog(params) {
  return request(`${SRM_PRODUCT}/v1/${organizationId}/catalogs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存排序后的目录
 */
export async function handleCataSave(params) {
  return request(`${SRM_PRODUCT}/v1/${organizationId}/catalog-layouts/save-catalog-array`, {
    method: 'POST',
    body: params,
  });
}

export async function queryStoreList(params) {
  return request(`${SRM_PRODUCT}/v1/${organizationId}/catalog-layouts/get-catalog-array`, {
    method: 'GET',
    query: params,
  });
}

// 查询公司/角色/账户列表
export async function fetchList(params) {
  const { catalogId, userType = 'company', ...others } = parseParameters(params);
  const url =
    userType === 'role'
      ? `${SRM_MALL}/v1/${organizationId}/catalog-role-assigns/role-list`
      : userType === 'account'
      ? `${SRM_MALL}/v1/${organizationId}/catalog-assigns/user-list`
      : `${SRM_MALL}/v1/${organizationId}/invisible-catalogs/companys`;
  return request(url, {
    method: 'GET',
    query: others,
  });
}

// 查询单价限制列表
export async function fetchPriceLimitList(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalog-price-limits`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 删除单价限制
export async function delPriceLimit(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalog-price-limits`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存单价限制
export async function savePriceLimit(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalog-price-limits`, {
    method: 'POST',
    body: params,
  });
}

// 分配用户一级目录查询
export async function fetchFirstLevelList(params) {
  const { userId } = params;
  return request(`${SRM_MALL}/v1/${organizationId}/catalogs/list/assign-tree/${userId}`, {
    method: 'GET',
    query: {},
  });
}

// 分配用户子级目录查询
export async function fetchSubLevelList(params) {
  const { userId, parentCatalogId } = params;
  return request(
    `${SRM_MALL}/v1/${organizationId}/catalogs/list/${userId}/children/${parentCatalogId}`,
    {
      method: 'GET',
      query: {},
    }
  );
}

// 修改目录分配
export async function assignCategory(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/catalog-assigns`, {
    method: 'POST',
    body: params,
  });
}
