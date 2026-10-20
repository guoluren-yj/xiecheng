/**
 * model 供应商报价
 * @date: 2019-1-8
 * @author: NJQ <jiangqi.nan@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
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
 * 供应商询价入口数据查询
 * @async
 * @function fetchEntranceList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchEntranceList(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${params.organizationId}/rfx/supplier/list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 供应商询价单头数据查询
 * @async
 * @function fetchHeadDataList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchHeadDataList(params) {
  const { rfxHeaderId, switchUrl = 0, ...others } = params;
  let url;
  switch (Number(switchUrl)) {
    case 0: // 供应商
      url = `${prefix}/${organizationId}/rfx/supplier/${rfxHeaderId}/header`;
      break;
    case 2: // 采购方(预定标及预定标工作流)
      url = `${prefix}/${organizationId}/rfx/tender/${rfxHeaderId}/header`;
      break;
    default:
      url = `${prefix}/${organizationId}/rfx/supplier/${rfxHeaderId}/header`;
      break;
  }
  return request(url, {
    method: 'GET',
    query: { ...others, rfxHeaderId },
  });
}

/**
 * 供应商询价物料行数据查询
 * @async
 * @function fetchItemsDataList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchItemsDataList(params) {
  const { rfxHeaderId, switchUrl = 0 } = params;
  let url;
  switch (Number(switchUrl)) {
    case 0: // 供应商
      url = `${prefix}/${organizationId}/rfx/supplier/${rfxHeaderId}/items`;
      break;
    case 1: // 明细页，确认及汇总
      url = `${prefix}/${organizationId}/rfx/bargain`;
      break;
    case 2: // 采购方(预定标及预定标工作流)
      url = `${prefix}/${organizationId}/rfx/tender/${rfxHeaderId}/items`;
      break;
    default:
      url = `${prefix}/${organizationId}/rfx/supplier/${rfxHeaderId}/items`;
      break;
  }
  const param = parseParameters(params);
  delete param.switchUrl;
  return request(url, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 供应商询价-校验参与
 * @async
 * @param {Object} params - 参数
 * @returns {object} fetch Promise
 */
export async function participateWithValidate(params = {}) {
  const { ignoreWeakCheckFlag, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/participate-with-validate`, {
    method: 'POST',
    query: { ignoreWeakCheckFlag },
    body: otherParams,
  });
}

/**
 * 供应商询价-参与
 * @async
 * @function fatchParticipate
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fatchParticipate(params) {
  return request(`${prefix}/${params.organizationId}/rfx/participate`, {
    method: 'POST',
    body: params.rfxHeader,
  });
}

// 供应商询价-参与-批量
export async function batchParticipateSupplier(params = {}) {
  const { organizationId: currentOrganizationId = null, list = null } = params;
  return request(`${prefix}/${currentOrganizationId}/rfx/batch-participate`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 供应商询价-放弃-批量
 * @async
 * @function fatchAbandon
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function supplierAbandonBatch(params = {}) {
  const { organizationId: currentOrganizationId = null, list = null } = params;
  return request(`${prefix}/${currentOrganizationId}/rfx/batch-abandon`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 供应商询价-放弃
 * @async
 * @function fatchAbandon
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fatchAbandon(params) {
  return request(`${prefix}/${params.organizationId}/rfx/abandon`, {
    method: 'POST',
    body: params.rfxHeader,
  });
}

/**
 * 物品明细 - 批量删除
 * @async
 * @function deleteItemLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteItemLines(params) {
  return request(`${prefix}/${params.organizationId}/rfx/items/items`, {
    method: 'DELETE',
    body: params.newParameters,
  });
}

/**
 * fetchFeedBackBarginHistory
 * 还比价历史数据
 */
export async function fetchFeedBackBarginHistory(params) {
  const { quotationLineId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/quotation/${quotationLineId}/records`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 预审申请数据请求接口
 * @deprecated yongxiang
 */
export async function fetchPretrialApplication(params) {
  const { rfxHeaderId, supplierCompanyId, prequalCategory, customizeUnitCode = null } = params;
  return request(`${prefix}/${organizationId}/rfx/supplier/${rfxHeaderId}/prequal`, {
    method: 'GET',
    query: { prequalCategory, supplierCompanyId, customizeUnitCode },
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
 * 资质要求细项-要素列表
 * @async
 * @function queryIndicateData
 * @param {Object} params - 查询条件
 * @returns {!Promise} fetch Promise
 */
export async function queryIndicateData(params = {}) {
  const { prequalHeaderId } = params;
  return request(`${prefix}/${organizationId}/prequal/${prequalHeaderId}/score-indic`, {
    method: 'GET',
  });
}

/**
 * 资质要求细项-要素列表-分标段
 * @async
 * @function querySectionIndicateData
 * @param {Object} params - 查询条件
 * @returns {!Promise} fetch Promise
 */
export async function querySectionIndicateData(params = {}) {
  const { prequalHeaderId } = params;
  return request(
    `${prefix}/${organizationId}/prequal-group-headers/approval/${prequalHeaderId}/score-indic`,
    {
      method: 'GET',
    }
  );
}

/**
 * 资质要求细项-要素列表-分标段---新
 * @async
 * @function querySectionIndicateNewData
 * @param {Object} params - 查询条件
 * @returns {!Promise} fetch Promise
 */
export async function querySectionIndicateNewData(params = {}) {
  const { prequalHeaderId } = params;
  return request(`${prefix}/${organizationId}/prequal-group-score-assigns/${prequalHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 保存询价,阅读事项说明标识
 * @async
 */
export async function saveConfirmMatter(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/confirm-matter`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存整单升降价
 * @async
 */
export async function updateLineData(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/quotation/direction/save`, {
    method: 'POST',
    body: params.rfxQuotationHeader,
  });
}

// 打印
export async function queryPrint(params) {
  const { flag, ...otherParams } = params;
  if (flag) {
    return request(
      `${prefix}/${params.organizationId}/rfx/quotation/${params.quotationHeaderId}/print`,
      {
        method: 'GET',
        query: otherParams,
        responseType: 'blob',
      }
    );
  } else {
    return request(
      `${prefix}/${params.organizationId}/sojo/rfx/${params.quotationHeaderId}/quotaion-export`,
      {
        method: 'GET',
        query: otherParams,
        responseType: 'text',
      }
    );
  }
}

// 供应商回复-新报价-打印
export async function printQuotation(params) {
  const { organizationId: currentOrganizationId, quotationHeaderId, ...otherParams } = params;

  return request(`${prefix}/${currentOrganizationId}/rfx/quotation/${quotationHeaderId}/print`, {
    method: 'GET',
    query: otherParams,
    responseType: 'blob',
  });
}

/**
 * 多轮报价信息
 * @param {*} params 查询参数
 */
export async function roundQuotationInfo(params = {}) {
  return request(`${SRM_SSRC}/v1/${organizationId}/round-quotation-lines/record`, {
    method: 'GET',
    query: params,
  });
}

// 多轮报价排名表
export async function roundQuotationRankTable(params = {}) {
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/supplier/quotation-header/round-rank`, {
    method: 'GET',
    query: params,
  });
}

// 供应商价格澄清-回复-save
export async function priceReplySave(params = {}) {
  const {
    clarifyNotifyId = null,
    quotationHeaderId = null,
    customizeUnitCode = null,
    ...others
  } = params;
  return request(
    `${prefix}/${params.organizationId}/clarify-notify/price/supplier-reply/${clarifyNotifyId}/${quotationHeaderId}/save`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: others,
    }
  );
}

// 价格澄清提交
export async function priceReplySubmit(params = {}) {
  const {
    organizationId: currentOrganizationId = null,
    clarifyNotifyId = null,
    quotationHeaderId = null,
    customizeUnitCode = null,
    ...others
  } = params || {};
  return request(
    `${prefix}/${currentOrganizationId}/clarify-notify/price/supplier-reply/${clarifyNotifyId}/${quotationHeaderId}/submit`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: others,
    }
  );
}

// 评审澄清list
export async function fetchReviewClarificationList(params = {}) {
  const Params = parseParameters(params);
  const { organizationId: currentOrganizationId = null, ...others } = Params;
  return request(`${prefix}/${currentOrganizationId}/clarify-notify/supplier-query/list`, {
    method: 'GET',
    query: others,
  });
}

// 价格澄清详情-报价商务技术附件 /v1/{organizationId}/clarify-notify/price/supplier-reply/attachment/query/{clarifyNotifyId}/{quotationHeaderId}
export async function fetchPriceClarificationFiles(params = {}) {
  const {
    organizationId: currentOrganizationId = null,
    clarifyNotifyId,
    quotationHeaderId,
  } = params;
  return request(
    `${prefix}/${currentOrganizationId}/clarify-notify/price/supplier-reply/attachment/query/${clarifyNotifyId}/${quotationHeaderId}`,
    {
      method: 'GET',
    }
  );
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

// 供应商报价-分标段-批量勾选提交
export async function quotationSectionBatchSubmit(params = {}) {
  const {
    organizationId: currentOrganizationId = null,
    customizeUnitCode = null,
    ...others
  } = params;
  return request(`${prefix}/${currentOrganizationId}/rfx/quotation/section-batch-submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
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

/**
 * 保存资格预审头信息
 * @function - querySupplierPrequalGroups
 * @param {!Object} params - 参数 eg: { organizationId, ... }
 * @returns promise
 */
export async function saveSupplierPrequalHeader(params) {
  const {
    organizationId: currentOrganizationId,
    supplierPrequalDTO,
    prequalGroupHeaderId,
    supplierCompanyId,
    customizeUnitCode = null,
  } = params;
  return request(
    `${prefix}/${currentOrganizationId}/prequal-group-supplier-lines/supplier-prequal/save`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: {
        ...supplierPrequalDTO,
        supplierCompanyId,
        prequalGroupHeaderIds: [prequalGroupHeaderId],
      },
    }
  );
}

/**
 * 提交资格预审头信息
 * @function - querySupplierPrequalGroups
 * @param {!Object} params - 参数 eg: { organizationId, ... }
 * @returns promise
 */
export async function submitSupplierPrequalHeader(params) {
  const {
    organizationId: currentOrganizationId,
    supplierPrequalDTO: prequalGroupSupplierLine,
    prequalGroupHeaderIds,
    customizeUnitCode = null,
  } = params;
  return request(
    `${prefix}/${currentOrganizationId}/prequal-group-supplier-lines/supplier-prequal/submit`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: {
        prequalGroupSupplierLine,
        prequalGroupHeaderIds,
      },
    }
  );
}

/**
 * 查询资格预审头信息
 * @function - querySupplierPrequalGroups
 * @param {!Object} params - 参数 eg: { organizationId, ... }
 * @returns promise
 */
export async function querySupplierPrequalHeader(params) {
  const { organizationId: currentOrganizationId, prequalGroupHeaderId, ...otherParams } = params;
  return request(
    `${prefix}/${currentOrganizationId}/prequal-group-supplier-lines/${prequalGroupHeaderId}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

// 竞价页面-报价行列表-最新报价数据消息
export async function fetchQuotationListNewMessage(params = {}) {
  const { organizationId: currentOrganizationId, ...otherParams } = params || {};
  return request(`${prefix}/${currentOrganizationId}/rfx/quotation/refreshRank/rank/list`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 竞价页面-报价行最新报价数据消息
 */
export async function fetchQuotationLineNewMessage(params = {}) {
  const { organizationId: currentOrganizationId, ...otherParams } = params || {};
  return request(`${prefix}/${currentOrganizationId}/rfx/quotation/refreshRank/rankChart`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 查询资格预审头信息
 * @function - querySupplierPrequalGroups
 * @returns promise
 */
export async function fetchCreatePermission(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/clarify/check-create-flag`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 查询是否使用新报价配置表
 */
export async function fetchNewQuotationConfigSheet(param = {}) {
  const { organizationId: currentOrganizationId = null, ...others } = param || {};
  return request(
    `${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/ssrc_rfq_quotation_old_ui_config`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/**
 * 参与查询报价头
 */
export async function fetchHeaderInParticipateNew(param = {}) {
  const { organizationId: currentOrganizationId = null, ...others } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/rfx-header/participate`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 参与
 */
export async function participateNew(param = {}) {
  const { organizationId: currentOrganizationId = null, query = {}, ...data } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/batch-participate`, {
    method: 'POST',
    query,
    body: data,
  });
}

/**
 * 放弃
 */
export async function abandonNew(param = {}) {
  const {
    organizationId: currentOrganizationId = null,
    query = {},
    customizeUnitCodeAbandon,
    ...data
  } = param || {};
  return request(
    `${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/batch-abandon?customizeUnitCode=${customizeUnitCodeAbandon}`,
    {
      method: 'POST',
      query,
      body: data,
    }
  );
}

/**
 * 报价头查询-新
 * */
export async function queryQuotationHeader(param = {}) {
  const { organizationId: currentOrganizationId = null, ...others } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/quotation/header`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 报价保存-新
 * */
export async function saveQuotationNew(param = {}) {
  const { organizationId: currentOrganizationId = null, query = null, ...others } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/quotation/save`, {
    method: 'POST',
    query,
    body: others,
  });
}

/**
 * 报价提交-新
 * */
export async function submitQuotationNew(param = {}) {
  const { organizationId: currentOrganizationId = null, query = null, ...others } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/batch-submit`, {
    method: 'POST',
    query,
    body: others,
  });
}

// 报价-历史版本查询
export async function fetchuotationHistoryVersions(param = {}) {
  const { organizationId: currentOrganizationId = null, ...others } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/quotation/header/record/list`, {
    method: 'GET',
    query: others,
  });
}

// 报价查询/报价历史版本 头查询
export async function fetchQuotationHistoryHeader(param = {}) {
  const { organizationId: currentOrganizationId = null, ...others } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/quotation/header/record`, {
    method: 'GET',
    query: others,
  });
}

// 报价查询/报价历史版本 头查询 - 外部模块使用
export async function fetchQuotationHistoryHeaderExternal(param = {}) {
  const { organizationId: currentOrganizationId = null } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/quotation/header/record/pur-query`, {
    method: 'GET',
    query: param,
  });
}

// 报价查询/报价历史版本 报价行查询
export async function fetchQuotationHistoryQuotationLine(param = {}) {
  const { organizationId: currentOrganizationId = null, ...others } = param || {};
  const lineParams = parseParameters(others);
  return request(
    `${SRM_SSRC}/v2/${currentOrganizationId}/rfx/quotation/header/record/quotation-line`,
    {
      method: 'GET',
      query: lineParams,
    }
  );
}

/**
 * 保存前供应商价格澄清校验阶梯报价
 * @param {Array} params - 保存行信息列表
 */
export async function validateClarifyLadderQuotation(params) {
  const { querys } = params || {};
  return request(
    `${SRM_SSRC}/v1/${organizationId}/clarify-notify/price/supplier-reply/ladder-quotation-validate`,
    {
      method: 'POST',
      body: params,
      query: querys,
    }
  );
}

/**
 * 供应商全部放弃
 */
export async function quotationWholeAbandon(params = {}) {
  const { data = {}, queryParam = {} } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/supplier/batch-whole-abandon`, {
    method: 'POST',
    body: data,
    query: queryParam,
  });
}

/**
 * 供应商-物料
 */
export async function fetchQuotationItem(params = {}) {
  const { organizationId: currentOrganizationId = null } = params || {};
  return request(`${SRM_SSRC}/v1/${currentOrganizationId}/rfx/quotation/items`, {
    method: 'GET',
    query: params || {},
  });
}

/**
 * 生成寻源费用并且推送费用工作台 - 明细页参与
 */
export async function quotationInsertExpens(params = {}) {
  return request(`${prefix}/${organizationId}/expenses-headers/insert-expense`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 生成寻源费用并且推送费用工作台 - 列表页参与
 */
export async function quotationBatchInsertExpens(params = {}) {
  return request(`${prefix}/${organizationId}/expenses-headers/batch-insert-expense`, {
    method: 'POST',
    body: params,
  });
}

// 报价查询/报价历史版本 头查询 - 采购方使用
export async function fetchQuotationHistoryHeaderPurchaser(param = {}) {
  const { organizationId: currentOrganizationId = null } = param || {};
  return request(
    `${SRM_SSRC}/v2/${currentOrganizationId}/rfx/quotation/header/record/pur-query/detail`,
    {
      method: 'GET',
      query: param,
    }
  );
}

// 获取报价
export async function getJDQuotation(param = {}) {
  const { organizationId: currentOrganizationId = null } = param || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/jd-supplier-quote`, {
    method: 'POST',
    body: param,
  });
}

// 报价查询/报价历史版本 头查询 - 采购方使用
export async function fetchQuotationHistoryHeaderExternalSupplier(param = {}) {
  const { organizationId: currentOrganizationId = null } = param || {};
  return request(
    `${SRM_SSRC}/v2/${currentOrganizationId}/rfx/quotation/header/record/supplier-query`,
    {
      method: 'GET',
      query: param,
    }
  );
}

// 供应商报价页面 - 时间实时刷新
export async function fetchSupplierQuotationTimer(params = {}) {
  const { organizationId: currentOrganizationId, ...otherParams } = params || {};
  return request(`${SRM_SSRC}/v2/${currentOrganizationId}/rfx/supplier/refresh-header`, {
    method: 'POST',
    body: otherParams,
  });
}
