import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SLOD } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询节点信息
export async function fetchNode(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/strategy/node-config/list?campKey=p`, {
    query: params,
    method: 'GET',
  });
}

// 查询单据行详细信息
export async function fetchListNumber(params) {
  return request(
    `${SRM_SLOD}/v1/${organizationId}/delivery/${params.poLineLocationId}/${params.nodeConfigId}/report-info?campKey=p`,
    {
      method: 'GET',
    }
  );
}

// 更新发/收货策略
export async function fetchUpdate(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/po-init-retry?campKey=p`, {
    method: 'POST',
    body: params,
  });
}

// 发货进度重置
export async function onHandleScheduleRset(params) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/po-init-reset?campKey=p`, {
    method: 'DELETE',
    body: params,
  });
}
