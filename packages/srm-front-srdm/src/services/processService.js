/**
 * Process
 * @author: zhihaao.cai@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

/**
 * @description: Process Auto Generate
 * @param {*} params
 * @return {*}
 */
export function repushOperate(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-processs/retry`
      : `${HZERO_SRDM}/v1/data-migrate-processs/retry`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export function canRepushOperate(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-processs/can-retry`
      : `${HZERO_SRDM}/v1/data-migrate-processs/can-retry`,
    {
      method: 'POST',
      body: params,
    }
  );
}
