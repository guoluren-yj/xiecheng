import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
// import { SRM_MALL } from '_utils/config';
// const SRM_MALL = '/smal-21419';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 当前公司值集查询
 * @async
 * @function fetchCurrentCompanyValue
 * @returns {object} fetch Promise
 */
export async function fetchCurrentCompanyValue(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

// 头信息查询
export async function fetcthProtocolData(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreements`, {
    method: 'GET',
    query: param,
  });
}

// 商品明细查询
export async function fetcthProductDetail(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-details`, {
    method: 'GET',
    query: param,
  });
}

// 头信息删除
export async function deleteHeadData(params) {
  return request(`/sagm/v1/${organizationId}/agreements`, {
    method: 'DELETE',
    body: params,
  });
}

// 行信息删除
export async function delLineData(params) {
  return request(`/sagm/v1/${organizationId}/agreement-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存协议
export async function saveAgreement(params) {
  return request(`/sagm/v1/${organizationId}/agreements`, {
    method: 'POST',
    body: params,
  });
}

// 提交协议
export async function submitAgreement(params) {
  return request(`/sagm/v1/${organizationId}/agreements/submit`, {
    method: 'POST',
    body: params,
  });
}

// 行信息查询
export async function fetcthProtocolLineData(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-lines`, {
    method: 'GET',
    query: param,
  });
}

// 查询状态值集
export async function fetchCodes(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/value`, {
    method: 'GET',
    query: params,
  });
}

// 批量查询值集
export async function fetchBatchCodes(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/batch`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchQuoteData(params) {
  const { quoteDataType, ...other } = params;
  const param = parseParameters(other);
  const url =
    quoteDataType === 'price'
      ? `/sagm/v1/${organizationId}/price-lib-matchs/agreement-list`
      : `/sagm/v1/${organizationId}/price-lib-matchs/agreement-list`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

// 行上创建商品
export async function createProduct(params) {
  const { cid, agreementSkuDTO } = params;
  return request(`/sagm/v1/${organizationId}/agreement-lines/batch-create-skus/${cid}`, {
    method: 'POST',
    body: agreementSkuDTO,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

// 查已添加商品
export async function fetchExitProductList(params) {
  const { agreementLineId, ...other } = params;
  const param = parseParameters(other);
  return request(`/sagm/v1/${organizationId}/agreement-details/${agreementLineId}`, {
    method: 'GET',
    query: param,
  });
}

// 查未添加商品
export async function fetchNoExitProductList(params) {
  const { agreementLineId, ...other } = params;
  const param = parseParameters(other);
  return request(`/sagm/v1/${organizationId}/agreement-details/${agreementLineId}/off-line`, {
    method: 'GET',
    query: param,
  });
}

// 穿梭添加
export async function lineAddProduct(params) {
  const { agreementLineId, agreementDetailsDTOS } = params;
  return request(`/sagm/v1/${organizationId}/agreement-details/${agreementLineId}`, {
    method: 'POST',
    body: agreementDetailsDTOS,
  });
}

// 穿梭框删除
export async function lineDeleteProduct(params) {
  const { agreementDetails } = params;
  return request(`/sagm/v1/${organizationId}/agreement-details`, {
    method: 'DELETE',
    body: agreementDetails,
  });
}

/**
 * 查询阶梯价格
 */
export async function fetchPriceList(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-ladders/${param.agreementLineId}`, {
    method: 'GET',
    query: param,
  });
}

// 更换商品
export async function changeProduct(params) {
  return request(`/sagm/v1/${organizationId}/agreement-details/change`, {
    method: 'POST',
    body: params,
  });
}

// 维护可售数量
export async function batchStockQuantity(params) {
  return request(`/sagm/v1/${organizationId}/agreement-details/agreement-details-stock`, {
    method: 'POST',
    body: params,
  });
}

// 历史版本查询列表
export async function fetchHistoryVerData(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-hiss`, {
    method: 'GET',
    query: param,
  });
}

// 历史版本行查询
export async function fetchHistoryVerLines(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-line-hiss`, {
    method: 'GET',
    query: param,
  });
}

// 历史版本行商品查询
export async function fetchHisVerLineProduct(params) {
  const param = parseParameters(params);
  return request(`/sagm/v1/${organizationId}/agreement-detail-hiss/${params.agreementLineId}`, {
    method: 'GET',
    query: param,
  });
}
