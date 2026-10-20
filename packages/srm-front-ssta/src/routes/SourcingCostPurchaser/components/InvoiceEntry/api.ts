import request from 'utils/request';
import { getCurrentTenant } from 'utils/utils';
import { SRM_SSTA, SRM_PLATFORM } from '_utils/config';

const { tenantId } = getCurrentTenant();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

// 获取业务规则定义
export async function getBusinessRules({ cnfCode, ...query }) {
  return request(
    `${SRM_PLATFORM}/v1/${tenantId}/cnf-actions/${cnfCode}/invoke_with_parameter`,
    {
      method: 'GET',
      query,
    }
  );
}

// 税务发票上传/删除附件请求新增接口
export async function updateAttachmentTaxAction(body) {
  return request(`${apiPrefix}/invoice-action/attachment`, {
    method: 'POST',
    body,
  });
}

/**
 * @description:查询发票操作记录
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function queryInvoiceOperation(invoiceHeaderId: string | number) {
  return request(`${apiPrefix}/invoice-action/${invoiceHeaderId}`, {
    method: 'GET',
    query: { page: 0, size: 0 },
  });
}

export async function validateTenderInvList(body) {
  return request(`${apiPrefix}/tender-feess/invoice-status/valid-confirm`, {
    method: 'POST',
    body,
  });
}

export async function validateServiceInvList(body) {
  return request(`${apiPrefix}/server-feess/invoice-status/valid-confirm`, {
    method: 'POST',
    body,
  });
}

export async function submitTenderInvList(body) {
  return request(`${apiPrefix}/tender-feess/invoice-status/confirm`, {
    method: 'POST',
    body,
  });
}

export async function submitServiceInvList(body) {
  return request(`${apiPrefix}/server-feess/invoice-status/confirm`, {
    method: 'POST',
    body,
  });
}
