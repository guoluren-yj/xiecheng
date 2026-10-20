import request from 'utils/request';
import { SRM_SBDM } from '_utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { ActionMap } from './type';
import type { ActiveKey } from './type';

/**
 * @description:列表页整单查询接口
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchBillPoolTotal(activeKey: ActiveKey) {
  return request(`${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/page-list`, {
    method: 'GET',
    query: { type: ActionMap[activeKey], page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
  });
}

export async function billPoolHandle(
  type: string,
  { body = {}, query = {} }: any = {}
) {
  let url = '';
  const options = { body, query, method: 'POST' };
  switch (type) {
    case 'void':
      url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/cancel`;
      break;
    case 'without':
      url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/no-need-use`;
      break;
    case 'split':
      url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/split`;
      break;
    default:
  }
  return getResponse(await request(url, options));
};