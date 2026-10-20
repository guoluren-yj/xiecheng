/**
 *
 * @date: 2020/7/22
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export function submitEventRecord({ evalEventHeaderId, evalEventHeader = {}, customizeUnitCode }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-event-header/${evalEventHeaderId}/submitAndSave`,
    {
      method: 'POST',
      body: evalEventHeader,
      query: { customizeUnitCode },
    }
  );
}

export function batchSubmit(params = {}) {
  const { evalEventHeaderIds = [] } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-event-header/batch-submit`, {
    method: 'POST',
    body: evalEventHeaderIds,
  });
}

export async function obsoletedEventRecord(params = {}) {
  const { evalEventHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-event-header/${evalEventHeaderId}/abandon`,
    {
      method: 'POST',
      body: {
        tenantId: organizationId,
        evalEventHeaderId,
      },
    }
  );
}
