/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-24 11:36:49
 * @FilePath: /srm-front-sslm/src/services/evaluationArchivesFilledService.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
/**
 * service 已填制考评档案
 * @date: 2018-01-02
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

/**
 * 查询已填制考评档案列表
 * @param {Object} params - 查询参数
 */
export async function queryList({ tenantId, ...params }) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/evaluated`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询已填制考评档案详情页数据
 * @param {?number} tenantId - 租户ID
 * @param {?string} evalHeaderId - 考评档案ID
 */
export async function queryDetailData(params) {
  const { tenantId, evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/evaluation/${evalHeaderId}`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 *获取操作记录 modal 数据
 * @export
 * @param {string} params.headerId - 详情页面/档案 id
 * @returns {object} fetch promise
 */
export async function activityLogFetch(params) {
  const page = filterNullValueObject(parseParameters(params));
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-eval-opr-historys`, {
    method: 'GET',
    query: { evalHeaderId: params.headerId, ...page },
  });
}

/**
 * 保存考评附件
 * @async
 * @function saveOperation
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function handleScoreCancel(params) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/score-cancel`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}
