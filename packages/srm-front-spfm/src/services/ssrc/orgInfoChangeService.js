import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// 提交
export async function orgInfoChangeSubmit(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/skgf/submit`, {
    method: 'POST',
    body: params,
  });
}

// 保存
export async function orgInfoChangeSave(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/skgf/edit`, {
    method: 'POST',
    body: params,
  });
}

// 获取增量数据
export async function orgInfoChangeGetAddData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/skgf/add`, {
    method: 'POST',
    body: params,
  });
}
