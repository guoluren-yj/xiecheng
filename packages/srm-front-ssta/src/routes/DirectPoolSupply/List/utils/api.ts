import request from 'utils/request';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { ActiveKey, ActionMap } from './type';

export async function fetchListTotal(activeKey: ActiveKey) {
  let url = `/ssta/v1/${getCurrentOrganizationId()}/direct-pools/count`;
  if ([ActiveKey.A, ActiveKey.B, ActiveKey.C, ActiveKey.D].includes(activeKey)) {
    url = `${url}?tab=${ActionMap[activeKey]}`;
  } else {
    url = `/ssta/v1/${getCurrentOrganizationId()}/direct-invoice-apply-headers/count?tab=${ActionMap[activeKey]}`;
  }
  return request(url, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
  });
}

export async function fetchListAllTotal(key, activeKey?: ActiveKey) {
  let url = `/ssta/v1/${getCurrentOrganizationId()}/direct-pools/count`;
  if (['invoice'].includes(key)) {
    url = `/ssta/v1/${getCurrentOrganizationId()}/direct-invoice-apply-headers/count`;
  }
  if (activeKey) {
    url = `${url}?tab=${ActionMap[activeKey]}`;
  }
  const res = getResponse(await request(url, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
  }));
  return {
    data: res || [],
    key,
  };
}
