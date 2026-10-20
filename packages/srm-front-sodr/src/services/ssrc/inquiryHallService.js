/**
 * service - 寻源平台/询价大厅
 * @date: 2018-12-25
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 询价大厅数据查询
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
  let url;
  if (path === '/ssrc/inquiry-hall/list') {
    url = `${prefix}/${organizationId}/rfx/list`;
  } else if (path === '/ssrc/quotation-controller/list') {
    url = `${prefix}/${organizationId}/rfx/control/list`;
  }
  return request(url, {
    method: 'GET',
    query: { ...param },
  });
}

// 核价中心弹窗查询
export async function queryCenterPop(params) {
  const { organizationId, rfxHeaderId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${prefix}/${organizationId}/rfx/items/${rfxHeaderId}/codeless`, {
    method: 'GET',
    query: param,
  });
}

// 核价中心弹窗保存
export async function pricingSave(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/items/${rfxHeaderId}/codeless`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 改变询价大厅寻源模板获取询价大厅维护头
 * @async
 * @function fetchChangetemplateHeaderData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchChangetemplateHeaderData(params) {
  return request(
    `${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}/SourceTemplate/${params.templateId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 报价响应数据查询
 * @async
 * @function quotationFeedBack
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function quotationFeedBack(params) {
  return request(
    `${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}/quotation-feedback`,
    {
      method: 'GET',
      query: { ...params },
    }
  );
}

/**
 * 操作-下发专家评分
 * @async
 * @function sendExpertScore
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function sendExpertScore(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/hand-down`, {
    method: 'POST',
  });
}

/**
 * 操作-关闭询价单
 * @async
 * @function closeRfx
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function closeRfx(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/close`, {
    method: 'POST',
    body: [rfxHeaderId],
  });
}
/**
 * 操作-开始初审
 * @async
 * @function startPretrial
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function startPretrial(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/next`, {
    method: 'POST',
  });
}
/**
 * 操作-开始核价
 * @async
 * @function startCheckPrice
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function startCheckPrice(params) {
  const { organizationId, rfxHeaderId, rfxStatus } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/next`, {
    method: 'POST',
    body: { rfxStatus },
  });
}
/**
 * 询价大厅维护页面头
 * @async
 * @function fetchInquiryHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchInquiryHeaderDetail(params) {
  const { organizationId, rfxHeaderId, path = [] } = params;
  let url;
  if (path.includes('quotation-controller')) {
    url = `${prefix}/${organizationId}/rfx/${rfxHeaderId}?allSelectFlag=1`;
  } else {
    url = `${prefix}/${organizationId}/rfx/${rfxHeaderId}`;
  }
  return request(url, {
    method: 'GET',
  });
}

/**
 * 专家评分进询价大厅详细页面头
 * @async
 * @function fetchScoreInquiryHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoreInquiryHeaderDetail(params) {
  const { organizationId, rfxHeaderId, path } = params;
  let url;
  if (path.includes('quotation-controller')) {
    url = `${prefix}/${organizationId}/rfx/${rfxHeaderId}?allSelectFlag=1`;
  } else {
    url = `${prefix}/${organizationId}/rfx/${rfxHeaderId}`;
  }
  return request(url, {
    method: 'GET',
  });
}

/**
 * 询价监控台头信息
 * @async
 * @function fetchMonitorHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchMonitorHeaderDetail(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/simple/${rfxHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 物品明细-数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchItemLine(params) {
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
 * 其它model进询价大厅-物品明细-数据查询
 * @async
 * @function fetchInquiryItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchInquiryItemLine(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/items`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 物品行报价明细查询
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchItemLineQuotationDetail(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/quotationDetails`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 供应商列表-数据查询
 * @async
 * @function fetchSupplierLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchSupplierLine(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/suppliers`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 其它model进询价大厅-供应商列表-数据查询
 * @async
 * @function fetchInquirySupplierLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchInquirySupplierLine(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/suppliers`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 还比价供应商列表-数据查询
 * @async
 * @function fetchSupplierLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchSupplierLineCheckPrice(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/check/suppliers`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function fetchSupplierLineBarginPrice(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/bargain/suppliers`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 批量添加供应商数据查询
 * @async
 * @function fetchBulkSupplierData
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchBulkSupplierData(params) {
  const { organizationId, lovCode, userId, companyId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/suppliers/lovForSupplier`, {
    method: 'GET',
    query: { ...param, organizationId, userId, companyId },
  });
}

/**
 * 核价物品报价明细-数据查询
 * @async
 * @function fetchItemQuoteLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchItemQuoteLine(params) {
  const { organizationId, rfxLineItemId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/check`, {
    method: 'GET',
    query: { ...param, rfxLineItemId },
  });
}

/**
 * 核价供应商报价明细-数据查询
 * @async
 * @function fetchSupplierQuoteLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchSupplierQuoteLine(params) {
  const { organizationId, rfxLineSupplierId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/check`, {
    method: 'GET',
    query: { ...param, rfxLineSupplierId },
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
    }
  );
}

/**
 * 评分要素 - 批量删除
 * @async
 * @function deleteScoringElement
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteScoringElement(params) {
  return request(`${prefix}/${params.organizationId}/prequal/score-indic`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 评分要素-新增保存
 * @async
 * @function saveScoringElement
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveScoringElement(params) {
  const { prequalHeaderId, organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal/${prequalHeaderId}/score-indic`, {
    method: 'POST',
    body: otherParams.newParams,
  });
}

/**
 * 核价-退回至初审
 * @async
 * @function submitReturnToPretrial
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function submitReturnToPretrial(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/pretrial/back`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 核价/初审全部报价明细-数据查询
 * @async
 * @function fetchQuoteLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQuoteLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/check`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 初审保存
 * @async
 * @function savePretrial
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function savePretrial(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/pretrial/save`, {
    method: 'POST',
    body: otherParams,
  });
}
/**
 * 初审提交
 * @async
 * @function submitPretrial
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function submitPretrial(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/pretrial/submit`, {
    method: 'POST',
    body: otherParams,
  });
}
/**
 * 初审转交
 * @async
 * @function selectTransferOk
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function selectTransferOk(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/pretrial/deliver`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 核价保存
 * @async
 * @function saveCheckPrice
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveCheckPrice(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/check`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 核价提交
 * @async
 * @function submitCheckPrice
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function submitCheckPrice(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/check/submit`, {
    method: 'POST',
    query: { rfxHeaderId },
    body: { ...otherParams, rfxHeaderId },
  });
}

/**
 * 核价/初审-再次询价
 * @async
 * @function inquiryAgain
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function inquiryAgain(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/round`, {
    method: 'POST',
    query: { rfxHeaderId },
  });
}

/**
 * 核价-查看ip重合率
 * @async
 * @function inquiryAgain
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function fetchIPCoincidenceRate(params) {
  const { rfxHeaderId } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/rfx/quotation/${rfxHeaderId}/Ip`, {
    method: 'GET',
  });
}

/**
 * 物品明细-新增
 * @async
 * @function saveItemLine
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveItemLine(params) {
  const { rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${otherParams.organizationId}/rfx/items`, {
    method: 'POST',
    query: {
      rfxHeaderId,
    },
    body: otherParams.newParameters,
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
    body: params.remoteDelete,
  });
}

/**
 * 供应商列表-新增
 * @async
 * @function saveSupplierLine
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveSupplierLine(params) {
  const { rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${otherParams.organizationId}/rfx/suppliers`, {
    method: 'POST',
    query: { rfxHeaderId },
    body: otherParams.newParams,
  });
}

/**
 * 供应商列表 - 批量删除
 * @async
 * @function deleteSupplierLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteSupplierLines(params) {
  return request(`${prefix}/${params.organizationId}/rfx/suppliers`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 维护页面 - 保存
 * @async
 * @function saveInquiryHallUpdate
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function saveInquiryHallUpdate(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/save`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 维护页面 - 取消
 * @async
 * @function cancelInquiryHallUpdate
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function cancelInquiryHallUpdate(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/cancel`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 维护页面 - 发布
 * @async
 * @function releaseInquiryHall
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function releaseInquiryHall(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/release`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 操作记录数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchOperation(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/actions`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 阶梯报价数据查询
 * @async
 * @function fetchLadderLevelyTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchLadderLevelyTable(params) {
  const { organizationId, rfxLineItemId } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxLineItemId}/ladder-inquiry`, {
    method: 'GET',
  });
}
/**
 * 阶梯还价数据查询
 * @async
 * @function fetchBarginLadderLevelyTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchBarginLadderLevelyTable(params) {
  const { organizationId, quotationLineId } = params;
  return request(`${prefix}/${organizationId}/rfx/${quotationLineId}/ladder-inquiry/bargain`, {
    method: 'GET',
  });
}
/**
 * 核价/初审/询报价查询明细阶梯等级数据查询
 * @async
 * @function fetchLadderLevelTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchLadderLevelTable(params) {
  const { organizationId, quotationLineId } = params;
  return request(`${prefix}/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`, {
    method: 'GET',
  });
}
/**
 * 缩略图数据查询
 * @async
 * @function fetchPriceChartsData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPriceChartsData(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/thumbnail`, {
    method: 'GET',
    query: { ...otherParams },
  });
}
/**
 * 阶梯报价-新增保存
 * @async
 * @function saveLadderLevel
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveLadderLevel(params) {
  const { rfxLineItemId, organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxLineItemId}/ladder-inquiry`, {
    method: 'POST',
    body: otherParams.newParameters,
  });
}
/**
 * 阶梯还价-保存
 * @async
 * @function saveBarginLadderLevel
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveBarginLadderLevel(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/ladder-inquiry/bargain`, {
    method: 'POST',
    body: otherParams.newParams,
  });
}
/**
 * 物品明细 - 批量删除
 * @async
 * @function deleteLadderLevelLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteLadderLevelLines(params) {
  return request(`${prefix}/${params.organizationId}/rfx/${params.rfxLineItemId}/ladder-inquiry`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}
/**
 * rfx 创建
 * @async
 * @function createRfx
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function createRfx(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx`, {
    method: 'POST',
    body: otherParams.values,
  });
}

/**
 * 开标人弹框-查询
 * @async
 * @function fetchBidholderList
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fetchBidholderList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}/openers`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 开标人弹框-新增或更新
 * @async
 * @function fetchBidholderUpdate
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fetchBidholderUpdate(params) {
  return request(`${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}/openers`, {
    method: 'POST',
    body: params.holderData,
  });
}

/**
 * 开标人弹框-批量删除
 * @async
 * @function fetchBidholderDelete
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fetchBidholderDelete(params) {
  return request(`${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}/openers`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}
/**
 * 筛选供应商弹窗list查询
 * @async
 * @function fetchSupplier
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSupplier(params) {
  const { organizationId, queryFlag, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/item-sup-assign`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 其它model进询价大厅-筛选供应商弹窗list查询
 * @async
 * @function supplierInquiryRecord
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function supplierInquiryRecord(params) {
  const { organizationId, queryFlag, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/item-sup-assign`, {
    method: 'GET',
    query: { ...otherParams },
  });
}
/**
 * 筛选供应商修改保存
 * @async
 * @function saveSupplierRecordLine
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function saveSupplierRecordLine(params) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/rfx/item-sup-assign`, {
    method: 'POST',
    body: other,
  });
}
/**
 * 供应商关系图谱
 * http://zy.riskraiders.com:9300/#/login/zenyun?userName=ZYKJ&taskId=a88d8bbdf6dc438ca628756078eb4baf&keyPwd=QW1VEEusw3mI7VnQ0qxEWg==
 * @export
 * @param {*} params
 * @returns
 */
export async function supplierRelationMap(params) {
  const { organizationId, companyName, companyNames } = params;
  return request(`${prefix}/${organizationId}/monitor/enterpriseRelationship`, {
    method: 'GET',
    query: {
      companyName,
      companyNames,
    },
    responseType: 'text',
  });
}

/**
 * 开标
 * @param {Array} params - 开标密码
 */
export async function openingBid(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/open`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 重发开标密码
 */
export async function resendPassword(params) {
  const { rfxHeaderId } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/password `, {
    method: 'get',
  });
}
/**
 * 还比价报价全部明细查询
 * @async
 * @function fetchAllLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchAllLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/bargain`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 还比价--单独查询物料行
 * @async
 * @function fetchAllLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchAloneItemLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/bargain`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 还比价--单独查询供应商
 * @async
 * @function fetchAllLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchAloneSupplierItemLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/bargain`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 还比价页面 - 保存
 * @async
 * @function saveInquiryHallFullQuation
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function saveInquiryHallFullQuation(params) {
  const { organizationId, rfxAllLine } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain`, {
    method: 'POST',
    body: rfxAllLine,
  });
}

/**
 * 还比价页面 - 提交
 * @async
 * @function sumbitInquiryHallFullQuation
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function submitInquiryHallFullQuation(params) {
  const { organizationId, rfxAllLine } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/submit`, {
    method: 'POST',
    body: rfxAllLine,
  });
}

/**
 * 请求stage
 */
export async function getStage(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/progress`);
}

/**
 * 还比价--批量填写还价
 * @async
 * @function inquiryAgain
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function handleSaveCounterOffersBulk(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/batch`, {
    method: 'POST',
    query: { rfxHeaderId },
    body: otherParams,
  });
}

/**
 * 操作询报价
 * @function
 */
export async function quotationControll(params) {
  const { organizationId, type, remark, rfxHeaderIds } = params;
  let url;
  if (type === 1) {
    url = `${prefix}/${organizationId}/rfx/pause?remark=${remark}`;
  } else if (type === 2) {
    url = `${prefix}/${organizationId}/rfx/close?remark=${remark}`;
  } else if (type === 3) {
    url = `${prefix}/${organizationId}/rfx/resume`;
  } else if (type === 4) {
    url = `${prefix}/${organizationId}/rfx/setting-quotation-end-date?remark=${remark}`;
  }
  return request(url, {
    method: 'POST',
    body: rfxHeaderIds,
  });
}
/**
 * handleAdjustTime
 * 调整时间
 */
export async function handleAdjustTime(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/adjust`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * fetchAddSupplierLine
 * 添加供应商数据
 */
export async function fetchAddSupplierLine(params) {
  const { organizationId, rfxHeaderId, appendFlag } = params;
  return request(
    `${prefix}/${organizationId}/rfx/${rfxHeaderId}/suppliers?appendFlag=${appendFlag}`
  );
}

/**
 * fetchMaterial
 * 查询分配物料
 */
export async function fetchMaterial(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/control/items`, {
    method: 'GET',
    query: { ...others },
  });
}

/**
 * saveSupplier
 * 保存供应商数据
 */
export async function saveSupplier(params) {
  const { organizationId, rfxHeaderId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/add-suppliers`, {
    method: 'POST',
    query: { rfxHeaderId },
    body: others,
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
  const { organizationId, rfxHeaderId, queryModel, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/rfx/${rfxHeaderId}/bargain-assistant?queryModel=${params.queryModel}`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * fetchRecord
 * 请求报价历史记录
 */
export async function fetchRecord(params) {
  const { organizationId, rfxLineItemId, ...other } = params;
  const param = parseParameters(other);
  return request(`${prefix}/${organizationId}/rfx/${rfxLineItemId}/supervisor/history`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * fetchLineData
 * 请求折线图数据
 */
export async function fetchLineData(params) {
  const { organizationId, rfxLineItemId, ...other } = params;
  const param = parseParameters(other);
  return request(`${prefix}/${organizationId}/rfx/${rfxLineItemId}/supervisor/tendency`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 请求申请转询价页面行数据
 */
export async function fetchApplyToInquiry(params) {
  const { organizationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${prefix}/${organizationId}/share/application`, {
    method: 'GET',
    query: { ...param },
  });
}
export async function createApplyToInquiry(params) {
  const { organizationId, ...param } = params;
  return request(`${prefix}/${organizationId}/rfx/application`, {
    method: 'POST',
    body: param,
  });
}

/**
 * 申请转询价创建前校验API
 * @async
 * @function checkApplyToInquiry
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function checkApplyToInquiry(params) {
  const { organizationId, prLineIdList } = params;
  return request(`${prefix}/${organizationId}/share/valid-purchase`, {
    method: 'GET',
    query: { prLineIdList },
  });
}

/**
 * 请求风险扫描
 */
export async function linkRiskScan(params) {
  const organizationId = getCurrentOrganizationId();
  const { ...other } = params;
  return request(`${prefix}/${organizationId}/monitor/riskScan`, {
    method: 'GET',
    query: { ...other },
    responseType: 'text',
  });
}

/**
 * 确认RFX候选人 - 提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export function submitRfxCandidate(params) {
  const { organizationId, data, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/pre/submit`, {
    method: 'POST',
    body: { ...data, ...others },
  });
}

/**
 * 确认RFX候选人 - 保存
 *
 * @export
 * @param {*} params
 * @returns
 */
export function saveRfxCandidate(params) {
  const { organizationId, data, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/pre/save`, {
    method: 'POST',
    body: { ...data, ...others },
  });
}

/**
 * 评标管理-招标评标进度条
 * @async
 * @function fetchEvalProgress
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchEvalProgress(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${params.sourceFrom}/${params.sourceHeaderId}/progress`,
    {
      method: 'GET',
    }
  );
}

/**
 * 确认RFX候选人 - 获取标段下供应商详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export function fetchEvaluateSummary(params) {
  const { organizationId, sourceFrom, sourceHeaderId, ...others } = params;
  const param = parseParameters(others);
  return request(`${prefix}/${organizationId}/evaluate-summary/${sourceFrom}/${sourceHeaderId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 确认RFX候选人 - 获取标段下供应商的评分明细
 *
 * @export
 * @param {*} params
 * @returns
 */
export function fetchScoreDetail(params) {
  const { organizationId, evaluateSummaryId, ...others } = params;
  const param = parseParameters(others);
  return request(
    `${prefix}/${organizationId}/evaluate-summary/summary/${evaluateSummaryId}/indic-detail`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 改变询价大厅公司清空对应物品供应商数据
 * @async
 * @function fetchScoringElementData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function changeCompany(params) {
  const { organizationId, rfxHeaderId, ...others } = params;
  return request(`${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}/change-company`, {
    method: 'GET',
    query: others,
  });
}

// 多伦报价 获取所有报价信息
export function fetchAllRoundQuotationData(params) {
  const { organizationId, sourceHeaderId, ...others } = params;
  return request(
    `${prefix}/${organizationId}/round-headers/${sourceHeaderId}/all-round-quotation`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 多轮报价 创建新一轮报价
export function createNewRoundQuotation(params) {
  const {
    organizationId,
    sourceHeaderId,
    roundQuotationEndDate = '',
    startingReason = '',
  } = params;
  return request(`${prefix}/${organizationId}/round-headers/start-quotation/${sourceHeaderId}`, {
    method: 'POST',
    query: { roundQuotationEndDate, startingReason },
  });
}

// 多轮报价，确定终轮报价结束
export function sureRoundQuotationEnd(params) {
  const { organizationId, sourceHeaderId, ...others } = params;
  return request(`${prefix}/${organizationId}/round-headers/end-quotation/${sourceHeaderId}`, {
    method: 'POST',
    query: others,
  });
}
/**
 * 核价-比价助手-最新报价-导出
 * @async
 * @function exportLatestOffer
 */
export async function exportLatestOffer(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/rfx/${params.rfxHeaderId}/bargain-assistant/latestOffer/export`,
    {
      method: 'GET',
      responseType: 'text',
    }
  );
}

/**
 * 寻源大厅-创建页面头
 * @async
 * @function fetchCreatedUnitName
 * @returns {object} fetch Promise
 */
export async function fetchCreatedUnitName(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/unit`, {
    method: 'GET',
  });
}
