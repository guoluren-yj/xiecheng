/**
 * relTableDefinitionService.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_ADAPTOR } from '_utils/config';

const currentOrganizationId = getCurrentOrganizationId();

export async function savaRelTableDefinitionData(params) {
  return request(`${SRM_ADAPTOR}/v1/rel-table-definitions`, {
    method: 'POST',
    body: params,
  });
}

export async function updateRelTableDefinitionData(params) {
  return request(`${SRM_ADAPTOR}/v1/rel-table-definitions`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteRelTableDefinitionData(params) {
  return request(`${SRM_ADAPTOR}/v1/rel-table-definitions`, {
    method: 'DELETE',
    body: params,
  });
}

export async function savaRelTableDefinitionOrgData(params) {
  return request(`${SRM_ADAPTOR}/v1/${currentOrganizationId}/rel-table-definitions`, {
    method: 'POST',
    body: params,
  });
}

export async function updateRelTableDefinitionOrgData(params) {
  return request(`${SRM_ADAPTOR}/v1/${currentOrganizationId}/rel-table-definitions`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteRelTableDefinitionOrgData(params) {
  return request(`${SRM_ADAPTOR}/v1/${currentOrganizationId}/rel-table-definitions`, {
    method: 'DELETE',
    body: params,
  });
}

export async function checkRelTableDefinitionCreatable() {
  return request(`${SRM_ADAPTOR}/v1/${currentOrganizationId}/rel-table-definitions/create/check`, {
    method: 'GET',
  });
}

export async function getRelTableDefinitionActionTable(params) {
  return request(`${SRM_ADAPTOR}/v1/rel-table-actions`, {
    method: 'GET',
    query: params,
  });
}

export async function saveRelTableDefinitionActionTable(params) {
  return request(`${SRM_ADAPTOR}/v1/rel-table-actions`, {
    method: 'POST',
    body: params,
  });
}

export async function updateRelTableDefinitionActionTable(params) {
  return request(`${SRM_ADAPTOR}/v1/rel-table-actions`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteRelTableDefinitionActionTable(params) {
  return request(`${SRM_ADAPTOR}/v1/rel-table-actions`, {
    method: 'DELETE',
    body: params,
  });
}

export async function createRelTableMenu(params) {
  return request(`${SRM_ADAPTOR}/v1/${currentOrganizationId}/rel-table-definitions/rel-menu`, {
    method: 'POST',
    body: params,
  });
}
