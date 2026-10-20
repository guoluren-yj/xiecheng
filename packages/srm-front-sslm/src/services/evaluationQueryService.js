/**
 * service 考评结果查询
 * @date: 2018-12-29
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * @async
 * @function querySupplierAnnual
 * @param {?string} tenantId - 租户id
 * @param {?string} params - 查询参数
 * @returns {Object} fetch promise
 */
export async function queryList(params) {
  const { tenantId, ...param } = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/result/purchase`, {
    method: 'GET',
    query: param,
  });
}

/**
 * @async
 * @function fetchDetailList
 * @param {?string} tenantId - 租户id
 * @param {?string} params - 查询参数
 * @returns {Object} fetch promise
 */
export async function fetchDetailList(params) {
  const { tenantId, page, size, customizeUnitCode, ...param } = parseParameters(params);

  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/appraisal/result-post`, {
    method: 'POST',
    query: { page, size, customizeUnitCode },
    body: param,
  });
}

/**
 * 查询考评结果详情页数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryDetailData(params) {
  const { tenantId, evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/result/purchase/${evalHeaderId}`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 查询考评结果评分明细数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryScoreDetail({ tenantId, evalTplId, evalLineId, ...rest }) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-templates/indicators/${evalTplId}/${evalLineId}/subtree`,
    { method: 'GET', query: rest }
  );
}
export async function queryOperationRecs(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${param.tenantId}/kpi-eval-opr-historys`, {
    method: 'GET',
    query: param,
  });
}

/*
 * 打印
 */
export async function handlePrint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/${params.kpiEvalLineId}/print`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

/*
 * 按档案导出
 */
export async function handleExport(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/result/purchase/export`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/*
 * 查询等级分布
 */
export async function handleLevel(params) {
  const { evalHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/level-supplier-count/${evalHeaderId}`,
    {
      method: 'GET',
    }
  );
}

/*
 * 打印
 */
export async function handleArchivesPrint(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/${params.evalHeaderId}/header-print`,
    {
      method: 'GET',
      query: params,
      responseType: 'blob',
    }
  );
}
