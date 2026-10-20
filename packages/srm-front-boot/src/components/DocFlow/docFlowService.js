/**
 * docFlowService
 * 单据流接口
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';

export async function queryAllNodes(params) {
  const { currentOrganizationId, ...otherParams } = params;
  return request(`/sdps/v1/${currentOrganizationId}/docfData/queryAllNodes`, {
    query: otherParams,
  });
}

export async function queryNodeDoc(params) {
  const { currentOrganizationId, ...otherParams } = params;
  return request(`/sdps/v1/${currentOrganizationId}/docfData/queryNodeDoc`, {
    query: otherParams,
  });
}

export async function queryNodeProcess(params) {
  const { currentOrganizationId, ...otherParams } = params;
  return request(`/sdps/v1/${currentOrganizationId}/docfData/queryNodeProcess`, {
    query: otherParams,
  });
}

export async function queryNodeCnfAction(params) {
  const { currentOrganizationId, ...otherParams } = params;
  return request(`/sdps/v1/${currentOrganizationId}/docfData/queryNodeCnfAction`, {
    query: otherParams,
  });
}

export async function queryNodeDocRoute(params) {
  const { nodeDataId, currentOrganizationId } = params;
  return request(`/sdps/v1/${currentOrganizationId}/node-link-field-configs/${nodeDataId}`);
}

export async function queryNodesAuthority(params) {
  const { currentOrganizationId } = params;
  return request(`/sdps/v1/${currentOrganizationId}/node-authoritys/details`);
}

export async function queryNodeRelDocInfo(params) {
  const { currentOrganizationId, ...otherParams } = params;
  return request(`/sdps/v1/${currentOrganizationId}/docfData/queryNodeRelDocInfo`, {
    query: otherParams,
  });
}

export async function queryNodeRelDocData(params) {
  const { currentOrganizationId, ...otherParams } = params;
  return request(`/sdps/v1/${currentOrganizationId}/docfData/show-doc-flow`, {
    query: otherParams,
  });
}
