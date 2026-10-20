/**
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/25
 * @copyright HAND ® 2019
 */

import request from 'utils/request';
import { getEnvConfig } from 'utils/iocUtils';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const { HZERO_PLATFORM } = getEnvConfig();

/**
 * 获取加密公钥
 */
export async function getPublicKey() {
  const res = request(`${HZERO_PLATFORM}/v1/tool/pass/public-key`, {
    method: 'GET',
  });

  // FIXME: @WJC utils need fix
  // @ts-ignore
  return getResponse(res);
}

// 查询业务规则中的日历开关
export async function fetchGlobalCalendarEnable() {
  return request(`/sada/v1/${isTenantRoleLevel () ? `${getCurrentOrganizationId()}/` : ''}marmot-organization-api/CNF_INVOKE`, {
    method: 'POST',
    body: {
      cnfCode:"SITE.SPFM.CALENDAR_ENABLE"
    },
  })
}

/**
 * 根据域名获取租户公开信息
 */
export async function getPublicInfoByHost(host?: string) {
  const res = request(`/spfm/v1/pub-info`, {
    method: 'GET',
    query: {
      host,
    }
  });
  // @ts-ignore
  return getResponse(res);
}