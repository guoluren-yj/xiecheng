import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 复制
export async function copy(postageId) {
  return request(`/sagm/v1/${organizationId}/postages/copy/${postageId}`, {
    method: 'GET',
  });
}

// 启用/禁用
export async function updateFreight(params) {
  return request(`/sagm/v1/${organizationId}/postages/supplier/enable`, {
    method: 'POST',
    body: [params],
  });
}

// 查询运费
export async function fetchFreight(params) {
  return request(`/sagm/v1/${organizationId}/postages/supplier`, {
    method: 'GET',
    query: params,
  });
}

// 新增运费
export async function addFreight(params) {
  return request(`/sagm/v1/${organizationId}/postages/save/new`, {
    method: 'POST',
    body: params,
  });
}

// 删除运费
export async function deleteFreight(params) {
  return request(`/sagm/v1/${organizationId}/postages/supplier/enable`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除运费行
export async function deleteFreightLine(params) {
  return request(`/sagm/v1/${organizationId}/postage-lines/${params.postageLineId}`, {
    method: 'DELETE',
  });
}
