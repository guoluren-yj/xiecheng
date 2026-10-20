import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
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
export async function fetchQuotationDetailHeader(params) {
  const { rfxHeaderId, tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const sourceFrom = param.sourceFrom === 'RFX' ? 'rfx' : 'bid';
  const organizationIds = tenantId || organizationId;
  return request(
    `${prefix}/${organizationIds}/${sourceFrom}/${rfxHeaderId}/quotationTemplate/view`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
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
export async function fetchQuotationDetailTemplate(params) {
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
export async function saveElementDetail(params) {
  const { quotationHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/share/sup-dtl/${quotationHeaderId}`, {
    method: 'POST',
    body: otherParams.quotationColumns,
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
