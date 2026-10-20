import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import {
  parseParameters,
  getCurrentOrganizationId,
  getAccessToken,
  getRequestId,
} from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 报价明细头
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchHeader(params) {
  const { rfxHeaderId, tenantId, sourceResultId, ...otherParams } = params;
  // 协议通过sourceResultId查询报价明细
  if (sourceResultId || !rfxHeaderId) {
    const param = parseParameters(otherParams);
    const organizationIds = organizationId || tenantId;
    return request(`${prefix}/${organizationIds}/rfx/external/quotationTemplate/view`, {
      method: 'GET',
      query: { ...param, sourceResultId },
    });
  }
  const param = parseParameters(otherParams);
  const sourceFrom = param.sourceFrom === 'RFX' || param.sourceFrom === 'PROJECT' ? 'rfx' : 'bid';
  const organizationIds = organizationId || tenantId;
  return request(
    `${prefix}/${organizationIds}/${sourceFrom}/${rfxHeaderId}/quotationTemplate/view`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * 报价重构-报价明细头
 */
export async function fetchQuotationDetailHeader(params = {}) {
  const { tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const organizationIds = organizationId || tenantId;

  return request(`${SRM_SSRC}/v2/${organizationIds}/rfx/quotation/header/record/quotation-detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 报价明细头 - 新报价
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchHeaderCurrentQuotation(params) {
  const { tenantId, ...otherParams } = params;

  const param = parseParameters(otherParams);
  const organizationIds = organizationId || tenantId;

  // // 协议通过sourceResultId查询报价明细
  // if (sourceResultId) {

  //   return request(`${prefix}/${organizationIds}/rfx/external/quotationTemplate/view`, {
  //     method: 'GET',
  //     query: { ...param, sourceResultId },
  //   });
  // }
  // const sourceFrom = param.sourceFrom === 'RFX' || param.sourceFrom === 'PROJECT' ? 'rfx' : 'bid';
  return request(`${SRM_SSRC}/v2/${organizationIds}/rfx/sup-dtl`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 报价明细头-供订单和物流使用
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchSodrQuotationDetail(params) {
  const { rfxHeaderId, tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  // const sourceFrom = param.sourceFrom === 'RFX' ? 'rfx' : 'bid';
  const organizationIds = tenantId || organizationId;
  return request(`${prefix}/${organizationIds}/rfx/external/quotationTemplate/view`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 模板
 */
export async function fetchTemplate(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-column/${param.templateId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 删除报价模板明细
 */
export async function deleteElementDetail(params) {
  return request(
    `${SRM_SSRC}/v1/${organizationId}/share/sup-dtl/${params.sourceHeaderId}/${params.quotationLineId}/supQuotationDetails/batchDelete`,
    {
      method: 'DELETE',
      body: params.deleteIds,
    }
  );
}

/**
 * 保存报价明细
 */
export async function saveData(params) {
  const { quotationHeaderId, query = {}, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/share/sup-dtl/${quotationHeaderId}`, {
    method: 'POST',
    query: {
      ...query,
    },
    body: otherParams.quotationColumns,
  });
}

/**
 * 保存报价明细-报价新
 */
export async function saveDataCurrentQuotation(params = {}) {
  const { quotationHeaderId, query, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/sup-dtl`, {
    method: 'POST',
    body: otherParams.quotationColumns,
    query,
  });
}

/**
 * 保存报价明细-采购方
 */
export async function savePurchaseData(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-details/save`, {
    method: 'POST',
    body: otherParams,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 报价明细-二级
 */
export async function fetchTwoDetails(params) {
  const sourceFrom = params.sourceFrom === 'RFX' ? 'rfx' : 'bid';
  return request(
    `${SRM_SSRC}/v1/${organizationId}/${sourceFrom}/${params.sourceHeaderId}/quotationTemplate/view/${params.supQuotationDetailId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 删除报价明细
 */
export async function deleteQuotationDetail(params) {
  return request(
    `${SRM_SSRC}/v1/${organizationId}/quotation-details/${params.sourceHeaderId}/${params.rfxLineItemId}/delete`,
    {
      method: 'DELETE',
      body: params.deleteIds,
    }
  );
}

/**
 * 保存报价明细
 */
export async function saveQuotationDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-details/save`, {
    method: 'POST',
    body: params.quotationColumns,
  });
}

/**
 * 导出报价明细
 */
export async function exportQuotationDetail(params) {
  const result = await request(`${SRM_SSRC}/v1/${organizationId}/share/sup-dtl/export-excel`, {
    query: {
      ...params,
      ...{ access_token: getAccessToken(), 'H-Request-Id': getRequestId(), action: 'EXPORT' },
    },
    method: 'GET',
    responseType: 'blob',
  });
  return result;
}

/**
 * 导出报价明细
 */
export async function exportQuotationDetailV2(params) {
  const result = await request(`${SRM_SSRC}/v2/${organizationId}/rfx/sup-dtl/export-excel`, {
    query: {
      ...params,
      ...{ access_token: getAccessToken(), 'H-Request-Id': getRequestId(), action: 'EXPORT' },
    },
    method: 'GET',
    responseType: 'blob',
  });
  return result;
}
