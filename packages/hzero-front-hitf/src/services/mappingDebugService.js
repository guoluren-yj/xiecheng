import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel() ? `/${organizationId}` : '';

/**
 * 字段映射转化测试
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function fieldMappingTest(params) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/interfaces/field-mapping-test`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 数据映射转化测试
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function dataMappingTest(params) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/interfaces/value-mapping-test`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 映射转化流程测试
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function mappingFlowTest(params) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/interfaces/mapping-flow-test`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 同步映射配置
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function packetMappingLink(params) {
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/interfaces/packet-mapping-link`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 导入映射配置
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function mappingTestImport(params) {
  const { file } = params;
  const data = new FormData();
  data.append('file', file, file.name);
  return request(`${HZERO_HITF}/v1${organizationRoleLevel}/interfaces/mapping-test-import`, {
    method: 'POST',
    type: 'FORM',
    body: data,
  });
}
