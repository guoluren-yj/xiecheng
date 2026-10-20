import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();
/**
 *查询分类
 *
 */
export async function fetchCategoryTree() {
  return request(`/smpc/v1/category/${organizationId}/getTreeWithThreeList`, {
    method: 'GET',
  });
}

// 查询组织
export async function fetchOrgTree() {
  const url = `/sagm/v1/${organizationId}/pur-units/edit-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 查询区域
export async function fetchRegionTree() {
  const url = `${SRM_MALL}/v1/${organizationId}/mall-regions/regional-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 判断是否有撤销按钮
export async function fetchOperationFlagService(params) {
  return request(`/hwfp/v1/${organizationId}/runtime/prc/operation-flag?revokeFlag=1`, {
    method: 'POST',
    body: params,
  });
}

// 撤销工作流审批
export function revokeApproveService(params) {
  return request(`/hwfp/v1/${organizationId}/runtime/prc/revoke-by-key/${params}`, {
    method: 'GET',
    responseType: 'text',
  });
}
