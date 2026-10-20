import request from 'hzero-front/lib/utils/request';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const organizationRoleLevel = isTenant ? `/${organizationId}` : '';

// 应用编辑详情
export async function getAppDetailFormInfo(applicationHeaderId) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-application-headers/${applicationHeaderId}`,
    {
      method: 'GET',
    }
  );
}

// 保存应用
export async function saveApplication(params) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/open-application-headers/save`, {
    method: 'POST',
    body: params,
  });
}

// 发布应用
export async function publishApplication(applicationHeaderId) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-application-headers/submit/${applicationHeaderId}`,
    {
      method: 'POST',
    }
  );
}

// 删除应用
export async function deleteApplication(applicationHeaderId) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-application-headers/${applicationHeaderId}`,
    {
      method: 'DELETE',
    }
  );
}

// 删除API
export async function deleteApiLines(params, id) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-application-lines/${id}/batch-delete`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

// 操作记录
export async function getAppRecord(applicationHeaderId) {
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-application-operation-records/${applicationHeaderId}/list`,
    {
      method: 'GET',
    }
  );
}

// 选择电商时查询api信息中的表格数据
export async function getEbApiTable(type, tenantId) {
  const queryParam = isTenant ? {} : { tenantId };
  return request(
    `${HZERO_HITF}/v1${organizationRoleLevel}/open-interfaces/unassigned?lovCode=${
      isTenant ? 'HITF.OPEN.UNASSIGNED.INTERFACE.ORG.VIEW' : 'HITF.OPEN.UNASSIGNED.INTERFACE'
    }&size=0&asyncCountFlag=DEFAULT&applicationType=${type}`,
    {
      method: 'GET',
      query: queryParam,
    }
  );
}
