/**
 * Deploy Info
 * @author: zhihaao.cai@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

/**
 * @description: Deploy Info Import
 * @param {*} params
 * @return {*}
 */
export function deployInfoImport(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/data-import`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/data-import`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * @description: Deploy Info Export
 * @param {*} params
 * @return {*}
 */
export function deployInfoExport(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/data-export`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/data-export`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export function deployInfoImportNew(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/data-import`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/data-import`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * @description: Deploy Info Export
 * @param {*} params
 * @return {*}
 */
export function deployInfoExportTest(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/data-export-test`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/data-export-test`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export function deployInfoExportByIssueNum(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/data-export-by-deploy-num`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/data-export-by-deploy-num`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * @description: Deploy Info Enable/Disable
 * @param {*} params
 * @return {*}
 */
export function dataConfigEnable(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-dists/enable`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-dists/enable`,
    {
      method: 'POST',
      body: params,
    }
  );
}
