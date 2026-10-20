/*
 * evaluationTemplateService - 评分模板定义
 * @date: 2018/11/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 供应商绩效考评模板列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates`, {
    query,
  });
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: { tenantId: organizationId, ...params },
  });
}

/**
 * 统一查询独立、SQL、URL类型的值集
 * {HZERO_PLATFORM}/v1/lovs/data
 * @param {String} lovCode - 值集code
 * @param {Object} params - 额外的查询参数
 */
export async function queryUnifyIdpValue(lovCode, params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    query: {
      lovCode,
      ...params,
    },
  });
}

/**
 * 平台级标准指标新增
 * @param {Object} data - 数据
 */
export async function saveEvalTemplate(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates`, {
    body: data,
    method: 'POST',
    query: { customizeUnitCode: 'SSLM.EVALUATION_TEMPLATE.LIST.TABLE' },
  });
}

/**
 * 评分模板发布
 * @param {Object} data - 数据
 */
export async function publishEvalTpl(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/publish`, {
    body: data,
    method: 'PUT',
  });
}

/**
 * 供应商绩效标准指标公式定义列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryFormulaList(indicatorId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}indicators/${indicatorId}/formulas`, {
    query,
  });
}

/**
 * 评分模板指标树形查询
 * @param {Object} params - 查询参数
 */
export async function queryIndicatorsListTree(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/tree`, {
    query,
  });
}

/**
 * 租户级标准指标树形结构批量引用，供评分模板使用
 * @param {Object} params - 查询参数
 */
export async function queryIndicatorsListTreeRef(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/tree-ref`, {
    query,
  });
}

/**
 * 评分指标公式配置查询
 * @param {Object} params - 查询参数
 */
export async function queryIndicatorsFormulas(indicatorId, params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/formulas`,
    {
      query: params,
    }
  );
}

/**
 * 评分指标选项配置查询
 * @param {Object} params - 查询参数
 */
export async function queryOptionsList(indicatorId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/kpi-eval-tpl-ind-opts`,
    {
      query: { ...query, evalTplIndId: indicatorId, tenantId: organizationId },
    }
  );
}

/**
 * 租户级查询供应商绩效标准指标公式列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryFormulaListOrg(indicatorId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/${indicatorId}/fmls`, {
    query,
  });
}

/**
 * 租户级查询供应商绩效标准指标选项配置列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryOptionsListOrg(indicatorId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-indicator-opt`, {
    query: { ...query, indicatorId },
  });
}

/**
 * 评分指标公式配置新增/更新
 * @param {Object} data - 数据
 */
export async function saveIndicatorFmls(indicatorId, data) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/formulas`,
    {
      body: data,
      method: 'POST',
    }
  );
}

/**
 * 评分指标选项配置新增/更新
 * @param {Object} data - 数据
 */
export async function saveIndicatorOpls(indicatorId, data) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/kpi-eval-tpl-ind-opts`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 租户级评分指标新增
 * @param {Object} data - 数据
 */
export async function createIndicator(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 租户级评分指标更新
 * @param {Object} data - 数据
 */
export async function updateIndicator(params) {
  const { data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators`, {
    body: data,
    method: 'PUT',
    query: { customizeUnitCode },
  });
}

/**
 * 租户级评分指标新增
 * @param {Object} data - 数据
 */
export async function saveIndicatorRef(params) {
  const { data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/ref`, {
    body: data,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 评分模板指标启用/禁用
 * @async
 * @function indicatorsEnable
 * @param {!boolean} enabled - 是否启用
 * @param {!object} data- 行数据
 * @returns {object} fetch Promise
 */
export async function indicatorsEnable(enabled, data) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${enabled ? 'disable' : 'enable'}`,
    {
      body: data,
      method: 'PUT',
    }
  );
}

/**
 * 评分指标细项权限查询
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function queryIndicatorsResponsibleList(indicatorId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/responsible`,
    {
      query,
    }
  );
}

/**
 * 评分指标细项权限更新/新增/删除
 * @param {Object} data - 数据
 */
export async function saveIndicatorsResponsibleList(indicatorId, data) {
  const { evalDimension, kpiEvalTplIndResps } = data;
  const result = kpiEvalTplIndResps.map(item => {
    const items = item;
    if (item._status === 'create') {
      items.evalTplIndRespId = null;
    }
    return items;
  });
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/responsible/operate`,
    {
      body: result,
      query: {
        evalDimension,
      },
      method: 'POST',
    }
  );
}

/**
 * 删除评分指标细项
 * @param {Object} data - 数据
 */
export async function deleteIndicators(indicatorId, data) {
  const { evalDimension, kpiEvalTplIndResps, customizeUnitCode } = data;
  const result = kpiEvalTplIndResps.map(item => {
    const items = item;
    if (item._status === 'create') {
      items.evalTplIndRespId = null;
    }
    return items;
  });
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/responsible/delete`,
    {
      body: result,
      query: {
        evalDimension,
        customizeUnitCode,
      },
      method: 'POST',
    }
  );
}

/**
 * 更新/新增评分指标细项
 * @param {Object} data - 数据
 */
export async function insertOrUpdateIndicators(indicatorId, data) {
  const { evalDimension, kpiEvalTplIndResps, customizeUnitCode } = data;
  const result = kpiEvalTplIndResps.map(item => {
    const items = item;
    if (item._status === 'create') {
      items.evalTplIndRespId = null;
    }
    return items;
  });
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${indicatorId}/responsible/insertOrUpdate`,
    {
      body: result,
      query: {
        evalDimension,
        customizeUnitCode,
      },
      method: 'POST',
    }
  );
}

/**
 * 评分模板解锁/新增/删除
 * @param {Object} data - 数据
 */
export async function unlockEvalTpl(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/unlock`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 评分模板适用供应商查询
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function queryEvalTplScopeList(templateId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${templateId}/scope`, {
    query,
  });
}

/**
 * 添加供应商-查询
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function queryEvalTplScopeSupplierList(templateId, params) {
  const query = filterNullValueObject(parseParameters(params));
  const { page, size, ...rest } = query;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/${templateId}/scope/supplier/post`,
    {
      method: 'POST',
      query: { page, size },
      body: rest,
    }
  );
}

/**
 * 分配供应商及品类和添加供应商-保存
 * @param {Object} data - 数据
 */
export async function saveEvalTplScope(templateId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${templateId}/scope`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 评分模板适用供应商删除
 * @param {Object} data - 数据
 */
export async function deleteEvalTplScope(templateId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${templateId}/scope`, {
    body: data,
    method: 'DELETE',
  });
}

/**
 * 评分模板适用供应商参评品类查询
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function queryEvalTplScopeCategoryList(scopeId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/${scopeId}/category`, {
    query: { ...query, enabledFlag: 1 },
  });
}

/**
 * 评分模板范围明细-参评品类新增/删除
 * @param {Object} data - 数据
 */
export async function saveEvalTplScopeCategoryList(scopeId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/${scopeId}/category`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 评分模板范围明细-参评品类保存 - c7n
 * @param {Object} data - 数据
 */
export async function saveCategoryList(scopeId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/${scopeId}/category-c7n`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 评分模板范围明细-参评物料删除
 * @param {Object} data - 数据
 */
export async function deleteEvalTplScopeItemList(scopeId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/${scopeId}/item`, {
    body: data,
    method: 'DELETE',
  });
}

/**
 * 评分模板范围明细-参评物料新增
 * @param {Object} data - 数据
 */
export async function saveEvalTplScopeItemList(scopeId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/${scopeId}/item`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 评分模板范围明细-参评物料查询
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function queryEvalTplScopeItemList(scopeId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/${scopeId}/item`, {
    query: { ...query, enabledFlag: 1 },
  });
}

/**
 * 获取评分模板信息
 * @export
 * @param {string} organizationId - 租户 id
 * @param {string} params.templateId - 模板 id
 * @returns
 */
export async function fetchTmplInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates`, {
    method: 'GET',
    query: { evalTplId: params.templateId },
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
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.templateId}/levels`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询评分等级 - 按指标分数定义等级
 * @export
 * @param {object} params
 * @param {string} params.templateId - 评分模板id
 * @returns
 */
export async function fetchIndexScoreTmplLevel(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.templateId}/indicators/levels`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 保存评分等级
 * @export
 * @param {object} params
 * @param {string} params.templateId - 评分模板id
 * @param {object[]} params.scoreLevelList - 等级列表
 * @returns
 */
export async function addLevel({ templateId, kpiEvalLevelList, kpiEvalTpl }) {
  // return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/1/levels`, {
  //   method: 'POST',
  //   body: params.scoreLevelList,
  // });
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${templateId}/levelList`, {
    method: 'POST',
    body: { ...kpiEvalTpl, kpiEvalLevelList },
  });
}

/**
 * 查询采购品类的数据
 * @param {Object} params - 查询参数
 * @param {String} params.templateId - 评分模板ID
 * @param {String} organizationId - 组织ID
 * @param {String} params.categoryCode - 采购品类编码
 * @param {String} params.categoryName - 采购品类描述
 */
export async function fetchPurcahseCategory(params) {
  const { templateId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${templateId}/category`, {
    method: 'GET',
    query: rest,
  });
}

// /**
//  * 查询分配品类
//  * @export
//  * @param {object} params
//  * @returns
//  */
// export async function fetchCheckedCategory(params) {
//   return request(`${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-item-categories`, {
//     method: 'GET',
//     query: params,
//   });
// }
/**
 * 分配采购品类
 * @export
 * @param {object} params
 * @param {String} params.templateId - 评分模板ID
 * @param {*[]} param.changeData - 分配的采购品类
 * @returns
 */
export async function changeCategory(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.templateId}/category`, {
    method: 'POST',
    body: params.changeData,
  });
}
/**
 * 保存分配公司
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveCompany(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.templateId}/company`, {
    method: 'POST',
    body: params.scoreCompany,
  });
}

/**
 * 查询分配的公司信息
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchScoreCompany(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/${params.templateId}/company`, {
    method: 'GET',
  });
}

/**
 * 自动考评查询
 * @export
 * @param {string} organizationId - 租户 id
 * @param {String} params.templateId - 评分模板ID
 * @returns
 */
export async function queryEvaluationAuto(templateId) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-auto-configs`, {
    query: {
      evalTplId: templateId,
      tenantId: organizationId,
    },
  });
}

/**
 * 自动考评配置
 * @export
 * @param {string} organizationId - 租户 id
 * @param {String} params.templateId - 评分模板ID
 * @returns
 */
export async function saveEvaluationAuto(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-auto-configs`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 自动考评以分配维度查询
 * @export
 * @param {string} organizationId - 租户 id
 * @param {String} templateId - 评分模板ID
 * @param {String} evalDimension - 考评维度
 * @returns
 */
export async function queryEvaluationAutoCategory(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/kpi-eval-sup-cate-dmss/${params.evalTplId}/assigned/eval-dimension`,
    {
      query: {
        evalTplId: params.evalTplId,
        organizationId,
        evalDimension: params.evalDimension,
      },
    }
  );
}

/**
 * 查询可分配的维度信息
 * @export
 * @param {string} organizationId - 租户 id
 * @param {String} templateId - 评分模板ID
 * @returns
 */
export async function queryEvaluationDimension(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/kpi-eval-sup-cate-dmss/${params.evalTplId}/canAssign/eval-dimension`,
    {
      method: 'GET',
      query: {
        evalTplId: params.evalTplId,
        organizationId,
        evalDimension: params.evalDimension,
      },
    }
  );
}

/**
 * Kpi自动考核新增维度
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function addEvaluationDimension(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-eval-sup-cate-dmss/insert/eval-dimension`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 自动考评分配维度查询分页查询
 * @export
 * @param {string} organizationId - 租户 id
 * @param {String} templateId - 评分模板ID
 * @param {String} evalDimension - 考评维度
 * @returns
 */
export async function queryEvaluationAutoCategoryPage(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SSLM}/v1/${organizationId}/kpi-eval-sup-cate-dmss/${params.evalTplId}/assigned/page-eval-dimension`,
    {
      query,
    }
  );
}

/**
 * selectSupplierLov - 供应商选择lov
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchSupplierLovData(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/list-supplier`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询参数定义
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryParamDefinition(params) {
  const param = filterNullValueObject(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-tpl-ind-fml-params`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存参数定义
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveParamDefinition(params) {
  const { evalTplIndFmlId = '', tableValues = [] } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-tpl-ind-fml-params/${evalTplIndFmlId}`, {
    method: 'POST',
    body: tableValues,
  });
}

/**
 * 查询参数配置
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryParamConfig(params) {
  const param = filterNullValueObject(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-tpl-ind-fml-configs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存参数配置
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveParamConfig(params) {
  const { evalTplIndFmlId = '', tableValues = [] } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-tpl-ind-fml-configs/${evalTplIndFmlId}`, {
    method: 'POST',
    body: tableValues,
  });
}

/**
 * 删除参数配置
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function deleteParamConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-tpl-ind-fml-configs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除选项配置
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function deleteOptions({ evalTplId, evalTplIndOptId }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/${evalTplId}/kpi-eval-tpl-ind-opts`,
    {
      method: 'DELETE',
      body: { evalTplIndOptId, tenantId: organizationId, evalTplId },
    }
  );
}

/**
 * 批量评分指标更新
 * @param {Object} data - 数据
 */
export async function batchUpdateIndicator(params) {
  const { data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/list`, {
    body: data,
    method: 'PUT',
    query: { customizeUnitCode },
  });
}

/**
 * 获取历史版本记录信息
 */
export async function fetchHistoricalVersionInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/history/kpi-eval-tpl-code`, {
    method: 'GET',
    query,
  });
}

/**
 * 获取评分模板信息-历史单据查询页面
 * @export
 * @param {string} organizationId - 租户 id
 * @param {string} params.templateId - 模板 id
 * @returns
 */
export async function fetchTmplInfoHistory(params) {
  const { templateId, evalTplCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/history/kpi-eval-tpl-code`, {
    method: 'GET',
    query: {
      evalTplId: templateId,
      evalTplCode,
    },
  });
}

/**
 * 标准指标定义-删除指标
 * @param {object} params - 入参
 * @returns {object} fetch Promise
 */
export async function handleDelete(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/delete`, {
    method: 'DELETE',
    body: params,
  });
}
