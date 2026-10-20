import request from 'utils/request';
import { SRM_SMBL, SRM_MARMOT } from '_utils/config';
import { getCurrentOrganizationId, getAccessToken, getRequestId } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { getMenuId } from 'utils/menuTab';
import { HZERO_PLATFORM, HZERO_HMDE } from 'utils/config';

const { API_HOST } = getEnvConfig();

/**
 * 获取流程单据列表
 * @param {*} params
 * @returns
 */
export async function fetchOrderList(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除流程单据
 * @param {*} params
 * @returns
 */
export async function fetchDeleteProcessDoc(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/check-rules/${params.documentId}`, {
    method: 'DELETE',
  });
}

/**
 * 删除流程分类
 * @param {*} params
 * @returns
 */
export async function fetchDeleteCategory(params) {
  return request(
    `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/check-rules/category/${params.categoryId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 创建流程分类
 * @param {*} params
 * @returns
 */
export async function fetchCreateCategory(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/add-category`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新流程分类
 * @param {*} params
 * @returns
 */
export async function fetchUpdateCategory(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/update-category`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用
 * @param {*} params
 * @returns
 */
export async function fetchEnabled(params) {
  return request(
    `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/enable-rule`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 启用
 * @param {*} params
 * @returns
 */
export async function fetchDisabled(params) {
  return request(
    `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/disable-rule`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取字段列表
 * @param {*} params
 * @returns
 */
export async function fetchFieldsList(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/bo-fields`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 流程单据详情
 * @param {*} params
 * @returns
 */
export async function fetProcessDetail(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/document-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 流程字段列表
 * @param {*} params
 * @returns
 */
export async function fetFieldsList(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/list?page=-1`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取流程分类详情
 * @param {*} params
 * @returns
 */
export async function fetchCategoryDetail(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/category-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取lov列表
 * @param {*} params
 * @returns
 */
export async function fetchLovName(params) {
  return request(`/hpfm/v1/${getCurrentOrganizationId()}/lovs/info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存规则
 * @param {*} params
 * @returns
 */
export async function fetchSaveRule(params) {
  const url = params?.ruleId
    ? `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/update-rule`
    : `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/add-rule`;
  return request(`${url}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取可见角色列表
 * @param {*} params
 * @returns
 */
export async function fetchVisibleRoleList(params) {
  return request(
    `/smbl/v1/lovs/sql/data?lovCode=SMBL_PURCHASE_ENABLE_ROLE&page=0&size=10000&asyncCountFlag=Y`,
    {
      method: 'GET',
      params,
    }
  );
}

/**
 * 规则文本美化
 * @param {*} params
 * @returns
 */
export async function fetchAiOptimizeRule(params) {
  return request(`${SRM_MARMOT}/v1/marmot-site-api/SMBL_AI_OPTIMIZE_RULE`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * 审核报表统计信息
 * @param {*} params
 * @returns
 */
export async function fetchStatistics(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/report-overview`, {
    method: 'GET',
    query: params,
  });
}

export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}
export async function queryModule(params = {}) {
  return request(`${HZERO_HMDE}/v1/${getCurrentOrganizationId()}/data-source-biz/view-model`, {
    query: params,
  });
}

export async function queryTree(params = {}) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/tenant-list`, {
    query: params,
    method: 'GET',
  });
}

/**
 * 导出流程单据/分类配置为JSON文件
 * 使用 fetch 替代 axios，避免被全局拦截器影响
 * @param {Array} params - 要导出的文档/分类ID列表
 * @returns {Promise} - 返回对象，包含 data 和 headers
 */
export async function exportUnitConfig(params = []) {
  const url = `${API_HOST}${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/export-json`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${getAccessToken()}`,
        'H-Request-Id': `${getRequestId()}`,
        'H-Menu-Id': `${getMenuId()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.text();
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return { data, headers, status: response.status };
  } catch (error) {
    throw error;
  }
}

/**
 * 导入流程单据/分类配置
 * @param {FormData} params - 包含JSON文件的FormData对象
 * @returns {Promise} - 返回axios响应对象，包含blob数据和headers
 */
export async function importUnitConfig(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/import-documents`, {
    method: 'POST',
    body: params,
    // responseType: 'text',
  });
}

export async function queryImportLogHeaders(params = {}) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/import-history/list`, {
    method: 'GET',
    query: params,
  });
}
