/**
 * supplierBid.js - 供应商投标
 * @date: 2019-05-20
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSRC}/v1`;

/**
 * 供应商投标入口数据查询
 * @async
 * @function fetchEntranceList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchBidList(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${params.organizationId}/bid/quotation/list`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 投标查询入口数据查询
 * @async
 * @function fetchEntranceList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchBidQueryList(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${params.organizationId}/bid/quotation/all/list`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 查寻投标单头信息
 * @param {Object} params - 投标单头查询参数
 */
export async function queryQuotationHeader(params) {
  const { quotationHeaderId, ...query } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/${quotationHeaderId}/header`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存投标明细页面头附件
 * @param {Array} params - 保存的头附件信息对象
 */
export async function saveHeaderAttachment(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/header/attachment`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查寻投标行信息
 * @param {Object} params - 投标所有行查询参数 api变更 lines--> all/lines
 */
export async function queryQuotationLines(params) {
  const { quotationHeaderId, ...query } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/${quotationHeaderId}/all/lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 查寻投标单行信息
 * @param {Object} params - 投标单行查询参数
 */
export async function queryBiddingQuotationLine(params) {
  const { quotationLineId, ...query } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/${quotationLineId}/line`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询单个物品所有投标信息
 * @param {Object} params - 查询所有投标查询参数
 */
export async function queryQuotationLineDetail(params) {
  const { quotationLineId, ...query } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/${quotationLineId}/records`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存投标明细页面行信息
 * @param {Array} params - 保存行信息列表
 */
export async function saveQuotationLines(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/line/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 保存投标明细页面行信息
 * @param {Array} params - 保存行信息列表
 */
export async function saveAllBid(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 提交投标明细页面行信息
 * @param {Array} params - 保存行信息列表
 */
export async function submitAllBid(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/all/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}
/**
 * 提交投标明细页面行信息
 * @param {Array} params - 保存行信息列表
 */
export async function submitLinesBid(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/line/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 收回投标明细页面行信息
 * @param {Array} params - 保存行信息列表
 */
export async function quotationTakeback(params) {
  const { quotationHeader } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/takeback`, {
    method: 'POST',
    body: { ...quotationHeader },
  });
}
/**
 * 提交投标明细页面行信息
 * @param {Array} params - 提交行信息列表
 */
export async function submitQuotationLines(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/submit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 供应商行收回投标
 * @param {Array} params - 行收回列表
 */
export async function backQuotationLines(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/quotation/lines/takeback`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 供应商招标单头数据查询
 * @async
 * @function fetchHeadDataList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchHeadDataList(params) {
  const { quotationHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${params.organizationId}/bid/supplier/${params.bidHeaderId}/header`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 供应商招标物料行数据查询-- api 变更 items-lines
 * @async
 * @function fetchItemsDataList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchItemsDataList(params) {
  const { bidHeaderId, routerParams, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/supplier/${bidHeaderId}/lines`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 供应商招标-参与
 * @async
 * @function fatchParticipate
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fatchParticipate(params) {
  const { customizeUnitCode } = params;
  return request(`${prefix}/${params.organizationId}/bid/participate`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: params.bidHeader,
  });
}

/**
 * 供应商招标-放弃
 * @async
 * @function fatchAbandon
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fatchAbandon(params) {
  return request(`${prefix}/${params.organizationId}/bid/abandon`, {
    method: 'POST',
    body: params.bidHeader,
  });
}

/**
 * 投标行-标段放弃
 * @async
 * @function fatchAbandon
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function abandonQuotationLine(params) {
  return request(
    `${prefix}/${params.organizationId}/bid/quotation/line/${params.quotationLineId}/abandon`,
    {
      method: 'PUT',
    }
  );
}

/**
 * 投标行-标段撤销放弃
 * @async
 * @function fatchAbandon
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function abandonRevokeQuotationLine(params) {
  return request(
    `${prefix}/${params.organizationId}/bid/quotation/line/${params.quotationLineId}/revoke_abandon`,
    {
      method: 'PUT',
    }
  );
}
/**
 * 物品明细 - 批量删除
 * @async
 * @function deleteItemLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteItemLines(params) {
  return request(`${prefix}/${params.organizationId}/bid/items/items`, {
    method: 'DELETE',
    body: params.newParameters,
  });
}
/**
 * 预审申请数据请求接口
 */
export async function fetchPretrialApplication(params) {
  const { bidHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/supplier/${bidHeaderId}/prequal`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 预审申请数据保存接口
 */
export async function savePretrialApplication(params) {
  const { supplierCompanyId, supplierPrequalDTO, customizeUnitCode = null } = params;
  return request(`${prefix}/${organizationId}/rfx/prequel/save`, {
    method: 'POST',
    body: supplierPrequalDTO,
    query: { supplierCompanyId, customizeUnitCode },
  });
}
/**
 * 预审申请数据提交接口
 */
export async function submitPretrialApplication(params) {
  const { supplierCompanyId, supplierPrequalDTO, customizeUnitCode = null } = params;
  return request(`${prefix}/${organizationId}/rfx/prequel/submit`, {
    method: 'POST',
    body: supplierPrequalDTO,
    query: { supplierCompanyId, customizeUnitCode },
  });
}

/**
 * 问题维护查询
 * @async
 * @function fetchQuestionMaintain
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchQuestionMaintain(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/issue`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查看问题
 * @async
 * @function fetchQuestionsubmitted
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchQuestionsubmitted(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/issue/submitted`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查看澄清函
 * @async
 * @function fetchClarificationList
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchClarificationList(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify/released`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 评审澄清维护
 * @async
 * @function fetchReviewList
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchReviewList(params) {
  const param = parseParameters(params);
  const { quotationHeaderId, bidHeaderId, sourceFrom } = params;
  return request(
    `${prefix}/${organizationId}/clarify-notify/${bidHeaderId}/${sourceFrom}/${quotationHeaderId}/list`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 问题头查询
 * @async
 * @function fetchQuestionHeader
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchQuestionHeader(params) {
  return request(`${prefix}/${organizationId}/issue/issue-header/${params.issueHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 问题行查询
 * @async
 * @function fetchQuestionRows
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchQuestionRows(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/issue/issue-line`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 删除问题行
 * @async
 * @function deleteQuestionRows
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function deleteQuestionRows(params) {
  return request(`${prefix}/${organizationId}/issue/issue-line/${params.issueLineId}/delete`, {
    method: 'DELETE',
    body: params.issueLineIds,
  });
}

/**
 * 删除问题
 * @async
 * @function deleteQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function deleteQuestion(params) {
  return request(`${prefix}/${organizationId}/issue/${params.issueHeaderId}/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 保存问题
 * @async
 * @function saveQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function saveQuestion(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/issue/save`, {
    method: 'POST',
    body: otherParams,
    query: { customizeUnitCode },
  });
}

/**
 * 提交问题
 * @async
 * @function submitQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function submitQuestion(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/issue/submit`, {
    method: 'POST',
    body: otherParams,
    query: { customizeUnitCode },
  });
}

/**
 * 澄清函详情
 * @async
 * @function fetchClarificationDetails
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchClarificationDetails(params) {
  return request(`${prefix}/${organizationId}/clarify/${params.clarifyId}`, {
    method: 'GET',
  });
}

/**
 * 澄清函引用问题
 * @async
 * @function fetchClarificationQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchClarificationQuestion(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify/refer-issue`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 创建评标问题头查询
 * @async
 * @function fetchNoticeHeader
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchNoticeHeader(params) {
  const { clarifyNotifyId } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/${clarifyNotifyId}`, {
    method: 'GET',
  });
}

/**
 * 问题行查询
 * @async
 * @function fetchNoticeRows
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchNoticeRows(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify-issue`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存澄清通知回答问题行信息
 * @async
 * @function saveAnswerQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function saveAnswerQuestion(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, issueFrom, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/clarify-issue/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/${issueFrom}`,
    {
      method: 'POST',
      body: otherParams.lineNoticeSaveDTOS,
    }
  );
}
/**
 * 保存澄清通知回答问题头信息
 * @async
 * @function saveNoticeQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function saveNoticeQuestion(params) {
  return request(`${prefix}/${organizationId}/clarify-notify/supplier/save`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 提交澄清通知回答问题头信息
 * @async
 * @function submitNoticeQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function submitNoticeQuestion(params) {
  return request(`${prefix}/${organizationId}/clarify-notify/supplier/submit`, {
    method: 'POST',
    body: params,
  });
}

/**
 *  供应商物品行报价明细查询
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchItemSupplierLineQuotationDetail(params) {
  const { rfxHeaderId, quotationHeaderId, rfxLineItemId, sourceFrom } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/${rfxHeaderId}/${quotationHeaderId}/${rfxLineItemId}/supQuotationDetails`,
    {
      method: 'GET',
      query: { sourceFrom },
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
/**
 * 保存投标,阅读事项说明标识
 * @async
 */
export async function saveConfirmMatter(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/confirm-matter`, {
    method: 'POST',
    body: params,
  });
}
