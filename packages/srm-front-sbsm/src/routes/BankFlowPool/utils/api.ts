import request from 'utils/request';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { ActionMap } from './type';

/**
 * @description:列表页整单查询接口
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchBankFlowTotal(tabKeys) {
  const url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-serial/count`;
  const tab = ActionMap[tabKeys[0]];
  return request(url, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100, tab },
  });
}
