/**
 * service - 报价作业
 * @date: 2019-05-27
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

// 招标作业获取列表数据
export const fetchDataList = async (params) => {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const url = `${prefix}/${organizationId}/bid/work`;
  return request(url, {
    method: 'GET',
    query: { ...param },
  });
};

/**
 * 招标作业-评分要素-查询
 * @async
 * @function fetchScoringElement
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoringElement(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 招标作业-评分要素-专家分配-查询
 * @async
 * @function fetchScoringAssign
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoringAssign(params) {
  const { organizationId, evaluateIndicId, ...param } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-indic-assigns?evaluateIndicId=${evaluateIndicId}`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}
/**
 * 招标作业-保存
 * @async
 * @function saveTaskAction
 * @returns {object} fetch Promise
 */
export async function saveTaskAction(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/bid/work`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: {
      ...other.ProfElement,
      ...other.ScoringElement,
    },
  });
}
/**
 * 招标作业 - 提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export function submitTaskAction(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/bid/work/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: {
      ...other.ProfElement,
      ...other.ScoringElement,
    },
  });
}
/**
 * 招标作业-评分要素-保存
 * @async
 * @function fetchScoringElement
 * @returns {object} fetch Promise
 */
export async function fetchScoringElementSave(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: other.ScoringElementList,
  });
}

/**
 * 招标作业-评分要素-专家分配-保存
 * @async
 * @function fetchScoringAssign
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoringAssignSave(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-assigns`, {
    method: 'POST',
    body: other.ScoringAssign,
  });
}

/**
 * 招标作业-评分要素-删除
 * @async
 * @function fetchScoringElement
 * @returns {object} fetch Promise
 */
export async function fetchScoringElementDelete(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 招标作业-评分要素-参考模板
 * @async
 * @function fetchScoringAssign
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoringTemplate(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics/template-import`, {
    method: 'POST',
    query: { ...other },
  });
}

/**
 * 招标作业-专家-查询
 * @async
 * @function fetchProfessional
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchProfessional(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-experts`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 招标作业-专家-保存
 * @async
 * @function fetchProfessionalSave
 * @returns {object} fetch Promise
 */
export async function fetchProfessionalSave(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-experts`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: other.evaluateExperts,
  });
}

/**
 * 招标作业-专家-删除
 * @async
 * @function fetchProfessionalDelete
 * @returns {object} fetch Promise
 */
export async function fetchProfessionalDelete(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/evaluate-experts`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}
