import request from 'utils/request';
// import { getCurrentOrganizationId } from 'utils/utils';

// const organizationId = getCurrentOrganizationId();

// 新建中间件调度规则
export async function fetchNewPolling(params) {
  return request(`/smep/v1/ec-pulls`, {
    method: 'POST',
    body: params,
  });
}

// 修改中间件调度规则
export async function fetchEditPolling(params) {
  return request(`/smep/v1/ec-pulls`, {
    method: 'PUT',
    body: params,
  });
}

// 删除中间件调度规则
export async function fetchDeletePolling(params) {
  return request(`/smep/v1/ec-pulls`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询中间件调度明细
export async function fetchPolling(params) {
  return request(`/smep/v1/ec-pulls/detail`, {
    method: 'GET',
    query: params,
  });
}

// 删除租户
export async function fetchDeleteTenant(params) {
  return request(`/smep/v1/ec-pulls/delete-tenant`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询所有电商
export async function fetchRetailers() {
  return request(`/spfm/v1/rel-table-records/smep_no_standard_connect_e_commerce/lov`, {
    method: 'GET',
    query: {
      lovCode: 'SMEP.EC',
      syncCountFlag: 'N',
      size: 10000000,
    },
  });
}
