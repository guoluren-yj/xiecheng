/**
 * Config Object
 * @author: zhihaao.cai@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

/**
 * @description: Distribute
 * @param {*} params
 * @return {*}
 */
export function dataDistribute(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-dists/dist/${params.deployInfoId}`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-dists/dist/${params.deployInfoId}`,
    {
      method: 'POST',
      body: params.dataMigrateRecList,
    }
  );
}

/**
 * @description: Condition Distribute
 * @param {*} params
 * @return {*}
 */
export function conditionDist(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-dists/condition-dist/${params.deployInfoId}`
      : `${HZERO_SRDM}/v1/hpdm-config-deploy-dists/condition-dist/${params.deployInfoId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}
