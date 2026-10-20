/**
 * service - 寻源服务/招标事件查询
 * @date: 2019-7-11
 * @version: 1.0.0
 * @author: chenjing <jing.chen05@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 招标事件入口页面数据查询
 * @async
 * @function fetchDataList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchDataList(params) {
  const { organizationId, path, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const url = `${prefix}/${organizationId}/bid/list/all`;
  return request(url, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 招标事件查询明细页面头
 * @async
 * @function fetchBasicInfoDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchBasicInfoDetail(params) {
  const { organizationId, bidHeaderId, path } = params;
  let url;
  if (path.includes('quotation-controller')) {
    url = `${prefix}/${organizationId}/bid/${bidHeaderId}?allSelectFlag=1`;
  } else {
    url = `${prefix}/${organizationId}/bid/${bidHeaderId}`;
  }
  return request(url, {
    method: 'GET',
  });
}

/**
 * 招标事件查询专家-数据查询
 * @async
 * @function fetchExpertsInfo
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchExpertsInfo(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/evaluate-experts`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 招标事件查询-评分要素数据查询
 * @async
 * @function fetchScorElementsData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScorElementsData(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 招标事件查询供应商列表-数据查询
 * @async
 * @function fetchSupplierListData
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchSupplierListData(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/suppliers/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 招标事件查询物品明细-数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchItemLine(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/items/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 供应商查看弹窗list查询
 * @async
 * @function fetchSupplierRecord
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSupplierRecord(params) {
  const { organizationId, queryFlag, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/item-sup-assign`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 招标事件查询-评分要素查询分配专家
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchEvaluateIndicAssign(params) {
  const { organizationId, evaluateIndicId, evaluateIndicCategory } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-assigns`, {
    method: 'GET',
    query: { evaluateIndicId, evaluateIndicCategory },
  });
}

/**
 * 行信息分标段-数据查询
 * @async
 * @function fetchLinePackDetail
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchLinePackDetail(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/evaluate`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 行信息不分标段-数据查询
 * @async
 * @function fetchLineNoneDetail
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchLineNoneDetail(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/items/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 招标事件查询--单独查询物料行
 * @async
 * @function fetchAloneItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchAloneItemLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/quotation/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 招标事件查询--区分标段单独查询物料行
 * @async
 * @function fetchCalibrationQuotation
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchCalibrationQuotation(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/quotation/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 招标维护-招标小组
 */
export async function fetchBidMembers(params) {
  const { organizationId, bidHeaderId } = params;
  return request(`${prefix}/${organizationId}/bid/members/${bidHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 评分要素定义-数据查询
 * @async
 * @function fetchScoringElementData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoringElementData(params) {
  return request(
    `${prefix}/${params.organizationId}/prequal/${params.prequalHeaderId}/score-indic`,
    {
      method: 'GET',
      query: params.templatePurpose,
    }
  );
}
