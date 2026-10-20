/*
 * deliveryCreationService - 送货单创建
 * @date: 2018/11/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 平台级评分指标查询
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators`, {
    query,
  });
}

/**
 * 标准指标定义导入--- 下载导入模板
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
/**
 * 标准指标定义导入--- 导入数据接口
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.organizationId - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryImportData(params) {
  const { templateCode, formData } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`,
    {
      method: 'POST',
      body: formData,
      responseType: 'text',
    }
  );
}

// 刷新数据
export async function queryStatus(params = {}) {
  const { templateCode, batch } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/import/data/status`, {
    method: 'GET',
    query: {
      batch,
      templateCode,
    },
  });
}

/**
 * 标准指标定义导入--- 查询数据
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryRefreshData(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/import/data`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 标准指标定义导入--- 核对数据
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCheckData(params) {
  const { templateCode, batch } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/import/data/data-validate?templateCode=${templateCode}&batch=${batch}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 标准指标定义导入--- 提交数据
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function querySubmitImportData(params) {
  const { templateCode, batch } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/import/data/data-import?templateCode=${templateCode}&batch=${batch}`,
    {
      method: 'POST',
      body: params,
    }
  );
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
    query: params,
  });
}

/**
 * 平台级标准指标禁用
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function indicatorsEnable(enabled, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/${enabled ? 'disable' : 'enable'}`, {
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
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/${indicatorId}/fmls`, {
    query,
  });
}

/**
 * 供应商绩效标准指标选项配置列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryOptionsList(indicatorId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-indicator-opt`, {
    query: { ...query, indicatorId },
  });
}

/**
 * 平台级标准指标树形结构查询
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryListTree(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/tree`, {
    query,
  });
}

/**
 * 平台级标准指标新增
 * @param {Object} data - 数据
 */
export async function createIndicator(params) {
  const { data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators`, {
    body: data,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 平台级标准指标更新
 * @param {Object} data - 数据
 */
export async function updateIndicator(params) {
  const { data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators`, {
    body: data,
    method: 'PUT',
    query: { customizeUnitCode },
  });
}

/**
 * 平台级标准指标公式配置新增
 * @param {Object} data - 数据
 */
export async function createIndicatorFmls(indicatorId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/${indicatorId}/fmls`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 平台级标准指标公式配置新增
 * @param {Object} data - 数据
 */
export async function updateIndicatorFmls(indicatorId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/${indicatorId}/fmls`, {
    body: data,
    method: 'PUT',
  });
}

/**
 * 租户级标准指标树形结构批量引用
 * @param {Object} params - 查询参数
 */
export async function queryIndicatorsListTreeRef(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/tree-ref`, {
    query,
  });
}

/**
 * 租户级标准指标树形结构查询
 * @param {Object} params - 查询参数
 */
export async function queryIndicatorsListTree(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/indicators/tree-ref`, {
    query,
  });
}

/**
 * 平台级标准指标公式配置新增
 * @param {Object} data - 数据
 */
export async function saveIndicatorFmls(indicatorId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/${indicatorId}/fmls`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 平台级标准指标选项配置新增
 * @param {Object} data - 数据
 */
export async function saveIndicatorOpls(_indicatorId, data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-indicator-opt`, {
    method: 'POST',
    body: data,
  });
}
/**
 * 平台指标批量引用
 * @param {Object} data - 数据
 */
export async function saveIndicatorRef(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/ref`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 租户级查询供应商绩效标准指标公式列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryFormulaListOrg(indicatorId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/indicators/${indicatorId}/formulas`, {
    query,
  });
}

/**
 * 标准指标定义-查询参数定义
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryParamDefinition(params) {
  const param = filterNullValueObject(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-ind-fml-params`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 标准指标定义-保存参数定义
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveParamDefinition(params) {
  const { indicatorFmlId = '', tableValues = [] } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-ind-fml-params/${indicatorFmlId}`, {
    method: 'POST',
    body: tableValues,
  });
}

/**
 * 标准指标定义-查询参数配置
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryParamConfig(params) {
  const param = filterNullValueObject(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-ind-fml-configs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 标准指标定义-保存参数配置
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveParamConfig(params) {
  const { indicatorFmlId = '', tableValues = [] } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-ind-fml-configs/${indicatorFmlId}`, {
    method: 'POST',
    body: tableValues,
  });
}

/**
 * 标准指标定义-删除参数配置
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function deleteParamConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-ind-fml-configs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 标准指标定义-删除选项配置行
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function deleteIndicatorOpls(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-indicator-opt`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 标准指标定义-查询指标细项权限列表明细
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryPermissionList(params) {
  const param = filterNullValueObject(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-indicator-resps`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 标准指标定义-细项权限保存方法
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function savePermissionList(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-indicator-resps`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 标准指标定义-批量查询评分模板信息
 * @param {object} params - 入参
 * @returns {object} fetch Promise
 */
export async function batchQueryScoringTemp(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/display/eval-tpls`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 标准指标定义-查询评分模板信息
 * @param {object} params - 入参
 * @returns {object} fetch Promise
 */
export async function queryScoringTemp(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/display/eval-tpl`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 标准指标定义-批量更新至评分模板
 * @param {object} params - 入参
 * @returns {object} fetch Promise
 */
export async function batchHandleUpdateScoringTemp(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/update/eval-inds`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 标准指标定义-更新至评分模板
 * @param {object} params - 入参
 * @returns {object} fetch Promise
 */
export async function handleUpdateScoringTemp(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/update/eval-ind`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 标准指标定义-删除评分指标
 * @param {object} params - 入参
 * @returns {object} fetch Promise
 */
export async function handleDelete(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/indicators/delete`, {
    method: 'DELETE',
    body: params,
  });
}
