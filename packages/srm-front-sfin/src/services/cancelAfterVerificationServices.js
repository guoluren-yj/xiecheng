/**
 * payApproveService.js - 付款申请审批
 * @date: 2019-12-10
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_FINANCE } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询头信息
 * @param {Object} params - 请求参数
 */
export async function queryHeaderList(params) {
  const { paymentLineId, ...query } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/cancel-verifications/${paymentLineId}/list-page`,
    {
      method: 'GET',
      query,
    }
  );
}
