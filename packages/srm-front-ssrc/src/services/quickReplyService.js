/**
 * 供应商快速回复
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

// 快速回复-批量报价校验
export async function qrBatchQuotationValidate(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/batch-submit-validate`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 发送消息
export async function qrBatchQuotationSubmit(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/batch-submit`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 【放弃并关闭】【放弃并下一个】
export async function qrAbandon(params) {
  const { query = {}, ...others } = params || {};
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/abandon`,
    {
      method: 'POST',
      query,
      body: others,
    }
  );
}

// 【批量放弃】
export async function qrBatchAbandon(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/batch-abandon`,
    {
      method: 'POST',
      body: params,
    }
  );
}
