import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

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

// 查询状态值集
export async function fetchCodes(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/value`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取供应商协议管理列表
 * @async
 * @function fetchAgreementList
 * @returns {object} fetch Promise
 */
export async function fetchAgreementList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agreements`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询操作记录
 * @async
 * @function fetchOperateRecord
 * @returns {object} fetch Promise
 */
export async function fetchOperateRecord(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-historys`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询基本信息
 * @async
 * @function fetchSingleAgreement
 * @returns {object} fetch Promise
 */
export async function fetchSingleAgreement(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agreements/${params.agreementId}`, {
    method: 'GET',
  });
}

export async function createAgreement(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agreements`, {
    method: 'POST',
    body: params,
  });
}

// 提交协议
export async function submitAgreement(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agreements/status-commit`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchClassify() {
  return request(`${SRM_MALL}/v1/${organizationId}/category/getTreeWithThreeList`, {
    method: 'GET',
  });
}

export async function fetchClassifyLines(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-liness`, {
    method: 'GET',
    query: param,
  });
}

// 新增分类行
export async function addClassifyLine(params) {
  const param = filterNullValueObject(params);
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-liness`, {
    method: 'POST',
    body: param,
  });
}

// 查询sku集合
export async function fetchSkuList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-detailss/sku-list`, {
    method: 'GET',
    query: param,
  });
}

// 查询全部sku
export async function fetchAllSkuList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-detailss`, {
    method: 'GET',
    query: param,
  });
}

// 保存sku集合
export async function saveSkuList(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-detailss`, {
    method: 'POST',
    body: params,
  });
}

// 删除sku
export async function deleteSku(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-detailss`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询商品阶梯价格
export async function fetchPriceList(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-ladders`, {
    method: 'GET',
    query: params,
  });
}

// 删除商品阶梯价格
export async function delPriceList(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-ladders`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存商品阶梯价格
export async function savePriceList(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-agree-ladders`, {
    method: 'POST',
    body: params,
  });
}

// 获取商品
export async function fetchProductList(params) {
  return request(`${SRM_MALL}/v1/lovs/sql/data`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
