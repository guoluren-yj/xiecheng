import request from 'utils/request';
import { isEmpty } from 'lodash';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;

async function putOverviewOfNodes(data) {
  return request(`${requestUrlPre}/node-details`, {
    method: 'POST',
    body: data,
  });
}

async function deleteOverviewOfNodes(data) {
  return request(`${requestUrlPre}/node-details`, {
    method: 'DELETE',
    body: data,
  });
}

async function putProgressDefinition(data) {
  return request(`${requestUrlPre}/node-progress-defs`, {
    method: 'POST',
    body: data,
  });
}

async function deleteProgressDefinition(data) {
  return request(`${requestUrlPre}/node-progress-defs`, {
    method: 'DELETE',
    body: data,
  });
}

async function putStatusPhaseMapping(data) {
  return request(`${requestUrlPre}/node-prog-def-maps`, {
    method: 'POST',
    body: data,
  });
}

async function deleteStatusPhaseMapping(data) {
  return request(`${requestUrlPre}/node-prog-def-maps`, {
    method: 'DELETE',
    body: data,
  });
}

async function putJumpDetailLink(data, object = {}) {
  const url = isEmpty(object) ? 'node-links' : `node-links?nodeId=${object?.nodeId}&linkCheckFlag=${object?.linkCheckFlag}&objectVersionNumber=${object?.objectVersionNumber}`;
  return request(`${requestUrlPre}/${url}`, {
    // node-link-field-configs
    method: 'POST',
    body: data,
  });
}

async function deleteJumpDetailLink(data) {
  return request(`${requestUrlPre}/node-links`, {
    // /node-link-field-configs
    method: 'DELETE',
    body: data,
  });
}

async function putPerformDocuments(data) {
  return request(`${requestUrlPre}/node-rel-doc-configs`, {
    method: 'POST',
    body: data,
  });
}

async function putActionConfiguration(data) {
  return request(`${requestUrlPre}/node-operation-details`, {
    method: 'POST',
    body: data,
  });
}

async function getDocFlowDefinitionCoding(data, param) {
  const { nodeId } = data;
  return request(`${requestUrlPre}/node-definitions/${nodeId}`, {
    method: 'GET',
    query: param,
  });
}

async function referenceSrmOverviewData(data) {
  return request(`${requestUrlPre}/node-details/reference`, {
    method: 'POST',
    body: data,
  });
}

async function referenceSrmProcessData(data) {
  return request(`${requestUrlPre}/node-progress-defs/reference`, {
    method: 'POST',
    body: data,
  });
}

async function referenceSrmProcessDataLink(data) {
  const { nodeDefinitionCode } = data;
  return request(`${requestUrlPre}/node-links/reference`, {
    method: 'GET',
    query: { nodeCode: nodeDefinitionCode },
  });
}

async function referenceSrmPerformData(data) {
  return request(`${requestUrlPre}/node-rel-doc-configs/reference`, {
    method: 'POST',
    body: data,
  });
}

async function referenceSrmActionConfigData(data) {
  return request(`${requestUrlPre}/node-operation-details/reference`, {
    method: 'POST',
    body: data,
  });
}

async function putNodeLinkRules(data) {
  return request(`${requestUrlPre}/node-link-rules`, {
    method: 'PUT',
    body: data,
  });
}

async function lineDetailChange(data, url) {
  return request(`${requestUrlPre}/${url}`, {
    method: 'DELETE',
    body: data,
  });
}

async function basicInfoServices(data) {
  const url = tenantFlag ? `${requestUrlPre}/node-definitions`
    : `${SRM_DATA_PROCESS}/v1/node-definitions/${data.tenantId}`;
  return request(url, {
    method: 'POST',
    body: data,
  });
}

async function deleteJumpDetailLinkParams(data) {
  return request(`${requestUrlPre}/node-link-field-configs`, {
    method: 'DELETE',
    body: data,
  });
}

export {
  basicInfoServices,
  putOverviewOfNodes,
  deleteOverviewOfNodes,
  putProgressDefinition,
  deleteProgressDefinition,
  putStatusPhaseMapping,
  deleteStatusPhaseMapping,
  putJumpDetailLink,
  deleteJumpDetailLink,
  putPerformDocuments,
  getDocFlowDefinitionCoding,
  putActionConfiguration,
  referenceSrmOverviewData,
  referenceSrmProcessData,
  referenceSrmProcessDataLink,
  referenceSrmPerformData,
  referenceSrmActionConfigData,
  putNodeLinkRules,
  lineDetailChange,
  deleteJumpDetailLinkParams,
};
