/**
 * Config Object TBL
 * @author: zhihaao.cai@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

/**
 * @description: Config Object TBL Auto Generate
 * @param {*} params
 * @return {*}
 */
export function groupAddObject(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-objs/dist/${params.mgGroupId}`
      : `${HZERO_SRDM}/v1/data-migrate-objs/dist/${params.mgGroupId}`,
    {
      method: 'POST',
      body: params.dataMigrateObjs,
    }
  );
}
