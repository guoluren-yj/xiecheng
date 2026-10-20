/**
 * Deploy Res Info
 * @author: zhihaao.cai@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

/**
 * @description: 密码验证
 * @param {*} params
 * @return {*}
 */
export function checkPwd(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-recs/checkPwd`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-recs/checkPwd`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * @description: 同步逻辑
 * @param {*} params
 * @return {*}
 */
export function migrateData(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-recs/migrateData`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-recs/migrateData`,
    {
      method: 'POST',
      body: params,
    }
  );
}
