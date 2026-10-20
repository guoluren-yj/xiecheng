
/**
 * expressionEngineRuleService 表达式引擎规则服务
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const currentOrganizationId = getCurrentOrganizationId();

export async function queryExpressionEngineRuleInfo (params) {
  return request(`/marmot/v1/${currentOrganizationId}/marmot-expression-engine/overall`, {
    method: 'GET',
    query: params,
  });
}

export async function saveReturnRule (params, option) {
  const { encryptBody } = option || {};
  return request(`/marmot/v1/${currentOrganizationId}/marmot-expression-engine`, {
    method: 'POST',
    body: params,
  }, {
    encryptBody,
  });
}

export async function updateReturnRule (params, option) {
  const { encryptBody } = option || {};
  return request(`/marmot/v1/${currentOrganizationId}/marmot-expression-engine`, {
    method: 'PUT',
    body: params,
  }, {
    encryptBody,
  });
}

export async function saveExpressionEngineRule (params, option) {
  const { encryptBody } = option || {};
  return request(`/marmot/v1/${currentOrganizationId}/marmot-expression-engine/action`, {
    method: 'POST',
    body: params,
  }, { encryptBody });
}

export async function updateExpressionEngineRule (params, option) {
  const { encryptBody } = option || {};
  return request(`/marmot/v1/${currentOrganizationId}/marmot-expression-engine/action`, {
    method: 'PUT',
    body: params,
  }, { encryptBody });
}

export async function deleteExpressionEngineRule (params) {
  return request(`/marmot/v1/${currentOrganizationId}/marmot-expression-engine/action`, {
    method: 'DELETE',
    body: params,
  });
}
