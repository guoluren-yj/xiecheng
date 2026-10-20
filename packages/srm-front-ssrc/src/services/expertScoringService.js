/**
 * service - 寻源平台/专家评分
 * @date: 2019-07-02
 * @version: 1.0.0
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

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
 * 专家评分中入口页面API
 * @async
 * @function fetchScoring
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchScoring(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/evaluate-scores/scoring-list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 专家历史评分入口页面API
 * @async
 * @function fetchScoringHistory
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchScoringHistory(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/evaluate-scores/scored-list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 专家评分-评分所有供应商查询API  ==> 进入专家详情页api
 * @async
 * @function fetchScoringSupplier
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchScoringSupplier(params) {
  const { sourceHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/evaluate-scores/${sourceHeaderId}/suppliers`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 专家评分--分标段/不分标段-评分要素查询
 * @async
 * @function fetchScoreElementList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoreElementList(params) {
  return request(
    `${prefix}/${organizationId}/evaluate-scores/${params.sourceHeaderId}/${params.sourceFrom}/score-indic/indicate`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 供应商投标物料行查询API  ===> 展开物料行信息
 * @async
 * @function fetchScoringQuotation
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchScoringQuotation(params) {
  const { quotationHeaderId, supplierId, sectionId, sourceFrom, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/evaluate-scores/${quotationHeaderId}/items`, {
    method: 'GET',
    query: { ...param, supplierId, sectionId, sourceFrom },
  });
}

/**
 * 专家评分单头查询API ===> 右弹窗 详情头信息
 * @async
 * @function fetchScoringHeader
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchScoringHeader(params) {
  const { quotationHeaderId, supplierId, sourceFrom, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/evaluate-scores/${quotationHeaderId}/${sourceFrom}/header`,
    {
      method: 'GET',
      query: { ...param, supplierId },
    }
  );
}

/**
 * 专家评分要素查询API  ===> 专家评分右弹窗api 详情行信息  要素
 * @async
 * @function fetchScoringIndic
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchScoringIndic(params) {
  const { sourceHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/evaluate-scores/${sourceHeaderId}/score-indic`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 专家评分要素保存API
 * @async
 * @function saveScoreing
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function saveScoreing(params) {
  const { sourceHeaderId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/evaluate-scores/${sourceHeaderId}/score-indic`, {
    method: 'POST',
    body: { ...otherParams },
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 专家评分要素提交API
 * @async
 * @function submitScoreing
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function submitScoreing(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-scores/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

/**
 * 专家评分-标段-评分汇总保存
 * @async
 * @function saveElementScoreing
 * @returns {object} fetch Promise
 */
export async function saveElementScoreing(params) {
  const { expertUserId, sourceHeaderId, sectionFlag, sourceFrom, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-scores/${sourceHeaderId}/${sourceFrom}/score-indic/indicate`,
    {
      method: 'POST',
      body: { ...otherParams, expertUserId, sectionFlag },
    }
  );
}

/**
 * 专家评分-标段/非标段-评分汇总提交
 * @async
 * @function submitElementScoreing
 * @returns {object} fetch Promise
 */
export async function submitElementScoreing(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-scores/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

/**
 *
 *  查询澄清管理列表
 * @export
 * @param {*} params
 * @returns
 */
export function fetchClarifyNotifyDataList(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/clarify-notify/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/list`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}
/**
 *
 *  查询专家提疑头信息
 * @export
 * @param {*} params
 * @returns
 */
export function queryClarifyNotifyHeader(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, currentFlag } = params;
  return request(
    `${prefix}/${organizationId}/clarify-notify/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}`,
    {
      method: 'GET',
      query: { currentFlag },
    }
  );
}
/**
 *
 *  查询寻源单下所有问题行
 * @export
 * @param {*} params
 * @returns
 */
export function queryClarifyNotifyQuestionList(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/clarify-issue/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}
/**
 *
 *  创建评审澄清问题表
 * @export
 * @param {*} params
 * @returns
 */
const issueFrom = 'EXPERT';
export function createClarifyNotifyQuestionList(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, datas } = params;
  return request(
    `${prefix}/${organizationId}/clarify-issue/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/${issueFrom}`,
    {
      method: 'POST',
      body: datas,
    }
  );
}
/**
 *
 *  查询我提出的问题列表
 * @export
 * @param {*} params
 * @returns
 */
export function queryMyQuestionList(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/clarify-issue/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/my-issue`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}
/**
 *
 *  提交问题表
 * @export
 * @param {*} params
 * @returns
 */
export function submitClarifyNotifyQuestionList(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, datas } = params;
  return request(
    `${prefix}/${organizationId}/clarify-issue/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/submit`,
    {
      method: 'POST',
      body: datas,
    }
  );
}

/**
 * 删除问题行
 * @async
 * @function deleteQuestionRows
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function deleteQuestionRows(params) {
  const { deleteIds } = params;
  return request(`${prefix}/${organizationId}/clarify-issue`, {
    method: 'DELETE',
    body: deleteIds,
  });
}
/**
 *
 *  查询澄清单详情头信息
 * @export
 * @param {*} params
 * @returns
 */
export function queryClarifyNotifyDetailHeader(params) {
  const { clarifyNotifyId } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/${clarifyNotifyId}`, {
    method: 'GET',
  });
}

/**
 *
 *  查询澄清单详情列表
 * @export
 * @param {*} params
 * @returns
 */
export function queryClarifyNotifyDetailList(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/clarify-issue`, {
    method: 'GET',
    query: { ...param },
  });
}

// 专家评分－供应商物品相关信息
export function fetchExpertScoreItemLines(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/round-headers/round-quotation`, {
    method: 'POST',
    query: param,
    body: param,
  });
}

// 专家评分－新开标-发起多轮报价
export function beginOpenedRoundQuotation(params) {
  const { sourceHeaderId = null, query, ...others } = params || {};
  return request(
    `${prefix}/${organizationId}/round-headers/${sourceHeaderId}/opened/begin-round-quotation`,
    {
      method: 'POST',
      query,
      body: others,
    }
  );
}

// 专家评分－发起多轮报价
export function beginRoundQuotation(params) {
  const { sourceHeaderId = null, query, ...others } = params || {};
  return request(
    `${prefix}/${organizationId}/round-headers/${sourceHeaderId}/begin-round-quotation`,
    {
      method: 'POST',
      query,
      body: others,
    }
  );
}

// 多标段发起多轮报价
export function sectionBeginRoundQuotation(params) {
  const { projectLineSectionList, ...others } = params;
  return request(`${prefix}/${organizationId}/round-headers/section/begin-round-quotation`, {
    method: 'POST',
    query: others,
    body: projectLineSectionList,
  });
}

// 专家评分－开始评分
export function roundBeginScore(params) {
  const { sourceHeaderId = null } = params;
  return request(`${prefix}/${organizationId}/round-headers/${sourceHeaderId}/round-begin-score`, {
    method: 'POST',
  });
}

// 专家评分 评分头信息
export function fetchExpertHeaderInfo(params = {}) {
  const others = parseParameters(params);
  return request(`${prefix}/${organizationId}/round-headers/round-quotation`, {
    method: 'GET',
    query: others,
  });
}

// 专家评分详情
export function fetchExpertScoreDetails(params = {}) {
  const { sourceHeaderId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/${sourceHeaderId}/score/detail`, {
    method: 'GET',
    query: others,
  });
}

// 专家评分-价格澄清列表-报价数据列表 - /v1/{organizationId}/clarify-notify/price/{clarifyNotifyId}/reply-detail/list
export function fetchPriceClarificationQuoteLines(params = {}) {
  const { clarifyNotifyId } = params;
  return request(
    `${prefix}/${organizationId}/clarify-notify/price/${clarifyNotifyId}/reply-detail/list`,
    {
      method: 'get',
    }
  );
}

// 专家评分-价格澄清-详情-save
export function fetchPriceClarificationDetailSave(params = {}) {
  const { customizeUnitCode = null, ...other } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/price/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: other,
  });
}

// 专家评分-价格澄清-详情submit
export function fetchPriceClarificationDetailSubmit(params = {}) {
  const { customizeUnitCode = null, ...other } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/price/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: other,
  });
}

// 专家评分-价格澄清-详情-cancel /v1/{organizationId}/clarify-notify/price/cancel/{clarifyNotifyId}
export function fetchPriceClarificationDetailCancel(params = {}) {
  const { clarifyNotifyId } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/price/cancel/${clarifyNotifyId}`, {
    method: 'DELETE',
    // query: others,
  });
}

// 专家评分-价格澄清-详情-供应商列表
export function fetchPriceClarificationDetailSupplierList(params = {}) {
  const { sourceHeaderId, ...others } = params;
  return request(
    `${prefix}/${organizationId}/clarify-notify/price/${sourceHeaderId}/supplier-lines/list`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 专家评分-价格澄清-详情-供应商-物料报价列表 /v1/{organizationId}/clarify-notify/price/supplier/{quotationHeaderId}/quotation-lines
export function fetchPriceClarificationDetailSupplierItemList(params = {}) {
  const { quotationHeaderId, ...others } = params;
  return request(
    `${prefix}/${organizationId}/clarify-notify/price/supplier/${quotationHeaderId}/quotation-lines`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 专家评分-价格澄清-详情-结束澄清 /v1/{organizationId}/clarify-notify/price/finish/{clarifyNotifyId}
export function finishedPriceClarification(params = {}) {
  const { clarifyNotifyId } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/price/finish/${clarifyNotifyId}`, {
    method: 'POST',
    // query: others,
  });
}

// 专家评分-评分-校验价格澄清按钮 - /v1/{organizationId}/clarify-notify/price/check/{sourceHeaderId}
export function verifyPriceClarificationButton(params = {}) {
  const { sourceHeaderId, ...others } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/price/check/${sourceHeaderId}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 供应商维度 - 初步评审
 * @async
 * @function saveScoreing
 * @param {Object} params
 */
export async function queryReviewSupplier(params = {}) {
  const { sourceHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/evaluate-scores/${sourceHeaderId}/review/suppliers`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 专家评分要素保存API - 初步评审
 * @async
 * @function saveScoreing
 * @param {Object} params - header + line
 * @returns {Object} fetch Promise
 */
export async function saveReviewScoring(params) {
  const { sourceHeaderId, customizeUnitCode, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-scores/${sourceHeaderId}/review/score-indic`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: { ...otherParams },
    }
  );
}

/**
 * 头保存评分要素 - 初步评审
 * @async
 * @function saveScoreing
 * @param {Object} params - 要素参数
 * @returns {Object} fetch Promise
 */
export async function saveReviewElementScoring(params) {
  const {
    expertUserId,
    sourceHeaderId,
    sectionFlag,
    sourceFrom,
    customizeUnitCode,
    ...otherParams
  } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-scores/${sourceHeaderId}/${sourceFrom}/review/indicate`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: { ...otherParams, expertUserId, sectionFlag },
    }
  );
}

/**
 * 头提交评分 - 初步评审
 * @async
 * @function saveScoreing
 * @param {Object} params - body参数
 * @returns {Object} fetch Promise
 */
export async function submitReviewScoring(params) {
  const { customizeUnitCode, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/evaluate-scores/review/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...otherParams },
  });
}

/**
 * 专家评分转发
 * @param {*} params ids
 */
export async function transfer(params) {
  return request(`${prefix}/${organizationId}/evaluate-experts/deliver`, {
    method: 'POST',
    body: { ...params },
  });
}

// RF头查询
export async function rfFetchHeader(params) {
  const { rfHeaderId } = params;
  return request(`${prefix}/${organizationId}/rf/score/${rfHeaderId}`, {
    method: 'GET',
  });
}

// 专家评分 评审澄清-供应商通用查询
export async function fetchSupplierInfo(params = {}) {
  return request(`${prefix}/${organizationId}/clarify-issue/supplier-info`, {
    method: 'GET',
    query: params,
  });
}
