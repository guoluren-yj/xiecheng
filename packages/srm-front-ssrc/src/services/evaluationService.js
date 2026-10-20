/**
 * services - 评标方法
 * @date: 2019-5-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *
 * 查询评标方法
 * @export
 * @function queryEvaluation
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryEvaluationList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/bid-eval-methods/list/page`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 评标方法的保存接口
 * @export
 * @function evaluationSave
 * @param {Object} params 查询参数
 * @returns
 */
export async function evaluationSave(data) {
  return request(`${SRM_SSRC}/v1/${organizationId}/bid-eval-methods`, {
    method: 'POST',
    body: data,
  });
}
