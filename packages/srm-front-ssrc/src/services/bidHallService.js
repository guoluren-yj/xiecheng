/**
 * service - 寻源平台/询价大厅
 * @date: 2018-12-25
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';
import { HZERO_HWFP, HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 查询配置中心配置
 * @param {String} settingCode - 查询设置项的 code
 */
export async function querySetting(payload) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/batch`, {
    method: 'GET',
    query: payload,
  });
}

/**
 * 招标大厅数据查询
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
  const url = `${prefix}/${organizationId}/bid/list`;
  return request(url, {
    method: 'GET',
    query: { ...param },
  });
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
    `${prefix}/${params.organizationId}/bid/${params.bidHeaderId}/quotation-feedback`,
    {
      method: 'GET',
    }
  );
}

/**
 * 澄清函维护数据查询
 * @async
 * @function fetchMaintainList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchMaintainList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/clarify`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 澄清函引用问题数据查询
 * @async
 * @function fetchClarList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchClarList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/clarify/purchaser-issue`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 澄清函查看list数据查询
 * @async
 * @function fetchClarifyViewDataList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchClarifyViewDataList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/clarify/released`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 澄清函查看问题详情行数据查询
 * @async
 * @function queryIssueLine
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryIssueLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/issue/issue-line`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 澄清函查看问题头数据查询
 * @async
 * @function queryIssueHeader
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryIssueHeader(params) {
  const { organizationId, issueHeaderId } = params;
  return request(`${prefix}/${organizationId}/issue/issue-header/${issueHeaderId}`, {
    method: 'GET',
  });
}
/**
 * 招标大厅维护页面头
 * @async
 * @function fetchInquiryHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchInquiryHeaderDetail(params) {
  const { organizationId, bidHeaderId, path = [], customizeUnitCode } = params;
  let url;
  if (path.includes('quotation-controller')) {
    url = `${prefix}/${organizationId}/bid/${bidHeaderId}?allSelectFlag=1`;
  } else {
    url = `${prefix}/${organizationId}/bid/${bidHeaderId}`;
  }
  return request(url, {
    method: 'GET',
    query: { customizeUnitCode },
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
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/items/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 物品维度头-数据查询
 * @async
 * @function fetchItemDimensionHeader
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchItemDimensionHeader(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/items/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
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
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/suppliers/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 开标入口-数据查询
 * @async
 * @function bidOpenList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function bidOpenList(params) {
  const { organizationId, bidHeaderId } = params;
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/open`, {
    method: 'GET',
  });
}

/**
 * 操作-数据查询
 * @async
 * @function operateBidList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function operateBidList(params) {
  const { organizationId, bidHeaderId } = params;
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/bidding-feedback`, {
    method: 'GET',
  });
}

/**
 * 还比价供应商列表-数据查询
 * @async
 * @function fetchSupplierLineCheckPrice
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchSupplierLineCheckPrice(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/bargain/suppliers`, {
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
  const { organizationId, userId, companyId, categoryId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/suppliers/lovForSupplier`, {
    method: 'GET',
    query: { ...param, organizationId, userId, companyId, categoryId },
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
  const { prequalHeaderId, organizationId, operationType = '', ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/prequal/${prequalHeaderId}/score-indic?operationType=${operationType}`,
    {
      method: 'POST',
      body: otherParams.newParams,
    }
  );
}
/**
 * 评分要素-新增保存
 * @async
 * @function saveScoringElement
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function createApplyToInquiry(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/purchase-requests`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 申请转招标创建前校验API
 * @async
 * @function checkApplyToInquiry
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function checkApplyToInquiry(params) {
  const { organizationId, prLineIdList, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/share/valid-purchase`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { prLineIdList, ...otherParams },
  });
}
/**
 * 开始定标
 * @param {*} params
 */
export async function openScaling(params) {
  const { bidHeaderId, organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/begin-check`, {
    method: 'POST',
    body: { ...otherParams },
  });
}
/**
 *关闭定标
 * @param {} params
 */
export async function closeScaling(params) {
  const { bidHeaderId, organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/close-bid`, {
    method: 'POST',
    body: { ...otherParams },
  });
}
/**
 * 模板明细-数据查询
 * @async
 * @function fetchTempelateDetailData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchTempelateDetailData(params) {
  const { organizationId, isPubPage } = params;
  let url;
  if (isPubPage) {
    url = `${prefix}/${organizationId}/evaluate-indics/hist`;
  } else {
    url = `${prefix}/${organizationId}/evaluate-indics`;
  }
  return request(url, {
    method: 'GET',
    query: params,
  });
}
/**
 * 模板明细-新增保存
 * @async
 * @function saveScoringNoneTempelate
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveScoringNoneTempelate(params) {
  const { organizationId, otherParams, ...other } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics`, {
    method: 'POST',
    query: other,
    body: otherParams,
  });
}
// 专家要素参考模板保存
export async function saveAllScoringTemplate(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics/template-import`, {
    method: 'POST',
    query: others,
  });
}
/**
 * 招标维护-评分要素查询分配专家
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchEvaluateIndicAssign(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-assigns`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 招标维护-评分要素保存分配专家
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveEvaluateIndicAssign(params) {
  const { organizationId, newParams, customizeUnitCode, operationType = '' } = params;
  return request(`${prefix}/${organizationId}/evaluate-indic-assigns`, {
    method: 'POST',
    query: { customizeUnitCode, operationType },
    body: newParams,
  });
}

/**
 * 专家分配-新增保存
 * @async
 * @function saveScoringNoneExpert
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveScoringNoneExpert(params) {
  const { organizationId, evaluateExperts, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-experts`, {
    method: 'POST',
    query: others,
    body: evaluateExperts,
  });
}
/**
 * 模板明细 - 批量删除
 * @async
 * @function deleteScoringNoneTempelate
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteScoringNoneTempelate(params) {
  const { organizationId, remoteDelete } = params;
  return request(`${prefix}/${organizationId}/evaluate-indics`, {
    method: 'DELETE',
    body: remoteDelete,
  });
}
/**
 * 专家分配-数据查询
 * @async
 * @function fetchExpertAllocationData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchExpertAllocationData(params) {
  const { organizationId, isPubPage } = params;
  let url;
  if (isPubPage) {
    url = `${prefix}/${organizationId}/evaluate-experts/hist`;
  } else {
    url = `${prefix}/${organizationId}/evaluate-experts`;
  }
  return request(url, {
    method: 'GET',
    query: params,
  });
}
/**
 * 专家分配 - 批量删除
 * @async
 * @function deleteScoringNoneExpert
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteScoringNoneExpert(params) {
  const { organizationId, remoteDelete } = params;
  return request(`${prefix}/${organizationId}/evaluate-experts`, {
    method: 'DELETE',
    body: remoteDelete,
  });
}
/**
 * 中标结果确认提交
 * @async
 * @function submitWinningResult
 * @param {object} params - 提交条件
 * @returns {object} fetch Promise
 */
export async function submitWinningResult(params) {
  const { organizationId, bidHeaderId, header, quoteLine } = params;
  return request(`${prefix}/${organizationId}/bid/confirm/bid-result/${bidHeaderId}`, {
    method: 'POST',
    body: {
      resultApprovelDTO: {
        bidHeader: header,
        quotationLines: quoteLine,
      },
    },
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
  return request(`${prefix}/${organizationId}/bid/pretrial/back`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 核价/初审全部投标明细-数据查询
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
  return request(`${prefix}/${organizationId}/bid/check`, {
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
  return request(`${prefix}/${organizationId}/bid/pretrial/save`, {
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
  return request(`${prefix}/${organizationId}/bid/pretrial/submit`, {
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
  return request(`${prefix}/${organizationId}/bid/pretrial/deliver`, {
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
  return request(`${prefix}/${organizationId}/bid/check`, {
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
  const { organizationId, bidHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/check/submit`, {
    method: 'POST',
    query: { bidHeaderId },
    body: { ...otherParams, bidHeaderId },
  });
}
// 改变标的规则
export async function changeSubjectMatterRule(params) {
  const { organizationId, bidHeaderId, subjectMatterRule } = params;
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/again`, {
    method: 'POST',
    body: { subjectMatterRule },
  });
}

/**
 * 核价/初审-再次招标
 * @async
 * @function inquiryAgain
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function inquiryAgain(params) {
  const { organizationId, bidHeaderId } = params;
  return request(`${prefix}/${organizationId}/bid/round`, {
    method: 'POST',
    query: { bidHeaderId },
  });
}

/**
 * 预审小组-数据查询
 * @async
 * @function fetchPretrialPanel
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPretrialPanel(params) {
  return request(
    `${prefix}/${params.organizationId}/prequal-members/${params.sourceHeaderId}/${params.sourceFrom}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 预审小组-批量删除
 * @async
 * @function deletePretrialPanel
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deletePretrialPanel(params) {
  return request(`${prefix}/${params.organizationId}/prequal-members`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 预审小组-新增保存
 * @async
 * @function savePretrialPanel
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function savePretrialPanel(params) {
  const { sourceHeaderId, sourceFrom, ...otherParams } = params;
  return request(
    `${prefix}/${params.organizationId}/prequal-members/${sourceFrom}/${sourceHeaderId}`,
    {
      method: 'POST',
      body: otherParams.newDataList,
    }
  );
}

/**
 * 物品明细-新增
 * @async
 * @function saveItemLine
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveItemLine(params) {
  const { bidHeaderId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${otherParams.organizationId}/bid/items`, {
    method: 'POST',
    query: { bidHeaderId, customizeUnitCode },
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
  return request(`${prefix}/${params.organizationId}/bid/items`, {
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
  const { bidHeaderId, ...otherParams } = params;
  return request(`${prefix}/${otherParams.organizationId}/bid/suppliers/${bidHeaderId}`, {
    method: 'POST',
    // query: { bidHeaderId },
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
  return request(`${prefix}/${params.organizationId}/bid/suppliers`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 维护页面 - 保存
 * @async
 * @function savebidHallUpdate
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function savebidHallUpdate(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 维护页面 - 取消
 * @async
 * @function cancelbidHallUpdate
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function cancelbidHallUpdate(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/cancel`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 维护页面 - 发布
 * @async
 * @function releasebidHall
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function releasebidHall(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/release`, {
    method: 'POST',
    query: { customizeUnitCode },
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
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/actions`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 阶梯投标数据查询
 * @async
 * @function fetchLadderLevelyTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchLadderLevelyTable(params) {
  const { organizationId, bidLineItemId } = params;
  return request(`${prefix}/${organizationId}/bid/${bidLineItemId}/ladder-inquiry`, {
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
  return request(`${prefix}/${organizationId}/bid/${quotationLineId}/ladder-inquiry/bargain`, {
    method: 'GET',
  });
}
/**
 * 核价/初审/招投标查询明细阶梯等级数据查询
 * @async
 * @function fetchLadderLevelTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchLadderLevelTable(params) {
  const { organizationId, quotationLineId } = params;
  return request(`${prefix}/${organizationId}/bid/supplier/${quotationLineId}/ladder-quotation`, {
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
  return request(`${prefix}/${organizationId}/bid/thumbnail`, {
    method: 'GET',
    query: { ...otherParams },
  });
}
/**
 * 阶梯投标-新增保存
 * @async
 * @function saveLadderLevel
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveLadderLevel(params) {
  const { bidLineItemId, organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/${bidLineItemId}/ladder-inquiry`, {
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
  return request(`${prefix}/${organizationId}/bid/ladder-inquiry/bargain`, {
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
  return request(`${prefix}/${params.organizationId}/bid/${params.bidLineItemId}/ladder-inquiry`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}
/**
 * bid 创建
 * @async
 * @function createBid
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function createBid(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid`, {
    method: 'POST',
    body: otherParams.values,
  });
}
/**
 * bid 随机选择专家
 * @async
 * @function randomSelection
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function randomSelection(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/evaluate-experts/random`, {
    method: 'POST',
    body: otherParams.values,
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
  return request(`${prefix}/${organizationId}/bid/item-sup-assign`, {
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
  const { organizationId, other } = params;
  return request(`${prefix}/${organizationId}/bid/item-sup-assign`, {
    method: 'POST',
    body: other,
  });
}

/**
 * 开标
 * @param {Array} params - 开标密码
 */
export async function openingBid(params) {
  const organizationId = getCurrentOrganizationId();
  const { bidHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/open`, {
    method: 'POST',
    body: otherParams,
  });
}
/**
 * 下发专家评分
 */
export async function sendExpertScore(params) {
  const organizationId = getCurrentOrganizationId();
  const { bidHeaderId } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/hand-down`, {
    method: 'POST',
  });
}
/**
 * 重发开标密码
 */
export async function resendPassword(params) {
  const { bidHeaderId } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/open/password`, {
    method: 'post',
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
  const { organizationId, bidAllLine } = params;
  return request(`${prefix}/${organizationId}/bid/bargain`, {
    method: 'POST',
    body: bidAllLine,
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
  const { organizationId, bidAllLine } = params;
  return request(`${prefix}/${organizationId}/bid/bargain/submit`, {
    method: 'POST',
    body: bidAllLine,
  });
}

/**
 * 还比价--批量填写还价
 * @async
 * @function inquiryAgain
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function handleSaveCounterOffersBulk(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/bargain/batch`, {
    method: 'POST',
    query: { bidHeaderId },
    body: otherParams,
  });
}

/**
 * 操作招投标
 * @function
 */
export async function quotationControll(params) {
  const { organizationId, type, remark, bidHeaderIds } = params;
  let url;
  if (type === 1) {
    url = `${prefix}/${organizationId}/bid/pause?remark=${remark}`;
  } else if (type === 2) {
    url = `${prefix}/${organizationId}/bid/close?remark=${remark}`;
  } else if (type === 3) {
    url = `${prefix}/${organizationId}/bid/resume`;
  } else if (type === 4) {
    url = `${prefix}/${organizationId}/bid/setting-quotation-end-date?remark=${remark}`;
  }
  return request(url, {
    method: 'POST',
    body: bidHeaderIds,
  });
}

/**
 * fetchMaterial
 * 查询分配物料
 */
export async function fetchMaterial(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/control/items`, {
    method: 'GET',
    query: { ...others },
  });
}

/**
 * saveSupplier
 * 保存供应商数据
 */
export async function saveSupplier(params) {
  const { organizationId, bidHeaderId, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/add-suppliers`, {
    method: 'POST',
    query: { bidHeaderId },
    body: others,
  });
}

/**
 * 招标维护-招标小组
 */
export async function fetchBidMembers(params) {
  const { organizationId, bidHeaderId, customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/bid/members/${bidHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 定标维护 - 评分明细
 */
export async function fetchScoreDetails(params) {
  const { organizationId, evaluateSummaryId } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-summary/summary/${evaluateSummaryId}/indic-detail`,
    {
      method: 'GET',
    }
  );
}
/**
 * 招标小组保存
 *
 * @param {*} params
 * @returns
 */
export async function saveBidMembers(params) {
  const { organizationId, bidHeaderId } = params;
  return request(`${prefix}/${organizationId}/bid/members/${bidHeaderId}`, {
    method: 'POST',
    body: params.newParams,
  });
}

/**
 * 招标小组保存
 *
 * @param {*} params
 * @returns
 */
export async function deleteBidMembers(params) {
  const { organizationId, bidHeaderId } = params;
  return request(`${prefix}/${organizationId}/bid/members/${bidHeaderId}`, {
    method: 'DELETE',
    body: params.newParams,
  });
}

/**
 * 招标大厅-澄清函信息删除
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchClarifyScrapped(params) {
  const { organizationId } = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 招标大厅-澄清函信息发布
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchClarifyRelease(params) {
  const { organizationId, customizeUnitCode } = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify/release`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 招标大厅-澄清函信息新建保存
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchClarifySave(params) {
  const { organizationId, customizeUnitCode } = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 招标大厅-澄清函-获取澄清函详情
 * @async
 * @function clariFydetail
 * @returns {object} fetch Promise
 */
export async function fetchClarifyDetail(params) {
  const { organizationId, clarifyId, customizeUnitCode } = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify/${clarifyId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 招标大厅-澄清函-获取澄清函引用问题
 * @async
 * @function clariFydetail
 * @returns {object} fetch Promise
 */
export async function fetchClarifyReferIssue(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${params.organizationId}/clarify/refer-issue`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 评标管理-招标评标进度条
 * @async
 * @function fetchBidEvalProgress
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchBidEvalProgress(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${params.sourceFrom}/${params.sourceHeaderId}/progress`,
    {
      method: 'GET',
    }
  );
}

/**
 * 评标管理--标段查询
 * @async
 * @function fetchSectionList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSectionList(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${params.sourceFrom}/${params.sourceHeaderId}/section`,
    {
      method: 'GET',
    }
  );
}

/**
 * 评标管理--分标段/不分标段-供应商查询
 * @async
 * @function fetchSupplierList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSupplierList(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${params.sourceFrom}/${params.sourceHeaderId}/section-supplier`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 评标管理--标段--专家查询
 * @async
 * @function fetchExpertList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchExpertList(params) {
  const organizationId = getCurrentOrganizationId();
  const { sourceFrom, sourceHeaderId, ...others } = params;
  const param = parseParameters(others);
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${sourceFrom}/${sourceHeaderId}/section-expert`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 评标管理-单个专家-评分信息查询
 * @async
 * @function fetchExpertScoreInfo
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchExpertScoreInfo(params) {
  const organizationId = getCurrentOrganizationId();
  const { sourceFrom, sourceHeaderId, evaluateExpertIds, ...otherParams } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${sourceFrom}/${sourceHeaderId}/score/expert/${evaluateExpertIds}`,
    {
      method: 'GET',
      query:
        otherParams.bidLineItemId === 'flag'
          ? { customizeUnitCode: otherParams.customizeUnitCode }
          : otherParams,
    }
  );
}

/**
 * 评标管理-重新评分
 * @async
 * @function reScoring
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function reScoring(params) {
  const { evaluateScoreIds = [] } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/rescore`, {
    method: 'POST',
    body: { evaluateScoreIds },
  });
}

/**
 * 评分管理-单个专家-供应商评分细项查询
 * @async
 * @function fetchScoreLine
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchScoreLine(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/score-line`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 评标管理-标段-评分汇总保存
 * @async
 * @function saveEvaluateSummary
 * @returns {object} fetch Promise
 */
export async function saveEvaluateSummary(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/save`, {
    method: 'POST',
    body: params.list,
  });
}

// 评分管理-整单提交-并且发起多轮报价或开始评分
export async function submitEvaluateSummaryStartQuotationScore(params = {}) {
  const { organizationId, summaryList = [], startRoundFlag } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/round-submit`, {
    method: 'POST',
    query: { startRoundFlag },
    body: summaryList,
  });
}

// 评分管理-整单提交-并且发起多轮报价或开始评分-分标段
export async function submitEvalSumRoundQuotationOrScoringSection(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/round-submit-section`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 评标管理-整单提交
 * @async
 * @function
 * @returns {object} fetch Promise
 */
export async function submitEvaluateSummary(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/submit`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 评标管理-全部重新评分
 * @param {*} params
 */
export async function reScoringAll(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/all-rescore`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 符合性检查确认-全部重新评分
 * @param {*} params
 */
export async function reviewRescoringAll(params) {
  const { organizationId: orgId, ...otherParams } = params;
  return request(`${prefix}/${orgId}/evaluate-summary/all-re-review`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 招标大厅-定标-供应商头
 * @async
 * @function fetchSupplierDimensionHeader
 * @returns {object} fetch Promise
 */
export async function fetchSupplierDimensionHeader(params) {
  const { bidHeaderId } = params;
  const param = parseParameters(params);
  return request(`${prefix}/${params.organizationId}/bid/suppliers/${bidHeaderId}/detail`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 定标--单独查询物料行
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
  return request(`${prefix}/${organizationId}/bid/quotation/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 定标--单独查询物料行
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
  return request(`${prefix}/${organizationId}/bid/quotation/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 定标--区分标段单独查询物料行
 * @async
 * @function fetchAllLine
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
 * 确认中标候选人 - 获取标段下供应商详情
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
 * 确认中标候选人 - 获取标段下供应商的评分明细
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
 * 确认中标候选人 - 保存
 *
 * @export
 * @param {*} params
 * @returns
 */
export function saveBidCandidate(params) {
  const { organizationId, data, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/pre/save`, {
    method: 'POST',
    body: { ...data, ...others },
  });
}

/**
 * 确认中标候选人 - 提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export function submitBidCandidate(params) {
  const { organizationId, data, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/pre/submit`, {
    method: 'POST',
    body: { ...data, ...others },
  });
}

/**
 * 定标管理 - 保存
 *
 * @export
 * @param {*} params
 * @returns
 */
export function saveCalibrationManagNot(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/evaluate/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: [others],
  });
}

/**
 * 定标管理 - 不区分标段提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export function validateBeforeSubmit(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/evaluate/submit-validate`, {
    method: 'POST',
    body: [others],
  });
}

/**
 * 定标管理 - 提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export function submitCalibrationManagNot(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/evaluate/submit`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: [others],
  });
}
/**
 * 评分管理
 *
 * @export
 * @param {*} params
 * @returns
 */
export function fetchBidEvaluateExpertScoring(params) {
  const { organizationId, sourceFrom, sourceHeaderId, ...others } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${sourceFrom}/${sourceHeaderId}/expert`,
    {
      method: 'GET',
      query: others,
    }
  );
}
/**
 * 定标管理分标段查询供应商数据
 *
 * @export
 * @param {*} params
 * @returns
 */
export function queryCalibMangeYes(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/evaluate`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 定标管理区分标段 - 保存
 *
 * @export
 * @param {*} params
 * @returns
 */
export function saveCalibrationManagYes(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/evaluate/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others.lineSupplierSaveDTOS,
  });
}

/**
 * 定标管理 - 区分标段提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export function validateDiffBeforeSubmit(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/evaluate/submit-validate`, {
    method: 'POST',
    body: others.lineSupplierSaveDTOS,
  });
}

/**
 * 定标管理区分标段 - 提交
 *
 * @export
 * @param {*} params
 * @returns
 */
export function submitCalibrationManagYes(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/bid/evaluate/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others.lineSupplierSaveDTOS,
  });
}

/**
 * 供应商维度查询
 *
 * @export
 * @param {*} params
 * @returns
 */
export function getSupplierList(params) {
  const { organizationId, sourceFrom, sourceHeaderId } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-summary/${sourceFrom}/${sourceHeaderId}/supplier`,
    {
      method: 'GET',
    }
  );
}

/**
 *
 *  查询澄清管理列表
 * @export
 * @param {*} params
 * @returns
 */
export function fetchClarifyNotifyDataList(params) {
  const organizationId = getCurrentOrganizationId();
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
 * 创建评标问题头查询
 * @async
 * @function fetchBidIssueHeader
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchBidIssueHeader(params) {
  const organizationId = getCurrentOrganizationId();
  const { sourceFrom, sourceHeaderId, quotationHeaderId } = params;
  return request(
    `${prefix}/${organizationId}/clarify-notify/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 创建评标问题头查询
 * @async
 * @function fetchClarifyIssueHeader
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function fetchClarifyIssueHeader(params) {
  const organizationId = getCurrentOrganizationId();
  const { clarifyNotifyId } = params;
  return request(`${prefix}/${organizationId}/clarify-notify/${clarifyNotifyId}`, {
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
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/clarify-issue`, {
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
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/clarify-issue`, {
    method: 'DELETE',
    body: params.clarifyIssues,
  });
}

/**
 * 评审澄清保存问题
 * @async
 * @function saveQuestRowLine
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function saveQuestRowLine(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, issueFrom, ...otherParams } = params;
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/clarify-issue/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/${issueFrom}`,
    {
      method: 'POST',
      body: otherParams.clarifyIssues,
    }
  );
}

/**
 * 保存问题
 * @async
 * @function saveQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function saveQuestion(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, ...otherParams } = params;
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/clarify-notify/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/leader`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}
/**
 * 提交评审澄清问题
 * @async
 * @function submitQuestion
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function submitQuestion(params) {
  const { sourceFrom, sourceHeaderId, quotationHeaderId, ...otherParams } = params;
  const organizationId = getCurrentOrganizationId();
  return request(
    `${prefix}/${organizationId}/clarify-notify/${sourceHeaderId}/${sourceFrom}/${quotationHeaderId}/release`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

/**
 * 评审澄清通知单删除
 * @async
 * @function deleteNotice
 * @param {object} params - 请求参数
 * @returns {object}
 */
export async function deleteNotice(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/clarify-notify`, {
    method: 'DELETE',
    body: params.questionInformationHeader,
  });
}

/**
 * 招标大厅-单个标段信息查询
 * @async
 * @function fetchSectionDetailData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSectionDetailData(params) {
  const { bidHeaderId, sectionId } = params;
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSRC}/v1/${organizationId}/bid/items/${bidHeaderId}/sections/${sectionId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 新建/更新单个标段信息
 * @async
 * @function saveSectionDetailData
 * @param {Object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function saveSectionDetailData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/bid/items/${params.bidHeaderId}/section`, {
    method: 'POST',
    body: { ...params.values },
  });
}

/**
 * 查询某个标书下面的所有标段信息
 * @async
 * @function fetchMoveSectionData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchMoveSectionData(params) {
  const { bidHeaderId, ...others } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/items/${bidHeaderId}/section`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 移到其它标段操作
 * @async
 * @function moveOtherSectionData
 * @param {Object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function moveOtherSectionData(params) {
  const { bidHeaderId, ...otherParams } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/bid/items/${bidHeaderId}/section/change`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 删除某个标段
 * @async
 * @function deleteTabPane
 * @param {Object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteTabPane(params) {
  const { bidHeaderId, sectionId } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/bid/items/${bidHeaderId}/sections/${sectionId}`, {
    method: 'DELETE',
  });
}

/**
 * 改变招标大厅寻源模板获取招标大厅维护头
 * @async
 * @function fetchChangeTemplateData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchChangeTemplateData(params) {
  const { bidHeaderId, sourceTemplateId } = params;
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/source-template/${sourceTemplateId}/change`,
    {
      method: 'POST',
    }
  );
}

/**
 * 改变招标大厅公司获取公司信息
 * @async
 * @function changeCompany
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function changeCompany(params) {
  const { bidHeaderId, ...otherParams } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/changeCompany`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 招标大厅-创建页面头
 * @async
 * @function fetchCreatedUnitName
 * @returns {object} fetch Promise
 */
export async function fetchCreatedUnitName(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/user`, {
    method: 'GET',
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
 *  供应商物品行报价明细查询
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchItemSupplierLineQuotationDetail(params) {
  // const { rfxHeaderId, quotationHeaderId, rfxLineItemId, sourceFrom } = params;
  // return request(
  //   `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/${rfxHeaderId}/${quotationHeaderId}/${rfxLineItemId}/supQuotationDetails`,
  //   {
  //     method: 'GET',
  //     query: { sourceFrom },
  //   }
  // );
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/quotationTemplate/view`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 *  确认及汇总 - 导出
 * @export
 * @param {*} params
 * @returns
 */
export async function exportData(params) {
  return request(
    `${SRM_SSRC}/v1/${params.organizationId}/evaluate-summary/${params.sourceFrom}/${params.sourceHeaderId}/export`,
    {
      responseType: 'text',
    }
  );
}

/** 立项转招投标创建
 * @param {*} params
 * @returns
 */
export async function sourcingItemCreate(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/project-application`, {
    method: 'POST',
    body: otherParams,
  });
}

// 核价-汇率编辑-供应商查询
export function querySupplierExchangeEdit(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/exchange-rate`, {
    method: 'GET',
    query: otherParams,
  });
}

// 核价-汇率编辑-保存
export function saveExchangeEdit(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/exchange-rate`, {
    method: 'POST',
    body: otherParams.newParams,
  });
}

// 寻源事项查询
export function fetchMatterRequireFlag(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/source-matter-conf/detail`, {
    method: 'GET',
    query: otherParams,
  });
}

// 查询审批历史记录
export async function fetchHistoryApproval(params) {
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/activiti/task/historyApproval`, {
    method: 'POST',
    query: params,
  });
}

// 转交定标
export async function transferCalibration(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/bid/transfer`, {
    method: 'POST',
    body: params,
  });
}

// 定标_物料补充数据查询
export async function queryCenterPopData(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/no-code-item`, {
    method: 'GET',
    query: filterNullValueObject(otherParams),
  });
}

// 定标_物料补充数据保存
export async function saveCenterPopData(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/no-code-item`, {
    method: 'POST',
    body: otherParams.paramData,
  });
}

// 查询招标的一些附件
export async function bidProcessAttachments(params) {
  const param = parseParameters(params);
  const { organizationId, bidHeaderId, ...otherParams } = param;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/list/attachments/${bidHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}

// 评标阶段  评分明细
export async function bidEvaluationDetails(params) {
  const param = parseParameters(params);
  const { organizationId, bidHeaderId, ...otherParams } = param;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/score/detail`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 确认RFX候选人 - 获取标段下供应商的评分明细
 *
 * @export
 * @param {*} params
 * @returns
 */
export function fetchSumScore(params) {
  const { organizationId, evaluateSummaryId } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-summary/summary/${evaluateSummaryId}/indic-detail/two`,
    {
      method: 'GET',
    }
  );
}

/**
 * 寻源模板详情查看
 * @async
 */
export async function queryRfxTemplateDetail(params) {
  return request(`${prefix}/${params.tenantId}/source-template/${params.templateId}`, {
    method: 'GET',
  });
}

/**
 * 查询个性化相关配置
 * @async
 * @param {Object} params - 查询参数
 * @returns {Promise} - fetch promise
 */
export async function queryUnitCustConfig(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-customize`, {
    query: otherParams,
    method: 'GET',
  });
}

/**
 * 查询价格服务涨跌幅/最低价/最新价
 * @async
 * @param {Object} params - 查询参数
 * @param {Object} [params.quotationDetail] - 报价信息
 * @returns {Promise} - fetch promise
 */
export async function queryPriceInfo(params = {}) {
  const { organizationId, quotationDetail } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/check/item/price-lib-services/convert-price`,
    {
      method: 'POST',
      body: quotationDetail,
    }
  );
}

/**
 * 符合性检查_保存 - 初步评审
 * @async
 * @function saveReviewEvaluateSummary
 * @returns {object} fetch Promise
 */
export async function saveReviewEvaluateSummary(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/review/save`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 符合性检查_提交 - 初步评审
 * @async
 * @function
 * @returns {object} fetch Promise
 */
export async function submitReviewEvaluateSummary(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/review/submit`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 符合性检查要素列表查询 - 初步评审
 * @async
 * @function
 * @returns {Object} fetch Promise
 */
export async function queryReviewElements(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-indics/review`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 投标汇总查询导出报价行Excel
 * @async
 */
export async function exportSupplierQuotationLines(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/bid/quotation/summary/export`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 参考价
 * @export
 * @param {Object} params
 */
export async function priceList(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/share/application/reference-price`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 定标管理-查看ip重合率
 * @async
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function fetchBidIPCoincidenceRate(params) {
  const { bidHeaderId } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/bid/${bidHeaderId}/ip`, {
    method: 'GET',
  });
}

// 整包中标
export function wholePackage(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/suppliers/single`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 查询是否可新增物料供应商
 * @param {*} params 寻源类别 (RFQ/询价|RFA/竞价|BID/招投标)
 */
export async function allowAddItemSupplier(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/apply-to-source-control/get-config`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 配置表-查询寻源方式, 是否可以选择 `全平台公开`
 * */
export async function fetchSourceMethodConfig(params = {}) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/rel-table-records/ssrc_source_method_all_open/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}
