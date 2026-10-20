import request from 'utils/request';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import type { ActiveKey } from './type';
import { ActionMap } from './type';

/**
 * @description:列表页整单查询接口
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchPaymentPoolTotal(activeKey: ActiveKey) {
  const url = activeKey === 'error' ?
  `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pool-errors/list` :
  `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pools/list`;
  const action = ActionMap[activeKey];
  return request(url, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100, action },
  });
}

