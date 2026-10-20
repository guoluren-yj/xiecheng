import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export function updateStatus(params) {
  return request(`/smpc/v1/${organizationId}/custom-attr-templates/enabled-flag`, {
    method: 'POST',
    body: params,
  });
}

export function fetchTemplate(params) {
  return request(`/smpc/v1/${organizationId}/custom-attr-templates/${params.templateId}`, {
    method: 'GET',
    query: params,
  });
}

export function saveTemplate(params) {
  return request(`/smpc/v1/${organizationId}/custom-attr-templates`, {
    method: 'POST',
    body: params,
  });
}

export function fetchSpuAttrGroup(params) {
  return request(`/smpc/v1/${organizationId}/spu-custom-attr-groups/${params.spuId}`, {
    method: 'GET',
  });
}

export function saveSpuAttrGroup(params) {
  const { spuId, customGroupList, ...others } = params;
  return request(`/smpc/v1/${organizationId}/spu-custom-attr-groups/${spuId}`, {
    method: 'POST',
    body: { ...others, spuCustomGroupList: customGroupList },
  });
}

export function deleteTemplate(params) {
  return request(`/smpc/v1/${organizationId}/custom-attr-templates/template`, {
    method: 'DELETE',
    body: params,
  });
}

export function deleteAttrGroup(params) {
  return request(`/smpc/v1/${organizationId}/custom-attr-templates/group`, {
    method: 'DELETE',
    body: params,
  });
}

export function deleteAttrLine(params) {
  return request(`/smpc/v1/${organizationId}/custom-attr-templates/detail`, {
    method: 'DELETE',
    body: params,
  });
}

export function deleteSpuAttrGroup(params) {
  return request(`/smpc/v1/${organizationId}/spu-custom-attr-groups/group`, {
    method: 'DELETE',
    body: params,
  });
}

export function deleteSpuAttrLine(params) {
  return request(`/smpc/v1/${organizationId}/spu-custom-attr-groups/detail`, {
    method: 'DELETE',
    body: params,
  });
}
