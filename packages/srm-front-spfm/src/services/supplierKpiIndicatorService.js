/*
 * deliveryCreationService - 送货单创建
 * @date: 2018/11/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  // getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
} from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';

// const organizationId = getCurrentOrganizationId();

/**
 * 平台级评分指标查询
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/indicators`, {
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
  return request(`${SRM_PLATFORM}/v1/indicators/${enabled ? 'disable' : 'enable'}`, {
    body: data,
    method: 'PUT',
  });
}

/**
 * 平台级标准指标新增
 * @param {Object} data - 数据
 */
export async function createIndicator(data) {
  return request(`${SRM_PLATFORM}/v1/indicators`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 平台级标准指标更新
 * @param {Object} data - 数据
 */
export async function updateIndicator(data) {
  return request(`${SRM_PLATFORM}/v1/indicators`, {
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
  return request(`${SRM_PLATFORM}/v1/indicators/${indicatorId}/formulas`, {
    query,
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
  return request(`${SRM_PLATFORM}/v1/indicators/tree`, {
    query,
  });
}

/**
 * 平台级标准指标公式配置新增
 * @param {Object} data - 数据
 */
export async function saveIndicatorFmls(indicatorId, data) {
  return request(`${SRM_PLATFORM}/v1/indicators/${indicatorId}/formulas`, {
    body: data,
    method: 'POST',
  });
}
