
/**
 * expressionEngineService 表达式引擎规则服务
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';


export async function getExpressionEngine (params) {
  const { currentTenantId, ...otherParams } = params;
  return request(`/marmot/v1/${currentTenantId}/marmot-expression-engine/condition`, {
    method: 'GET',
    query: otherParams,
  });
}

export async function saveExpressionEngine (params) {
  const { currentTenantId, ...otherParams } = params;
  return request(`/marmot/v1/${currentTenantId}/marmot-expression-engine/condition`, {
    method: 'POST',
    body: otherParams,
  }, {
    encryptBody: true,
  });
}

export async function deleteExpressionEngine (params) {
  const { currentTenantId, ...otherParams } = params;
  return request(`/marmot/v1/${currentTenantId}/marmot-expression-engine/condition`, {
    method: 'DELETE',
    body: otherParams,
  });
}
