/**
 * Data Source
 * @author: zhihaao.cai@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

/**
 * @description: Data Source Refresh
 * @param {*} params
 * @return {*}
 */
export function dataSourceRefresh(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/application-envs/reload-datasource`
      : `${HZERO_SRDM}/v1/application-envs/reload-datasource`,
    {
      method: 'GET',
      query: params,
    }
  );
}
