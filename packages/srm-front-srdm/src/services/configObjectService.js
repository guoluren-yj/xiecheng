/**
 * Config Object
 * @author: zhihaao.cai@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

/**
 * @description: Config Object Import
 * @param {*} params
 * @return {*}
 */
export function configObjectImport(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/importExcel`
      : `${HZERO_SRDM}/v1/hpdm-config-objects/importExcel`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * @description: Config Object Export
 * @param {*} params
 * @return {*}
 */
export function configObjectExport(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/exportExcel?moduleName=${params.moduleName}`
      : `${HZERO_SRDM}/v1/hpdm-config-objects/exportExcel?moduleName=${params.moduleName}`,
    {
      method: 'POST',
      body: params.configObjectList,
      responseType: 'blob',
    }
  );
}

/**
 * @description: Diff Config Object
 * @param {*} params
 * @return {*}
 */
export function diffConfigObject(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/validate`
      : `${HZERO_SRDM}/v1/hpdm-config-objects/validate`,
    {
      method: 'POST',
      body: params.configObjectList,
      responseType: 'text',
    }
  );
}
