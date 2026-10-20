/**
 * service - 评分要素及模板
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *查询评分模板
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchTemplate(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSRC}/v1/${organizationId}/score-template`, {
    method: 'GET',
    query: param,
  });
}

/**
 *保存评分模板
 *
 * @export
 * @param {Array} params
 * @returns
 */
export async function saveTemplate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/score-template`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询评分要素
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchElements(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSRC}/v1/${organizationId}/score-indicate`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存评分要素
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveElements(params) {
  const { elementsData, customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/score-indicate`, {
    method: 'POST',
    body: elementsData,
    query: {
      ...others,
      customizeUnitCode,
    },
  });
}

/**
 * 评分要素细项-行-查询
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchElementsDetailLine(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/score-indicate`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 评分要素细项-行-删除
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function deleteElementsDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/score-indicate`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 评分要素细项-行-保存
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveElementsDetail(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/score-indicate/two`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 查询分配评分要素
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchDetail(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSRC}/v1/${organizationId}/score-tmpl-assign`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 删除分配评分要素
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function deleteDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/score-tmpl-assign`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 保存分配评分要素
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveDetail(params) {
  const { customizeUnitCode, newDataList } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/score-tmpl-assign`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: newDataList,
  });
}

/**
 * 评分要素细项-行-二级要素保存
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveElementsDetailTwo(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/score-tmpl-assign/two`, {
    method: 'PUT',
    body: params,
  });
}
