import request from 'utils/request';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import { HZERO_HITF } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 接口查询配置新建
 * @async
 * @function createInterfaceQuery
 * @params 接口参数
 * @returns {object} fetch Promise
 */
export async function createInterfaceQuery(params = {}) {
  const data = filterNullValueObject(parseParameters(params));
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/open-monitor-manages`
      : `${HZERO_HITF}/v1/open-monitor-manages`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 接口加密保存
export async function addEncryption(params = {}) {
  const data = filterNullValueObject(params);
  return request(`${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/create`, {
    method: 'POST',
    body: data,
  });
}

// 接口加密表单详情
export async function getEncryptionFormDetail(encryHeaderId) {
  return request(
    `${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/${encryHeaderId}/detail`
  );
}

// 批量配置
export async function setBatchConfig(params) {
  const data = filterNullValueObject(params);
  return request(`${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/root`, {
    method: 'PUT',
    body: data,
  });
}

// 获取行数据的接口加密配置
export async function getEncryConfig(tenantInterfaceId) {
  return request(
    `${HZERO_HITF}/v1/open-interface-encry-lines/${organizationId}/${tenantInterfaceId}/detail`,
    {
      method: 'GET',
    }
  );
}

// 配置维护
export async function setSingleConfig(params) {
  const data = filterNullValueObject(params);
  return request(`${HZERO_HITF}/v1/open-interface-encry-lines/${organizationId}/update`, {
    method: 'PUT',
    body: { ...data },
  });
}

// 操作记录
export async function getOperationRecord(encryHeaderId) {
  // 接口没让传参encryHeaderId，应当需要
  return request(
    `${HZERO_HITF}/v1/open-interface-encry-header-records/${organizationId}/list?encryHeaderId=${encryHeaderId}`
  );
}

// 下线
export async function setOffline(id) {
  return request(`${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/offline`, {
    method: 'PUT',
    body: { encryHeaderId: id, status: 1 },
  });
}

// 删除
export async function deleteApp(id) {
  return request(`${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/remove`, {
    method: 'DELETE',
    body: { encryHeaderId: id },
  });
}

// 发布
export async function publishApp(id) {
  return request(`${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/update`, {
    method: 'PUT',
    body: { encryHeaderId: id },
  });
}

// 获取密钥
export async function getEncryKey(encryHeaderId) {
  return request(
    `${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/${encryHeaderId}/get`,
    {
      method: 'GET',
    }
  );
}
