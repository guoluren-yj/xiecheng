import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';
const SRM_SMAL = '/smal';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 分类树查询
 */
export async function fetchCategoryTreeList(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/category-ref`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询子目录
 */
export async function fetchSubCatalog(params) {
  const { catalogId } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/sub-catalog/${catalogId}`, {
    method: 'GET',
    query: params,
  });
}

// 查询平台分类树
export async function fetchTree(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/category-ref`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 启用平台分类作为目录
 */
export async function addCategoryToDirectory(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/create-by-category`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存目录
 */
export async function saveCatalog(params) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalogs?customizeUnitCode=SMPC.CATALOG_MANAGE.MATAIN.FORM`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 批量启用目录
 */
export async function batchSetEnable(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/batch-enable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量禁用目录
 */
export async function batchSetDisable(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/batch-disable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 单个启用目录
 */
export async function setEnable(params) {
  const { catalogId, catalogs } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/enable/${catalogId}`, {
    method: 'POST',
    body: catalogs,
  });
}

/**
 * 单个禁用目录
 */
export async function setDisable(params) {
  const { catalogId, catalogs } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/disable/${catalogId}`, {
    method: 'POST',
    body: catalogs,
  });
}

// 查询目录分配公司
export async function fetchAssignCompany(params) {
  const { catalogId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_SMPC}/v1/${organizationId}/invisible-catalogs/${catalogId}`, {
    method: 'GET',
    query: param,
  });
}

// 保存目录分配公司
export async function saveAssignCompany(params) {
  const { catalogId, list = [] } = params;
  return request(
    `${SRM_SMPC}/v1/${organizationId}/invisible-catalogs/catalog-assign/${catalogId}`,
    {
      method: 'POST',
      body: list,
    }
  );
}

// 查询公司分配目录公司列表
export async function fetchCompanyList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SMPC}/v1/${organizationId}/invisible-catalogs/companys`, {
    method: 'GET',
    query: param,
  });
}

// 保存公司/角色/账户分配目录
export async function saveAssignCatalog(params) {
  const { userType, userId, roleId, companyId, list = [] } = params;
  if (userType === 'role') {
    return request(`${SRM_SMPC}/v1/${organizationId}/catalog-role-assigns/role-assign/${roleId}`, {
      method: 'POST',
      body: list,
    });
  } else if (userType === 'account') {
    const newList = list.map((item) => ({ ...item, userId, selectFlag: item.checked ? 1 : 0 }));
    return request(`${SRM_SMPC}/v1/${organizationId}/catalog-assigns`, {
      method: 'POST',
      body: newList,
    });
  } else {
    const id = userType === 'role' ? roleId : companyId;
    return request(`${SRM_SMPC}/v1/${organizationId}/invisible-catalogs/company-assign/${id}`, {
      method: 'POST',
      body: list,
    });
  }
}

/**
 * 平台目录新增/修改
 */
export async function configUpdateCompanyCatalog(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/com-catalog/save-catalog-for-array`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存排序后的目录
 */
export async function handleCataSave(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/com-catalog/save-catalog-array`, {
    method: 'POST',
    body: params,
  });
}

export async function queryStoreList(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/com-catalog/get-catalog-array`, {
    method: 'GET',
    query: params,
  });
}

// 查询公司/角色/账户列表
export async function fetchList(params) {
  const { catalogId, userType = 'company', ...others } = parseParameters(params);
  const url =
    userType === 'role'
      ? `${SRM_SMPC}/v1/${organizationId}/catalog-role-assigns/role-list`
      : userType === 'account'
      ? `${SRM_SMPC}/v1/${organizationId}/catalog-assigns/user-list`
      : `${SRM_SMPC}/v1/${organizationId}/invisible-catalogs/companys`;
  return request(url, {
    method: 'GET',
    query: others,
  });
}

// 查询单价限制列表
export async function fetchPriceLimitList(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-price-limits`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 删除单价限制
export async function delPriceLimit(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-price-limits`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存单价限制
export async function savePriceLimit(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-price-limits`, {
    method: 'POST',
    body: params,
  });
}

// 分配用户一级目录查询
export async function fetchFirstLevelList(params) {
  const { userId } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/list/assign-tree/${userId}`, {
    method: 'GET',
    query: {},
  });
}

// 分配用户子级目录查询
export async function fetchSubLevelList(params) {
  const { userId, parentCatalogId } = params;
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalogs/list/${userId}/children/${parentCatalogId}`,
    {
      method: 'GET',
      query: {},
    }
  );
}

// 修改目录分配
export async function assignCategory(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-assigns`, {
    method: 'POST',
    body: params,
  });
}

// 修改目录分配
export async function fetchIsShowRuleConfig(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/get-financial-subjects`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除目录
 */
export async function deleteCatalog(catalogId) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalogs/${catalogId}`, {
    method: 'DELETE',
  });
}

/**
 * 查询二级域名
 */
export async function fetchIsSecondUrlApi(srmUrl) {
  return request(`${SRM_SMAL}/v1/${organizationId}/page-config-new-details?srmUrl=${srmUrl}`, {
    method: 'GET',
  });
}
