import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function labelMaintain(params) {
  const { lines, labelConfigId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/label-asn-lines/${labelConfigId}`, {
    method: 'POST',
    body: lines,
  });
}

export async function fetchTreeList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/label-configs/list-count`, {
    method: 'GET',
    query: params,
  });
}

export async function labelVoid(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/label-headers`, {
    method: 'DELETE',
    body: params,
  });
}

export async function revokeLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/label-asn-lines`, {
    method: 'DELETE',
    body: params,
  });
}

export async function createLabelLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/label-lines`, {
    method: 'POST',
    body: params,
  });
}

export async function saveLabel(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/label-headers`, {
    method: 'PUT',
    body: params,
  });
}

export async function submitLabel(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/label-headers/submit`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteLabelLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/label-lines`, {
    method: 'DELETE',
    body: params,
  });
}

export async function labelPrint(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/batch/label-print`, {
    method: 'POST',
    body: params,
    responseType: 'blob',
  });
}

export async function createAndPrint(params) {
  const { labelConfigId, lines } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/label-lines/create-query/${labelConfigId}`, {
    method: 'POST',
    body: lines,
  });
}

export async function asnPrint(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/batch/label-asn-print`, {
    method: 'POST',
    body: params,
    responseType: 'blob',
  });
}
