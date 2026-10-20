/**
 * scoreTmplService - 评分模板定义 - service
 * @date: 2018-08-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

/**
 * 查询评分模板列表
 * @export
 * @param {object} params
 * @returns
 */
export async function queryScoreTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/score-templates`, {
    method: 'GET',
    query: param,
  });
}

/**
 *新增/编辑评分模板列表
 *
 * @export
 * @param {object} params
 * @returns
 */
export async function saveScoreTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-templates`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 删除评分模板列表数据
 * @export
 * @param {object} params
 * @returns
 */
export async function deleteScoreTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-templates`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询模板定义
 * @export
 * @param {objects} params
 * @returns
 */
export async function queryIndic(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-indicators`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存模板定义
 * @export
 * @param {object} params
 * @returns
 */
export async function saveIndic(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-indicators`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新模板定义
 * @export
 * @param {object} params
 * @returns
 */
export async function updateIndic(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-indicators`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 禁用
 * @export
 * @param {object} params
 * @returns
 */
export async function handleForbidden(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-indicators/${params.indicateId}/${
      params.isForbidden
    }`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 提交模板
 * @export
 * @param {object} params
 * @returns
 */
export async function submitScoreTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-templates/${params.templateId}/publish`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询采购品类的数据
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryCode - 采购品类编码
 * @param {String} params.categoryName - 采购品类描述
 */
export async function fetchPurcahseCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询分配品类
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchCheckedCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-item-categories`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取评分模板信息
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function fetchTmplInfo() {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates`, {
    method: 'GET',
  });
}

/**
 * 分配采购品类
 * @export
 * @param {object} params
 * @returns
 */
export async function changeCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-item-categories`, {
    method: 'POST',
    body: params.changeData,
  });
}
/**
 * 移除采购品类
 * @export
 * @param {object} params
 * @returns
 */
export async function removeCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-item-categories`, {
    method: 'DELETE',
    body: params.rightSelectRows,
  });
}

/**
 * 查询评分等级
 * @export
 * @param {object} params
 * @param {string} params.templateId - 评分模板id
 * @returns
 */
export async function fetchTmplLevel(params) {
  const organizationId = getCurrentOrganizationId();
  // return request(`${SRM_SSLM}/v1/0/eval-templates/1/levels`, {
  //   method: 'GET',
  // });
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.templateId}/levels`, {
    method: 'GET',
  });
}

/**
 * 保存评分等级
 * @export
 * @param {object} params
 * @param {string} params.templateId - 评分模板id
 * @param {object[]} params.scoreLevelList - 等级列表
 * @returns
 */
export async function addLevel(params) {
  const organizationId = getCurrentOrganizationId();
  // return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/1/levels`, {
  //   method: 'POST',
  //   body: params.scoreLevelList,
  // });
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.templateId}/levels`, {
    method: 'POST',
    body: params.scoreLevelList,
  });
}

/**
 * 查询公司信息
 * @param {Object} params - 查询参数
 * @param {String} organizationId - 组织ID
 */
export async function fetchCompany(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询分配的公司信息
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchScoreCompany(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-companies`, {
    method: 'GET',
  });
}

/**
 * 分配公司
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveCompany(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-companies`, {
    method: 'POST',
    body: params.scoreCompany,
  });
}

/**
 * 查询供应商信息
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchSupplier(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/partners/tenant-suppliers`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询分配的供应商信息
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchScoreSupplier(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-suppliers`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 分配供应商
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveSupplier(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-suppliers`, {
    method: 'POST',
    body: params.leftSelectRows,
  });
}

/**
 * 分配供应商
 * @export
 * @param {Object} params
 * @returns
 */
export async function deleteSupplier(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-suppliers`, {
    method: 'DELETE',
    body: params.rightSelectRows,
  });
}

/**
 * 分配供应商
 * @export
 * @param {Object} params
 * @returns
 */
export async function getStandardTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-indicators/std`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询分配的细项权限
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchCheckedIndicAssign(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/${params.templateId}/${
      params.indicateId
    }/score-indicator-assigns`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询细项权限
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchIndicAssign(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(
    `${SRM_SSLM}/v1/${organizationId}/${param.templateId}/${
      param.indicateId
    }/score-indicator-assigns/options`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 *分配的细项权限
 * @export
 * @param {Object} params
 * @returns
 */
export async function addIndicAssign(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/${params.templateId}/${
      params.indicateId
    }/score-indicator-assigns`,
    {
      method: 'POST',
      body: params.leftSelectRows,
    }
  );
}

/**
 * 取消分配的细项权限
 * @export
 * @param {Object} params
 * @returns
 */
export async function removeIndicAssign(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/${params.templateId}/${
      params.indicateId
    }/score-indicator-assigns`,
    {
      method: 'DELETE',
      body: params.rightSelectRows,
    }
  );
}

/**
 * 复制模板
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveCopyData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-indicators//${
      params.parentIndicateId
    }/copy`,
    {
      method: 'POST',
      body: params.indicateIdList,
    }
  );
}

/**
 * 发布评分模板定义
 * @export
 * @returns
 */
export async function scoreTemplatePublish(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-templates/${params.templateId}/publish`, {
    method: 'POST',
    query: params,
  });
}
