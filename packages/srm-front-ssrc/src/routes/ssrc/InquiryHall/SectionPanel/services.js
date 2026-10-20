import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

const organizationId = getCurrentOrganizationId();

/**
 * 获取相同询价单状态下的标段信息
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchSectionInfo(params = {}) {
  const { rfxHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/${rfxHeaderId}/project/section`, {
    method: 'GET',
    query: otherParams,
  });
}

// 供应商-分标段-批量查询标段
export async function fetchSupplierSectionList(params = {}) {
  const { organizationId: currentOrganizationId = null, rfxHeaderId = null, ...others } = params;
  return request(
    `${prefix}/${currentOrganizationId}/rfx/${rfxHeaderId}/supplier/section-batch-list/query`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 查询供应商报价分标段数据
export async function fetchSupplierPriceSectionList(params = {}) {
  const { organizationId: currentOrganizationId = null, rfxHeaderId = null, ...others } = params;
  return request(
    `${prefix}/${currentOrganizationId}/rfx/${rfxHeaderId}/supplier-quotation/section-batch-list/query`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 查询多轮报价分标段数据
export function fetchRoundQuotationSectionList(params) {
  const { rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/round-headers/section/list`, {
    method: 'GET',
    query: { sourceHeaderId: rfxHeaderId },
  });
}
