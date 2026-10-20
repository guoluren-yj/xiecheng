import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 外协库存表配置保存
export async function saveInventoryList(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/strategy`, {
    method: 'PUT',
    body: data,
  });
}

// 外协库存表配置头删除
export async function delInventoryList(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/strategy`, {
    method: 'DELETE',
    body: data,
  });
}

// 外协库存表配置头详情
export async function queryInventoryDetail(id) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/strategy/${id}`, {
    method: 'get',
  });
}

// 外协库存表配置行删除
export async function delInventoryLine(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/strategy/line`, {
    method: 'DELETE',
    body: data,
  });
}

// 外协库存表配置行列表查询
export async function queryInventoryList(id) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/strategy/line?strategyHeaderId=${id}`, {
    method: 'GET',
  });
}

// 周期删除

export async function delInventoryWeek(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/strategy/mapping-line`, {
    method: 'DELETE',
    body: data,
  });
}

// 周期查询
export async function queryInventoryWeek(id) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/mapping-line?strategyHeaderId=${id}`,
    {
      method: 'GET',
    }
  );
}

// 保存数据-操作权限
export async function savePermissonModal(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/${params.strategyHeaderId}/permission`,
    {
      method: 'PUT',
      body: params.data,
    }
  );
}
