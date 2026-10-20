import request from 'utils/request';
import { SRM_MDM } from '_utils/config';

/**
 * 明细同步
 */
export async function bankSync(params) {
  return request(`${SRM_MDM}/v1/bank-external-entry/sync-platform`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量同步
 */
export async function bankBatchSync(params) {
  const { data, bankId } = params;
  return request(`${SRM_MDM}/v1/bank-external-entry/sync-platform/batch-create`, {
    method: 'POST',
    body: data,
    query: { bankId },
  });
}
