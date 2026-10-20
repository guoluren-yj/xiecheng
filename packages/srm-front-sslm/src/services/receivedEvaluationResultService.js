/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-24 11:36:49
 * @FilePath: /srm-front-sslm/src/services/receivedEvaluationResultService.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
/**
 * service 我收到的考评结果查询
 * @date: 2018-12-28
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询我收到的考评结果列表
 * @async
 * @function querySupplierAnnual
 * @param {?string} tenantId - 租户id
 * @param {?string} params - 查询参数
 * @returns {Object} fetch promise
 */
export async function queryList(params) {
  const { tenantId, ...param } = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/result/supplier`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询考评档案填制详情页数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryDetailData(params) {
  const { tenantId, evalHeaderId, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/result/supplier/${evalHeaderId}`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询考评档案填制详情页数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryScoreDetail({ tenantId, evalTplId, evalLineId, ...other }) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-templates/indicators/${evalTplId}/${evalLineId}/subtree`,
    {
      method: 'GET',
      query: other,
    }
  );
}

/**
 * 保存
 */
export async function saveScoreDetail(params) {
  const { tenantId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/saveFeedback`, {
    method: 'POST',
    body,
  });
}

/**
 * 提交申诉
 */
export async function submitComplaint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/appeal`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 提交申诉
 */
export async function handleConfirm(params) {
  const { tenantId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/confirm`, {
    method: 'POST',
    body,
  });
}
