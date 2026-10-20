import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters } from 'utils/utils';

const prefix = `${SRM_SSRC}/v1`;
/**
 * 议价页面头
 * @async
 * @function fetchBargainHeader
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchBargainHeader(params) {
  const { organizationId, rfxHeaderId, path = [], customizeUnitCode } = params;
  let url;
  if (path.includes('quotation-controller')) {
    url = `${prefix}/${organizationId}/rfx/${rfxHeaderId}?allSelectFlag=1`;
  } else {
    url = `${prefix}/${organizationId}/rfx/simple/${rfxHeaderId}`;
  }
  return request(url, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 议价全部明细查询
 * @async
 * @function fetchBargainFullDetails
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchBargainFullDetails(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/bargain`, {
    method: 'GET',
    query: { ...param },
  });
}

// 议价报价明细查询 - 工作流审批
export async function fetchBargainFullDetailsApproval(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/snap/bargain`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 议价供应商列表查询
 * @async
 * @function fetchSupplierLineBargainPrice
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchSupplierLineBargainPrice(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/bargain/suppliers`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 物品明细-数据查询
 * @async
 * @function fetchItemDetailsInfo
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchItemDetailsInfo(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/items`, {
    method: 'GET',
    query: {
      ...param,
    },
  });
}

/**
 * 批量填写还价-确定 - 线上
 * @async
 * @function saveCounterOffersBulk
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveCounterOffersBulk(params) {
  const {
    organizationId,
    rfxHeaderId,
    filterParams = {},
    customizeUnitCode,
    ...otherParams
  } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/batch-all`, {
    method: 'POST',
    body: otherParams,
    query: { rfxHeaderId, customizeUnitCode, ...filterParams },
  });
}

/**
 * 批量填写还价-确定 - 线下
 * @async
 * @function saveCounterOffersOffline
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveCounterOffersOffline(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/batch-offline`, {
    method: 'POST',
    body: otherParams,
    query: { rfxHeaderId },
  });
}

/**
 * 线下议价 - 保存
 * @async
 * @function handleSaveAllOffline
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function handleSaveAllOffline(params) {
  const {
    organizationId,
    rfxHeaderId,
    customizeUnitCode,
    filterParams = {},
    ...otherParams
  } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/save-offline-spread`, {
    method: 'POST',
    query: { rfxHeaderId, customizeUnitCode, ...filterParams },
    body: { rfxQuotationLineLists: otherParams.rfxQuotationLines, rfxHeaderId },
  });
}

/**
 * 线上议价 - 保存
 * @async
 * @function handleSaveAllOnline
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function handleSaveAllOnline(params) {
  const {
    organizationId,
    rfxHeaderId,
    customizeUnitCode,
    filterParams = {},
    ...otherParams
  } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/save-online-spread`, {
    method: 'POST',
    body: { rfxQuotationLineLists: otherParams.rfxQuotationLines, rfxHeaderId },
    query: { rfxHeaderId, customizeUnitCode, ...filterParams },
  });
}

/**
 * 议价 - 发布
 * @async
 * @function handleStartAll
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function handleStartAll(params) {
  const {
    organizationId,
    bargainEndDate,
    rfxHeaderId,
    bargainRemark,
    customizeUnitCode,
    filterParams = {},
    rfxQuotationLines,
    otherObj = {}, // 适配额外增加的参数，为了不影响二开，不取剩余参数
  } = params;
  const bargainDTO = {
    rfxHeaderId,
    rfxQuotationLineLists: rfxQuotationLines,
    ...(otherObj || {}),
    bargainRemark: bargainRemark || otherObj?.bargainRemark, // 兼容二开
    bargainEndDate: bargainEndDate || otherObj?.bargainEndDate, // 兼容二开
  };
  return request(`${prefix}/${organizationId}/rfx/bargain/start`, {
    method: 'POST',
    query: { customizeUnitCode, ...filterParams },
    body: bargainDTO,
  });
}

/**
 * 议价 - 发布
 * @async
 * @function handleStartAll
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function handleStartAllNew(params) {
  const { organizationId, queryParams = {}, ...others } = params || {};

  return request(`${prefix}/${organizationId}/rfx/bargain/start`, {
    method: 'POST',
    query: queryParams,
    body: others,
  });
}

/**
 * 议价 - 结束
 * @async
 * @function bargainOnEnd
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function bargainOnEnd(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/end`, {
    method: 'POST',
    query: { rfxHeaderId },
  });
}

/**
 * 议价 - 完成
 * @async
 * @function bargainOnFinished
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function bargainOnFinished(params) {
  const {
    organizationId,
    rfxHeaderId,
    filterParams = {},
    customizeUnitCode,
    ...otherParams
  } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/finish-spread`, {
    method: 'POST',
    query: { rfxHeaderId, customizeUnitCode, ...filterParams },
    body: { rfxQuotationLineLists: otherParams.rfxQuotationLines, rfxHeaderId },
  });
}

/**
 * 上传附件，传递uuid
 * @async
 * @function uploadAttachement
 * @param {object} params - uuid
 */
export async function uploadAttachement(params) {
  const { organizationId, param } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/update-bargain-attachment`, {
    method: 'POST',
    body: param,
  });
}

// 发起议价-分标段-批量
export async function barginSectionBatchStart(params = {}) {
  const {
    organizationId,
    bargainEndDate,
    customizeUnitCode,
    filterParams = {},
    ...others
  } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/section/start`, {
    method: 'POST',
    body: others,
    query: { bargainEndDate, customizeUnitCode, ...filterParams },
  });
}

// 发起议价-分标段-批量
export async function barginSectionBatchEnd(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/section/end`, {
    method: 'POST',
    body: others,
  });
}

// 线下议价-完成-分标段-批量
export async function offlineSectionBatchFinish(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/section/finish`, {
    method: 'POST',
    body: others,
  });
}

// 单据样式定制议价审批查询供应商
export async function fetchSupplierApprovalBargainPrice(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/approval/bargain/suppliers`, {
    method: 'POST',
    body: otherParams,
  });
}

export async function fetchBargainOnlineAllTableCount(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/query-bargain-quotation_count`, {
    method: 'POST',
    body: otherParams,
  });
}
