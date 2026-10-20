import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

// const userOrgId = getUserOrganizationId();
const organizationId = getCurrentOrganizationId(); // 租户ID
const SRM_AGM = '/sagm';

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
  return request(`${SRM_AGM}/v1/${organizationId}/agreements`, {
    method: 'GET',
    query: param,
  });
}

// 头信息删除
export async function deleteHeadData(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreements`, {
    method: 'DELETE',
    body: params,
  });
}

// 行信息删除
export async function delLineData(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存协议
export async function saveAgreement(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreements`, {
    method: 'POST',
    body: params,
  });
}

// 校验更低物料价格
export async function validateItemPrice(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreements/submit-check`, {
    method: 'POST',
    body: params,
  });
}

// 提交协议
export async function submitAgreement(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreements/submit`, {
    method: 'POST',
    body: params,
  });
}

// 行信息查询
export async function fetcthProtocolLineData(params) {
  const param = parseParameters(params);
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-lines`, {
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

// 查询引用价格库数据
export async function fetchQuoteData(params) {
  const { page, ...others } = params;
  const param = parseParameters({ page });
  const url = `${SRM_AGM}/v1/${organizationId}/price-lib-matchs/agreement-list`;
  return request(url, {
    method: 'POST',
    query: param,
    body: others,
  });
}

// 引用价格库新建协议
export async function getUnitListByMatchIds(params) {
  return request(
    `${SRM_AGM}/v1/${organizationId}/price-lib-matchs/agreement-line?customizeUnitCode=SMAL.AGREEMENT_MANAGEMENT.PRICR_LIB_REVERSE`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 引用价格库创建商品
export async function createSkuByPriceLibs(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreement/price-lib/agreement`, {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 查询操作记录
 */
export async function fetchHistory(params) {
  const param = parseParameters(params);
  const url = `${SRM_AGM}/v1/${organizationId}/agreement-records/${params.agreementId}`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}
// 行上创建商品
export async function createProduct(params) {
  const { cid, agreementSkuDTO } = params;
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-lines/batch-create-skus/${cid}`, {
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
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-details/${agreementLineId}`, {
    method: 'GET',
    query: param,
  });
}

export async function queryCompany() {
  const url = `${SRM_AGM}/v1/${organizationId}/pur-units/edit-tree`;
  return request(url, {
    method: 'GET',
  });
}

export async function fetchUnitList() {
  const url = `${SRM_AGM}/v1/${organizationId}/unit-refs`;
  return request(url, {
    method: 'GET',
    query: { tenantId: organizationId, lovCode: 'SMAL.UNIT' },
  });
}

export async function queryAllCity() {
  const url = `${SRM_MALL}/v1/${organizationId}/mall-regions/regional-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 查未添加商品
export async function fetchNoExitProductList(params) {
  const { agreementLineId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-details/${agreementLineId}/off-line`, {
    method: 'GET',
    query: param,
  });
}

// 穿梭添加
export async function lineAddProduct(params) {
  const { agreementLineId, agreementDetailsDTOS } = params;
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-details/${agreementLineId}`, {
    method: 'POST',
    body: agreementDetailsDTOS,
  });
}

// 穿梭框删除
export async function lineDeleteProduct(params) {
  const { agreementDetails } = params;
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-details`, {
    method: 'DELETE',
    body: agreementDetails,
  });
}

// 公司删除
export async function delCompany(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-assings`, {
    method: 'DELETE',
    body: params,
  });
}

// 区域删除
export async function delRegion(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-regions`, {
    method: 'DELETE',
    body: params,
  });
}

// 终止协议
export async function terminateAgreement(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreements/terminate`, {
    method: 'POST',
    body: params,
  });
}

// 根据物料带出集团目录
export async function fetchGroupCatalog(params) {
  return request(`/smpc/v1/${organizationId}/catalog-mappings/item-ref-catalogs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询阶梯价格
 */
export async function fetchPriceList(params) {
  const param = parseParameters(params);
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-ladders/${param.agreementLineId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 协议变更
 */
export async function changeAgreement(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/agreements/agreements-variation`, {
    method: 'POST',
    body: params,
  });
}

// 历史版本查询列表
export async function fetchHistoryVerData(params) {
  const param = parseParameters(params);
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-hiss`, {
    method: 'GET',
    query: param,
  });
}

// 历史版本行查询
export async function fetchHistoryVerLines(params) {
  const param = parseParameters(params);
  return request(`${SRM_AGM}/v1/${organizationId}/agreement-line-hiss`, {
    method: 'GET',
    query: param,
  });
}

// 历史版本行商品查询
export async function fetchHisVerLineProduct(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_AGM}/v1/${organizationId}/agreement-detail-hiss/${params.agreementLineId}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

// 删除运费行
export async function deleteFreightLine(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/postage-lines/${params.postageLineId}`, {
    method: 'DELETE',
  });
}

// 查询运费
export async function fetchFreight(params) {
  const param = parseParameters(params);
  return request(`${SRM_AGM}/v1/${organizationId}/postages/supplier/${params.supplierTenantId}`, {
    method: 'GET',
    query: param,
  });
}

// 新增运费
export async function addFreight(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/postages/supplier/${params.supplierTenantId}`, {
    method: 'POST',
    body: params.postage,
  });
}

export async function handleFreight(params) {
  return request(`${SRM_AGM}/v1/${organizationId}/postages/supplier/enable`, {
    method: 'POST',
    body: [params],
  });
}

export async function fetchPlatformCategory(params) {
  return request(
    `/smpc/v1/${organizationId}/catalog-mappings/catalog-ref-categories/${params.catalogId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 平台目录数据查询
 * @export
 * @param {object} params 查询目录列表
 * @returns
 */
export async function fetchCatalog(params) {
  const param = parseParameters(params);
  return request(`/smpc/v1/${organizationId}/catalogs`, {
    method: 'GET',
    query: param,
  });
}

// 获取价格规则信息
export async function getPriceInfo(query) {
  return request(`/sagm/v1/${organizationId}/agreement-lines/bench-mark-price`, {
    method: 'GET',
    query,
    responseType: 'text',
  });
}

// 获取商品单位显示配置
export async function getSkuUomConfig() {
  return request(`${SRM_AGM}/v1/${organizationId}/agreement/sku-attr-config`, {
    method: 'GET',
  });
}
