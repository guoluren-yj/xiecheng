import request from 'utils/request';
// import { getCurrentOrganizationId } from 'utils/utils';

// const organizationId = getCurrentOrganizationId();

// 新建
export async function createTask(params) {
  return request(`/smep/v1/ec-init-tasks`, {
    method: 'POST',
    body: params,
  });
}

export async function initTask(params) {
  return request(`/smep/v1/ec-init-tasks/ec-sku-init`, {
    method: 'POST',
    body: params,
  });
}

export async function continueTask(params) {
  return request(`/smep/v1/ec-init-tasks/ec-sku-init/continue`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDetailData(params) {
  const { taskId, ...rest } = params;
  return request(`/smep/v1/ec-init-tasks/task-detail/${taskId}`, {
    method: 'GET',
    query: { ...rest },
  });
}
