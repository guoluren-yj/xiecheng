import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export async function syncAiInvoiceHeader(body) {
  return request(`${SRM_SSTA}/v1/${getCurrentOrganizationId()}/invoice-ai-header-infos/sync`, {
    method: 'POST',
    body,
  });
}

/**
 * @description: 查询AI识别记录各状态计数
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchAiRecognizeRecordTotal(params: { identifyStatus: string }) {
  return request(`${SRM_SSTA}/v1/${getCurrentOrganizationId()}/invoice-ai-batch/page`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', ...params },
  });
}

