import request from 'utils/request';
import Cookies from 'universal-cookie';
import { SRM_SSRC } from '_utils/config';

import { getToken } from '@/utils/utils';

const cookie = new Cookies();
/**
 * rf公告-查询
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryRFNoticeInfo(params) {
  const { sourceCategory, rfHeaderId, tenantId, ...others } = params;
  if (!getToken()) Object.assign(others, { lang: cookie.get('language') || 'zh_CN' });
  return request(
    `${SRM_SSRC}/v1/${tenantId}/source-notices/${sourceCategory}/BR/${rfHeaderId}/${
      getToken() ? 'preview' : 'preview-site'
    }`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/**
 * rfx-中标公告-头信息
 * @param {Object} params
 * @returns
 */
export async function queryRFXHeaderInfoForNotice(params = {}) {
  const { sourceCategory, rfxHeaderId, tenantId, ...others } = params;
  if (!getToken()) Object.assign(others, { lang: cookie.get('language') || 'zh_CN' });
  return request(
    `${SRM_SSRC}/v1/${tenantId}/source-notices/${sourceCategory}/BR/${rfxHeaderId}/${
      getToken() ? 'preview' : 'preview-site'
    }`,
    {
      method: 'GET',
      query: others,
    }
  );
}
