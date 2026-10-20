/**
 * supplierQuotation.js - 供应商报价 Modal
 * @date: 2019-01-09
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询竞价排名
 * @param {Object} params - 报价单头查询参数
 */
export async function biddingRank(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/rank`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 查询个人报价历史
 * @param {Object} params - 报价单头查询参数
 */
export async function biddingHistory(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/history`, {
    method: 'GET',
    query: { ...params },
  });
}

// 报价历史查询
export async function quotationHistory(params = {}) {
  const newParams = parseParameters(params);
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/supplier/items/quotation/lines/record`, {
    method: 'GET',
    query: { ...newParams },
  });
}

/**
 * 查询报价单头信息
 * @param {Object} params - 报价单头查询参数
 */
export async function queryQuotationHeader(params) {
  const { quotationHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/${quotationHeaderId}/header`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 保存报价明细页面头附件
 * @param {Array} params - 保存的头附件信息对象
 */
export async function saveHeaderAttachment(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/header/attachment`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询报价单行信息
 * @param {Object} params - 报价单行查询参数
 */
export async function queryQuotationLines(params) {
  const { quotationHeaderId, ...query } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/${quotationHeaderId}/lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询报价单行信息
 * @param {Object} params - 报价单行查询参数
 */
export async function queryBiddingQuotationLine(params) {
  const { quotationHeaderId, ...query } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/${quotationHeaderId}/lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询单个物品所有报价信息
 * @param {Object} params - 查询所有报价查询参数
 */
export async function queryQuotationLineDetail(params) {
  const { quotationLineId, ...query } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/${quotationLineId}/records`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询单个物品多轮报价历史
 * @param {Object} params - 查询所有报价查询参数
 */
export async function queryRoundQuotationLineDetail(params) {
  // const { quotationLineId, ...query } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/round-quotation-lines`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存报价明细页面行信息
 * @param {Array} params - 保存行信息列表
 */
export async function saveQuotationLines(paramsData = {}) {
  const { customizeUnitCode = '', ...otherParams } = paramsData;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/update/quotation-header`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...otherParams },
  });
}

/**
 * 提交引用参考价格请求
 * @param {Array} params - 报价头id
 */
export async function submitReferencePrice(params) {
  const { quotationHeaderId } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/${quotationHeaderId}/reference`, {
    method: 'POST',
  });
}

/**
 * 提交报价明细页面行信息
 * @param {Array} params - 提交行信息列表
 */
export async function submitQuotationLines(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 提交报价提交校验
 * @param {Array} params
 */
export async function validateQuotationSubmit(params = {}) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/submit-validate`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 供应商行收回报价
 * @param {Array} params - 行收回列表
 */
export async function backQuotationLines(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/lines/takeback`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchFeedBackBarginHistory
 * 还比价历史数据
 */
export async function fetchLadderList(params) {
  const { quotationLineId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * 保存前校验阶梯报价
 * @param {Array} params - 保存行信息列表
 */
export async function validateLadderQuotation(params) {
  const { customizeUnitCode = '', ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/supplier/ladder-quotation-validate`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: otherParams,
  });
}

/**
 * 保存阶梯报价
 * @param {Array} params - 保存行信息列表
 */
export async function saveLadderList(params) {
  const { quotationLineId, customizeUnitCode, query = {}, ...otherParams } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
    {
      method: 'POST',
      query: {
        customizeUnitCode,
        ...query,
      },
      body: otherParams.params,
    }
  );
}

/**
 * 阶梯报价 - 批量删除
 * @async
 * @function deleteLadderQuot
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteLadderQuot(params = {}) {
  const { query = {} } = params || {};
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${params.quotationLineId}/ladder-quotation`,
    {
      method: 'DELETE',
      query: {
        ...query,
      },
      body: params.remoteDelete,
    }
  );
}

/**
 * 供应商报价-报价明细查询
 * @async
 * @function fetchQuotationDetailData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchQuotationDetailData(params) {
  const { rfxHeaderId, quotationHeaderId, rfxLineItemId } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/${quotationHeaderId}/${rfxLineItemId}/supQuotationDetails`,
    {
      method: 'GET',
      query: { sourceForm: params.sourceForm },
    }
  );
}

/**
 * 保存报价明细
 * @param {Array} params - 保存报价明细信息列表
 */
export async function saveQuotationDetailData(params) {
  const { ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/saveOrUpdate`, {
    method: 'POST',
    body: otherParams.paramsArray,
  });
}

/**
 * 删除报价模板明细
 */
export async function deleteQuotationDetailData(params) {
  const { rfxHeaderId, quotationLineId, newExistRows } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/${quotationLineId}/supQuotationDetails/batchDelete`,
    {
      method: 'DELETE',
      body: newExistRows,
    }
  );
}
