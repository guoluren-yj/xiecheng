import request from 'utils/request';
import { SRM_SSRC, SRM_MARMOT } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 比价助手物品
 * @async
 * @function fetchPriceComparisonItem
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPriceComparisonItem(params) {
  return request(`${prefix}/${organizationId}/rfx/quotation/price-compare-assistant/item`, {
    method: 'POST',
    body: params,
    query: { permissionFilterFlag: params?.permissionFilterFlag || 0 },
  });
}

/**
 * 比价助手头
 * @async
 * @function fetchPriceComparisonHeader
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPriceComparisonHeader(params) {
  return request(`${prefix}/${organizationId}/rfx/quotation/price-compare-assistant/header`, {
    method: 'POST',
    body: params,
    query: { permissionFilterFlag: params?.permissionFilterFlag || 0 },
  });
}

/**
 * 比价助手物品
 * @async
 * @function fetchPriceComparisonSupplier
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPriceComparisonSupplier(params) {
  return request(`${prefix}/${organizationId}/rfx/quotation/price-compare-assistant/supplier`, {
    method: 'POST',
    body: params,
    query: { permissionFilterFlag: params?.permissionFilterFlag || 0 },
  });
}

/**
 * 比价助手-报价明细侧边导航
 * @async
 * @function fetchQuotationDetailSideMenu
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchQuotationDetailSideMenu(params) {
  return request(`${prefix}/${organizationId}/quotation-column/detail-compare/item`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 比价助手-报价明细筛选框
 * @async
 * @function fetchQuotationDetailFilter
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchQuotationDetailFilter(params) {
  return request(`${prefix}/${organizationId}/quotation-column/detail-compare/param`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 比价助手-报价明细右边表格数据
 * @async
 * @function fetchQuotationDetailData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchQuotationDetailData(params) {
  return request(`${prefix}/${organizationId}/quotation-column/detail-compare`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 比价助手最新报价-数据查询
 * @async
 * @function fetchLatestQuotation
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchLatestQuotation(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/rfx/${param.rfxHeaderId}/bargain-assistant`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 比价助手-本次报价过程、历史价格分析物料导航栏
 * @async
 * @function fetchSideBarMenu
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSideBarMenu(params) {
  const { rfxHeaderId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain-assistant/item/${rfxHeaderId}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 比价助手-历史价格分析 - 确认是否展示替代料
 * @param {object} params - 查询条件
 */
export async function fetchSubRelationConfig(params = {}) {
  const { rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/item-sub-relation/check`, {
    method: 'GET',
    query: {
      rfxHeaderId,
    },
  });
}

/**
 * 比价助手-历史价格分析 -查询历史价格分析报表平台提供的url
 * @param {*} params dataCode：data-931 不展示替代料 data-931-all 展示替代料
 * @returns
 */
export async function fetchHistoryPriceUrl(params = {}) {
  const { dataCode } = params;
  return request(
    `${SRM_MARMOT}/v1/${organizationId}/marmot-organization-api/SDAP_DATA_REPORT_SETTING_QUERY`,
    {
      method: 'GET',
      query: {
        dataCode,
      },
    }
  );
}

export function getPrintConfig(params) {
  return request(
    `/sada/v1/${organizationId}/rel-table-records/ssrc_price_compare_assistant_export_ui_config/platform-lov`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 比价助手-历史价格分析-报表平台提供的页面调用接口
 * 让数据落库，直连数据库去组装数据
 * @param {*} params {rfxHeaderId} 入参
 * @returns
 */
export async function connectData(params = {}) {
  return request(
    `${SRM_MARMOT}/v1/${organizationId}/marmot-organization-api/SDAA_DATA_391_RESTFUL_API_01`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 比价助手-本次报价过程物料表格
 * @async
 * @function fetchThisQuoteProcessTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchThisQuoteProcessTable(params) {
  const { rfxLineItemId, ...others } = params;
  const param = parseParameters(others);
  return request(`${prefix}/${organizationId}/rfx/bargain-assistant/table/${rfxLineItemId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 比价助手-本次报价过程物料图表
 * @async
 * @function fetchThisQuoteProcessChart
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchThisQuoteProcessChart(params) {
  const { rfxLineItemId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain-assistant/process/${rfxLineItemId}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 比价助手-本次报价过程总价表格
 * @async
 * @function fetchThisQuoteTotalTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchThisQuoteTotalTable(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/rfx/bargain-assistant/table/histogram`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 比价助手-本次报价过程总价图表
 * @async
 * @function fetchThisQuoteTotalChart
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchThisQuoteTotalChart(params) {
  return request(`${prefix}/${organizationId}/rfx/bargain-assistant/process/histogram`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询历史价格分析-折线图表
 * @async
 * @function fetchHistoryPriceAnalysisChart
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchHistoryPriceAnalysisChart(params) {
  return request(`${prefix}/${organizationId}/price-lib-historys/analysis`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询历史价格分析-相似物品最低一览表
 * @async
 * @function fetchHistoryPriceAnalysisTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchHistoryPriceAnalysisTable(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/price-lib-historys/analysis/similar`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 比价助手-报价明细-导出
 * @async
 * @function exportQuotationDetail
 */
export async function exportQuotationDetail(params) {
  return request(`${prefix}/${organizationId}/quotation-column/detail-compare/${params.type}`, {
    method: 'GET',
    responseType: 'text',
    query: params,
  });
}

/**
 * 比价助手-最新报价-导出
 * @async
 * @function exportLatestOffer
 */
export async function exportLatestOffer(params) {
  const url = `${prefix}/${organizationId}/rfx/${params.rfxHeaderId}/bargain-assistant/latestOffer/export`;
  return request(url, {
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 比价助手-导出（中集二开）
 * @async
 * @function exportPriceComparison
 */
export async function exportPriceComparison(params) {
  const { key, ...otherParams } = params;
  const url =
    key === 'pdf' || key === 'pdfAll'
      ? `${prefix}/${organizationId}/rfx/quotation/price-compare-assistant/report/pdf`
      : `${prefix}/${organizationId}/rfx/quotation/price-compare-assistant/report/excel`;
  return request(url, {
    method: 'POST',
    body: otherParams,
    responseType: 'text',
  });
}

/**
 * 比价助手-查询配置项
 * @async
 * @function fetchPriceComparisonConfigs
 */
export async function fetchPriceComparisonConfigs(params) {
  return request(`${prefix}/${organizationId}/price-assistant-configs/one`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 比价助手-保存配置项
 * @async
 * @function savePriceComparisonConfig
 */
export async function savePriceComparisonConfig(params) {
  return request(`${prefix}/${organizationId}/price-assistant-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 比价助手-本次报价过程-导出
 * @async
 * @function exportThisQuoteProcess
 */
export async function exportThisQuoteProcess(params) {
  const { type, ...otherParams } = params;
  const { customizeUnitCode = '' } = otherParams;
  const url =
    type === 'unitPrice'
      ? `${prefix}/${organizationId}/rfx/bargain-assistant/table/${otherParams.rfxLineItemId}/export`
      : `${prefix}/${organizationId}/rfx/bargain-assistant/table/histogram/export`;
  return request(url, {
    method: 'GET',
    query:
      type === 'unitPrice'
        ? { customizeUnitCode }
        : { rfxHeaderId: otherParams.rfxHeaderId, customizeUnitCode },
    responseType: 'text',
  });
}

// 历史价格分析switch用户记忆
export function fetchHistoryAnalysisUserConfig(params = {}) {
  return request(`${SRM_SSRC}/v1/${organizationId}/user-config`, {
    method: 'GET',
    query: params,
  });
}

// 查询物料替代方案组
export async function fetchItemSubRelation(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/item-sub-relation/query`, {
    method: 'GET',
    query: { ...params },
  });
}

// 查询详细替代方案列表数据
export async function fetchItemSubRelationTable(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/item-sub-relation/table/query`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 替代方案物料导出
 * @param {*} params - 入参
 */
export async function exportItemSubRelation(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/item-sub-relation/export`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 简单头查询
 *
 * @export
 * @param {*} params
 * @returns
 */
export function fetchHeaderInfo(params) {
  const { rfxHeaderId, ...others } = params;
  const param = parseParameters(others);
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/simple/${rfxHeaderId}`, {
    method: 'GET',
    query: param,
  });
}
