/**
 * service - 寻源平台/询价大厅
 * @date: 2018-12-25
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC, SRM_PLATFORM, SRM_SPC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
import { isArray } from 'lodash';

import { PrefixV2 } from '@/utils/globalVariable';

const { HZERO_PLATFORM } = getEnvConfig();
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const commonOrganizationId = getCurrentOrganizationId();

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
  } else if (path.indexOf('quotation-controller') > -1) {
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
  const newParmas = parseParameters(other);
  return request(`${prefix}/${organizationId}/rfx/items/${rfxHeaderId}/codeless`, {
    method: 'GET',
    query: { ...newParmas },
  });
}

// 核价中心弹窗保存
export async function pricingSave(params) {
  const { organizationId, rfxHeaderId, customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/rfx/items/${rfxHeaderId}/codeless`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: params,
  });
}

// 核价中心弹窗分页保存
export async function pricingChangePageSave(params) {
  const { organizationId, rfxHeaderId, customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/rfx/item-snap/${rfxHeaderId}/codeless`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
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
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/hand-down`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 新开标-专家评分
 * @async
 * @function sendExpertScore
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function sendOpenedExpertScore(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/round-headers/${rfxHeaderId}/opened/begin-score`, {
    method: 'POST',
    query: otherParams,
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
    body: {
      rfxHeaderIds: [rfxHeaderId],
    },
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
  const { organizationId, rfxHeaderId, rfxStatus } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/next`, {
    method: 'POST',
    body: { rfxStatus },
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
 * 操作-开始下一个状态
 * @async
 * @function startNextRfxStatus
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function startNextRfxStatus(params) {
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
  const { organizationId, rfxHeaderId, customizeUnitCode, path = null, ...others } = params;
  let url;
  if (path && path.includes('quotation-controller')) {
    url = `${prefix}/${organizationId}/rfx/${rfxHeaderId}?allSelectFlag=1`;
  } else {
    url = `${prefix}/${organizationId}/rfx/${rfxHeaderId}`;
  }
  return request(url, {
    method: 'GET',
    query: { customizeUnitCode, ...others },
  });
}

/**
 * RF页面头
 * @async
 * @function fetchRFHeader
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchRFHeader(params) {
  const { organizationId, sourceHeaderId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/rf/${sourceHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode, ...others },
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
 * 询价监控台头信息
 * @async
 * @function fetchMonitorHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchMonitorHeaderDetail(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/simple/${rfxHeaderId}`, {
    method: 'GET',
    query: {
      ...otherParams,
    },
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
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/items`, {
    method: 'GET',
    query: {
      ...param,
    },
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
  const { rfxHeaderId, organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/items`, {
    method: 'POST',
    query: {
      rfxHeaderId,
      customizeUnitCode,
    },
    body: otherParams.newParameters,
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
 * 采购商物品行报价明细查询
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
 * 采购方物料报价明细重构
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchQuotationDetail(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/quotationTemplate/view`, {
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
  const { organizationId, rfxLineSupplierId, customizeUnitCode, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/check`, {
    method: 'GET',
    query: { ...param, rfxLineSupplierId, customizeUnitCode },
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
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/check`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
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
  const { organizationId, rfxHeaderId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/check/submit`, {
    method: 'POST',
    query: { rfxHeaderId, customizeUnitCode },
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
export async function fetchIPCoincidenceRate(params = {}) {
  const { rfxHeaderId, ...others } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/rfx/quotation/${rfxHeaderId}/Ip`, {
    method: 'GET',
    query: others,
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
 * 供应商资质查询
 * @async
 * @function supplierAttachment
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function supplierAttachment(params) {
  const { organizationId, companyId, rfxHeaderId, newParams } = params;
  if (!organizationId || !companyId) {
    return;
  }

  return request(`${prefix}/${organizationId}/rfx/suppliers/${companyId}/getSupExpirAttachment`, {
    method: 'POST',
    query: {
      rfxHeaderId,
    },
    body: newParams,
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
  const { rfxHeaderId, tenantId, ...otherParams } = params;
  return request(`${prefix}/${otherParams.organizationId}/rfx/suppliers`, {
    method: 'POST',
    query: {
      rfxHeaderId,
      tenantId: otherParams.organizationId,
    },
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
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
    headers: {
      's-request-web': 'srm_web',
    },
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
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/release`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 操作记录数据查询
 * @async
 * @function fetchOperation
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
  const { organizationId, rfxLineItemId, customizeUnitCode = '' } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxLineItemId}/ladder-inquiry`, {
    method: 'GET',
    query: { customizeUnitCode },
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
  const { organizationId, quotationLineId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`, {
    method: 'GET',
    query: {
      ...otherParams,
    },
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
  const { rfxLineItemId, organizationId, customizeUnitCode = '', ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxLineItemId}/ladder-inquiry`, {
    method: 'POST',
    query: { customizeUnitCode },
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
 * 线下议价- 阶梯还价-保存
 * @async
 * @function
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveBarginLadderLevelOffline(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/ladder-inquiry/offline-bargain`, {
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
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx`, {
    method: 'POST',
    query: { customizeUnitCode },
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
  return request(`${prefix}/${params.organizationId}/rfx/members/${params.rfxHeaderId}`, {
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
  return request(`${prefix}/${params.organizationId}/rfx/members/${params.rfxHeaderId}`, {
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
  return request(`${prefix}/${params.organizationId}/rfx/members/${params.rfxHeaderId}`, {
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
export async function supplierRelationMap(params = {}) {
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

// 供应商关系图谱
export async function supplierRelationMapNew(params = {}) {
  const { organizationId, querys = {}, data = [] } = params || {};
  return request(`${prefix}/${organizationId}/monitor/enterprise-relation-mining-integration`, {
    method: 'POST',
    body: data,
    query: querys,
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
 * 二次开标
 * @param {Array} params - 开标密码
 */
export async function openingSecBid(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/second/open`, {
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
  const { organizationId, rfxAllLine, ...queryParams } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain`, {
    method: 'POST',
    query: queryParams,
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
  const { organizationId, rfxAllLine, ...queryParams } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/submit`, {
    method: 'POST',
    query: queryParams,
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
    url = `${prefix}/${organizationId}/rfx/close`;
  } else if (type === 3) {
    url = `${prefix}/${organizationId}/rfx/resume`;
  } else if (type === 4) {
    url = `${prefix}/${organizationId}/rfx/setting-quotation-end-date?remark=${remark}`;
  }
  if (type === 2) {
    return request(url, {
      method: 'POST',
      body: {
        rfxHeaderIds,
        terminatedRemark: remark,
      },
    });
  } else {
    return request(url, {
      method: 'POST',
      body: rfxHeaderIds,
    });
  }
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

export async function createPurchaseRequest(params) {
  const { organizationId, ...param } = params;
  return request(`${prefix}/${organizationId}/rfx/application-current-rfx`, {
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
  const { organizationId, prLineIdList, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/share/valid-purchase`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { prLineIdList, ...otherParams },
  });
}

/**
 * 新申请转询价创建前校验API
 * @async
 * @function newBatchValidatePurchase
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function newBatchValidatePurchase(params) {
  const { organizationId, prLineIdList, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/share/batch-valid-purchase`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { prLineIdList, ...otherParams },
  });
}

/**
 * 查询风险扫描 校验
 * @param {*} params
 */
export async function validateRiskScan(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/monitor/riskScan-validate`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 请求风险扫描
 */
export async function linkRiskScan(params) {
  const organizationId = getCurrentOrganizationId();
  const domainUrl = `${window.location.protocol}//${window.location.hostname}`;
  const { ...other } = params;
  return request(`${prefix}/${organizationId}/monitor/riskScan/integrate`, {
    method: 'GET',
    query: { domainUrl, ...other },
    responseType: 'text',
  });
}

/**
 * 成交候选人节点 是否生成评分报告 强弱校验
 */
export async function validateRfxCandidate(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/pre/submit-validate`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 成交候选人节点 开启招标文件管理-生成评分报告
 */
export async function createNewTemplateReport(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/score-rpt/print/preview`, {
    method: 'POST',
    query: others,
    headers: {
      Accept: 'text/html',
      'Content-Type': 'text/html; charset=utf-8',
      credentials: 'include',
    },
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
  const { organizationId, data, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/pre/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
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
  const { organizationId, customizeUnitCode, data, ...others } = params;
  return request(`${prefix}/${organizationId}/evaluate-summary/pre/save`, {
    method: 'POST',
    query: { customizeUnitCode },
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
  const { organizationId, evaluateSummaryId } = params;
  return request(
    `${prefix}/${organizationId}/evaluate-summary/summary/${evaluateSummaryId}/indic-detail/two`,
    {
      method: 'GET',
    }
  );
}

/**
 * 改变询价大厅公司清空对应物品供应商数据
 * @async
 * @function changeCompany
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

/**
 * 改变询价大厅公司清空对应业务实体-新
 * @async
 * @function newChangeCompany
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function newChangeCompany(params) {
  const { organizationId, rfxHeaderId, ...others } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/${rfxHeaderId}/change-company`, {
    method: 'POST',
    body: { ...others },
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

// 获取多轮报价全部报价Tab报价数据
export function fetchAllRoundQuotationList(params) {
  const { organizationId, sourceHeaderId, supplierCompanyId, rfxLineItemId, ...others } = params;
  const pageParmas = parseParameters(others);
  return request(
    `${prefix}/${organizationId}/round-headers/${sourceHeaderId}/all-quotation-details`,
    {
      method: 'GET',
      query: {
        supplierCompanyId,
        rfxLineItemId,
        ...pageParmas,
      },
    }
  );
}

// 获取多轮报价供应商Tab报价数据
export function fetchSupplierRoundQuotationList(params) {
  const { organizationId, sourceHeaderId, ...others } = params;
  const otherParams = parseParameters(others);
  return request(
    `${prefix}/${organizationId}/round-headers/${sourceHeaderId}/supplier-quotations`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

// 获取多轮报价物料Tab报价数据
export function fetchItemLineRoundQuotationList(params) {
  const { organizationId, sourceHeaderId, ...others } = params;
  const otherParams = parseParameters(others);
  return request(`${prefix}/${organizationId}/round-headers/${sourceHeaderId}/item-details`, {
    method: 'GET',
    query: otherParams,
  });
}

// 多轮报价 创建新一轮报价
export function createNewRoundQuotation(params) {
  const { organizationId, sourceHeaderId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/round-headers/start-quotation/${sourceHeaderId}`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: others,
  });
}

// 多轮报价 创建新一轮报价-批量
export function batchCreateNewRoundQuotation(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/round-headers/section/start-quotation`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: others,
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

// 多轮报价，确定终轮报价结束-批量
export function batchSureRoundQuotationEnd(params = {}) {
  const { organizationId, projectLineSectionList, ...others } = params;
  return request(`${prefix}/${organizationId}/round-headers/section/end-quotation`, {
    method: 'POST',
    query: others,
    body: projectLineSectionList,
  });
}

/**
 * 寻源大厅-创建页面头
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
 * 评分要素细项-行-查询
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchElementsDetailLine(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/score-indicate`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 评分要素细项-行-删除
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function deleteElementsDetail(params) {
  let otherParams;
  let operationTypeStr;
  if (Object.prototype.toString.call(params) === '[object Object]') {
    const { operationType, ...otherProps } = params;
    otherParams = Object.values(otherProps).length ? Object.values(otherProps)[0] : [];
    operationTypeStr = operationType;
  } else {
    otherParams = params;
  }
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/score-indicate?operationType=${operationTypeStr}`,
    {
      method: 'DELETE',
      body: otherParams,
    }
  );
}

/**
 * 评分要素细项-行-保存
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveElementsDetail(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/evaluate-indics/two`, {
    method: 'POST',
    query: {
      customizeUnitCode,
    },
    body: otherParams,
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
  const { organizationId, rfxHeaderId, ...others } = params;
  const param = parseParameters(others);
  return request(`${prefix}/${organizationId}/rfx/simple/${rfxHeaderId}`, {
    method: 'GET',
    query: param,
  });
}

// header simple approval 简单头查询工作流审批
export function fetchHeaderInfoApproval(params) {
  const { organizationId, rfxHeaderId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/snap/simple/${rfxHeaderId}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 进入议议价
 *
 * @export
 * @param {*} params
 * @returns
 */
export function fetchOpenBargain(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/bargain/open`, {
    method: 'POST',
    query: others,
  });
}

/**
 * demo - 导出pdf
 */
export function exportPdf(params) {
  return request(`${prefix}/${params.organizationId}/rfx/pdf/demo`, {
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 核价-导出
 */
export function exportCheckPriceData(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/check/export`, {
    method: 'GET',
    query: others,
    responseType: 'text',
  });
}

/** 立项转招寻源创建
 * @param {*} params
 * @returns
 */
export function sourcingCreate(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/project-application`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 立项转整单线下
 * @param {*} params
 * @returns
 */
export function projectToWholeCreate(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/offline-whole/project-application`, {
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
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/exchange-rate`, {
    method: 'POST',
    body: otherParams.newParams,
  });
}

// rfx明细 资格预审 预审头信息
export function prequalDetailHeaderInInquiryDetail(params = {}) {
  const { organizationId, sourceFrom, sourceHeaderId, customizeUnitCode } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/prequal/${sourceFrom}/${sourceHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode, permissionFilterFlag: params?.permissionFilterFlag || 0 },
  });
}

// rfx明细 资格预审 预审详情
export function prequalDetailInInquiryDetail(params = {}) {
  const { organizationId, sourceFrom, sourceHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SSRC}/v1/${organizationId}/prequal/${sourceFrom}/${sourceHeaderId}/lines`, {
    method: 'GET',
    query: { ...param },
  });
}

// rfx明细 报价中 报价详情
export function quotationDetailInInquiryDetail(params = {}) {
  const { organizationId, sourceHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/${sourceHeaderId}/quotation/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

// rfx明细 报价中 报价详情-工作流流程接口
export function quotationDetailInInquiryDetailApproval(params = {}) {
  const { organizationId, sourceHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/snap/${sourceHeaderId}/quotation/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

// rfx明细 进度条查询
export function fetchRfxDetailProcessAll(params = {}) {
  const { organizationId, sourceHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/${sourceHeaderId}/progress/all`, {
    method: 'GET',
    query: otherParams,
  });
}

// rfx明细 横竖版布局查询
export function fetchRfxDetailLayout(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/user-config`, {
    method: 'GET',
    query: otherParams,
  });
}

// rfx明细 横竖版布局改变
export function changeRfxDetailLayout(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/user-config`, {
    method: 'POST',
    body: otherParams,
  });
}

// 选用理由保存
export function saveSuggestedRemark(params = {}) {
  const { organizationId, queryParams = {}, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/suppliers/single`, {
    method: 'POST',
    query: queryParams,
    body: otherParams,
  });
}

// 寻源小组查询
export function fetchInquiryGroup(params = {}) {
  const { rfxHeaderId, organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/members/${rfxHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 寻源小组保存
 *
 * @param {*} params
 * @returns
 */
export async function saveInquiryGroup(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/members/${rfxHeaderId}`, {
    method: 'POST',
    body: params.newParams,
  });
}

/**
 * 寻源小组删除
 *
 * @param {*} params
 * @returns
 */
export async function deleteInquiryGroup(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/rfx/members/${rfxHeaderId}`, {
    method: 'DELETE',
    body: params.newParams,
  });
}

// 完成状态寻源单回退至核价状态
export function backToCheckPrice(params = {}) {
  const { organizationId, rfxHeaderId, ...othersParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/check/rollback/${rfxHeaderId}`, {
    method: 'POST',
    query: othersParams,
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

/**
 * 招标公告详情查询
 * @export
 * @function fetchTenderNotice
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchTenderNotice(params = {}) {
  const { organizationId, sourceFrom, sourceType, sourceHeaderId, ...others } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/source-notices/${sourceFrom}/${sourceType}/${sourceHeaderId}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 招标公告预览查询
export async function previewTenderNotice(params) {
  const { organizationId, sourceFrom, sourceType, sourceHeaderId } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/source-notices/${sourceFrom}/${sourceType}/${sourceHeaderId}/preview`,
    {
      method: 'GET',
    }
  );
}

/**
 * 中标公告发布
 * @export
 * @function publishWInnerBidNotice
 * @param {Object} params 查询参数
 * @returns
 */
export async function publishWInnerBidNotice(params) {
  const { organizationId, data = {}, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/source-notice-rule/release`, {
    method: 'POST',
    query: otherParams,
    body: data,
  });
}

/**
 * 中标公告发布校验
 * @export
 * @function BidNoticeValidateBeforePublish
 * @param {Object} params 查询参数
 * @returns
 */
export async function BidNoticeValidateBeforePublish(params) {
  const { organizationId, data = {}, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/source-notice-rule/validate`, {
    method: 'POST',
    query: otherParams,
    body: data,
  });
}

/**
 * 中标公告保存
 * @param {Object} params 查询参数
 * @returns
 */
export async function saveWInnerBidNotice(params) {
  const { organizationId, data, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/source-notice-rule`, {
    method: 'POST',
    query: otherParams,
    body: data,
  });
}

/**
 * 中标公告查询
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchWInnerBidNotice(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/source-notice-rule`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 中标公告预览
 * @param {Object} params 查询参数
 * @returns
 */
export async function previewWInnerBidNotice(params) {
  const { organizationId, sourceFrom, noticeType, sourceHeaderId, ...otherParams } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/source-notices/accepted/${sourceFrom}/${noticeType}/${sourceHeaderId}/preview`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 *
 * /v1/{organizationId}/source-notice-rule/release
 * /v1/{organizationId}/source-notice-rule  get 查询
 * /v1/{organizationId}/source-notice-rule post 保存
 * /v1/{organizationId}/source-notices/accepted/{sourceFrom}/{sourceType}/{sourceHeaderId}/preview
 *
 * */

// 复制历史单据确定的回调
export function copyHistoryOrderModal(params = {}) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/copy-history/${rfxHeaderId}`, {
    method: 'POST',
    body: { ...otherParams },
  });
}

/**
 * 批量修改核价行
 * @param {Object} params 查询参数
 * @returns
 */
export async function batchEditQuotationLine(params) {
  const { organizationId, data = {} } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/check/batch-quotation-line`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 核价提交前校验
 * @param {Object} params 校验的数据
 */
export async function validateBeforeSubmit(params) {
  const { organizationId, rfxHeaderId, customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/check/submit-validate`, {
    method: 'POST',
    query: { rfxHeaderId, customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 查询是否可新增物料
 * @param {*} params 寻源类别 (RFQ/询价|RFA/竞价|BID/招投标)
 */
export async function allowAddItems(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/apply-to-source-control/get-config`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 全部报价明细批量维护选用理由
 * @param {*} params 传递的参数 选用理由
 */
export async function batchChangeChooseReson(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/check/batch/remark`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 全部报价明细选择策略
 * @param {*} params 传递的参数 选择策略
 */
export async function batchChangeChooseStrategy(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/check/batch`, {
    method: 'POST',
    body: params,
  });
}

// 物料行批量维护
export async function batchMaintainItemLine(params = {}) {
  const { organizationId, customizeUnitCode = null, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/items/part-of-field/batch-update`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

// 物料报价行批量维护
export async function batchMaintainItemQuotationLine(params = {}) {
  const { organizationId, customizeUnitCode = null, ...others } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/lines/part-of-field/batch-update`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: others,
    }
  );
}

// 供应商报价-报价行-批量维护
export async function quotationLineBatchMaintain(params = {}) {
  const { organizationId, querys = {}, ...others } = params;
  return request(
    `${SRM_SSRC}/v2/${organizationId}/rfx/quotation/lines/part-of-field/batch-update`,
    {
      method: 'POST',
      query: querys,
      body: others,
    }
  );
}

// 物料报价行批量维护
export async function fetchMonitorSupplierLine(params = {}) {
  const parseParam = parseParameters(params);
  const { rfxHeaderId, organizationId, ...otherParams } = parseParam;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/monitor/supplier/list`, {
    method: 'GET',
    query: otherParams,
  });
}

// 开始竞价
export async function startRFA(params = {}) {
  const { rfxHeaderId, organizationId } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/monitor/RFA/start`, {
    method: 'POST',
  });
}

// 签到
export async function signIn(params = {}) {
  const { quotationHeaderId, organizationId } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/sign/${quotationHeaderId}`, {
    method: 'POST',
  });
}

// 核价翻页保存
export async function turnPageSave(params = {}) {
  const { organizationId, checkPriceDTOLineList } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/save-check`, {
    method: 'POST',
    body: checkPriceDTOLineList,
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
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-services/convert-price`, {
    method: 'POST',
    body: quotationDetail,
  });
}

/**
 * 查询价格服务涨跌幅/最低价/最新价
 * @async
 * @param {Object} params - 查询参数
 * @param {Object} [params.quotationDetail] - 报价信息
 * @returns {Promise} - fetch promise
 */
export async function queryCheckPriceInfo(params = {}) {
  const { organizationId, quotationDetail } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/check/item/price-lib-services/convert-price`,
    {
      method: 'POST',
      body: quotationDetail,
    }
  );
}

// 查询寻源附件
export async function processAttachments(params) {
  const param = parseParameters(params);
  const { organizationId, rfxHeaderId, ...otherParams } = param;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/process-attachment/download-query`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

// 下载附件
export async function fetchDetailAttachments(params) {
  const param = parseParameters(params);
  const { organizationId, rfxHeaderId, ...otherParams } = param;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/process-attachment/download-line-query`,
    {
      method: 'GET',
      query: otherParams,
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
  const { customizeUnitCode } = params || {};
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/review/save`, {
    method: 'POST',
    query: { customizeUnitCode },
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
  const { customizeUnitCode } = params || {};
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/review/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params.list,
  });
}

// 打印
export async function queryPrint(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/quotation/inquiry-approval/report/pdf`, {
    method: 'GET',
    query: otherParams,
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
 * 专家评分转发
 * @param {*} params ids
 */
export async function transfer(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/rfx/open/deliver`, {
    method: 'POST',
    body: { ...params },
  });
}

// 淘汰
export async function eliminateRfx(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/rfx/quotation/${params.rfxHeaderId}/eliminate`, {
    method: 'POST',
    body: params.rfxQuotationLines,
  });
}

/**
 * 多标段核价提交
 * @param {*} params ids
 */
export async function checkPriceSectionSubmit(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/section/check`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...otherParams },
  });
}

/**
 * 多标段核价提交校验
 */
export async function checkPriceSectionSubmitValidate(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v2/${organizationId}/rfx/section/check-validate`, {
    method: 'POST',
    // query: { rfxHeaderId },
    body: otherParams,
  });
}

/**
 * 询报价控制(新)-配置表配置老节点
 * */
export async function fetchOldControllerConfig(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/source_control_old_ui_config/list-from-site`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

/**
 * 询价工作台-判断是否开启RF
 * */
export async function fetchRFConfig(params = {}) {
  const { organizationId, ...otherParams } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/source_rf_config/list-from-site`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

// 判断使用RFI/RFP
export async function fetchRFContentConfig() {
  return request(`${prefix}/${commonOrganizationId}/rf/enable-rule`, {
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 专家评分节点操作记录
 * @param {*} params 节点信息
 */
export async function insertScoringOperationRecord(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/evaluate-operation-records`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 查询专家评分
 * @param {*} params 节点信息
 */
export async function fetchCheckPriceExpertScore(params) {
  const { rfxHeaderId } = params;
  return request(
    `${prefix}/${getCurrentOrganizationId()}/evaluate-scores/${rfxHeaderId}/RFX/check/score`,
    {
      method: 'GET',
    }
  );
}

/**
 * 配置表-查询是否开启新招标
 * */
export async function fetchBidConfig(params = {}) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/rel-table-records/source_new_bid_config/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 询价信息导出
 * @async
 * @function exportInquiryHallInfo
 */
export async function exportInquiryHallInfo(params) {
  const { key, ...otherParams } = params;
  const url = `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/progress/export/pdf`;
  return request(url, {
    method: 'POST',
    body: otherParams,
    responseType: 'text',
  });
}

/**
 * 中标公告撤回
 * @async
 * @function recallNotice
 */
export async function recallNotice(params) {
  const url = `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-notice-rule/recall`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 供应商回复RFQ计算数量
 * @async
 * @function fetchRFXCount
 */
export async function fetchRFXCount(params) {
  const url = `${SRM_SSRC}/v2/${commonOrganizationId}/rfx/quotation/list/count`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商回复RF计算数量
 * @async
 * @function fetchRFXCount
 */
export async function fetchRFCount(params) {
  const url = `${SRM_SSRC}/v1/${commonOrganizationId}/rf/quotation/list/count`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商回复-快速回复-tab数量
 * @param {*} params
 * @returns
 */

export async function fetchQRCount(data = {}) {
  const url = `${SRM_SSRC}/v1/${commonOrganizationId}/supplier/quick-rfq-quotation/query-list-count`;
  return request(url, {
    method: 'POST',
    body: data || {},
  });
}

// 申请转询价-轮循请求物品行报价信息
export async function fetchItemLineForQuotationNewMessage(params = {}) {
  const { rfxLineItemId = null, ...others } = params || {};
  const paramData = parseParameters(others);
  const url = `${SRM_SSRC}/v1/${commonOrganizationId}/rfx/${rfxLineItemId}/supervisor/refresh`;
  return request(url, {
    method: 'GET',
    query: paramData,
  });
}

// 询价监控台-轮循请求供应商列表报价信息
export async function handleFetchSupplierTableLine(params = {}) {
  const { organizationId = null, ...paramData } = params || {};
  const url = `${SRM_SSRC}/v1/${organizationId}/rfx/monitor/supplier/amounts-rank`;
  return request(url, {
    method: 'GET',
    query: paramData,
  });
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

// 查询配置表
export async function fetchConfigSheet(params = {}) {
  const { organizationId, configCode = null, data = {} } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${configCode}/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 查询询价单添加供应商的关联数据和系统配置
export async function fetchSourceSupplierRelativeConfig(params = {}) {
  const { organizationId, ...other } = params;
  return request(`${prefix}/${organizationId}/project-line-suppliers/supplier-lov-param`, {
    method: 'GET',
    query: { ...other },
  });
}

// 新报价 查询报价头/行历史附件
export async function fetchNewSupplierQuotationFile(params = {}) {
  const { organizationId, ...other } = params || {};
  return request(`${PrefixV2}/${organizationId}/rfx/quotation/header/record/attachment/history`, {
    method: 'GET',
    query: { ...other },
  });
}

// 核价-批量操作选用策略
export async function selectedItemBatchPolicy(params = {}) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/check/item-batch-update/selection-strategy`, {
    method: 'POST',
    body: { ...others },
  });
}

// 采购方-新建澄清答疑-请求单子头信息
export function getClarifyHeaderInfo(params) {
  return request(`${prefix}/${commonOrganizationId}/share/common/source-header/query`, {
    method: 'GET',
    query: { ...params },
  });
}

// 确认终轮报价结束前校验
export function validateRoundQuotationEnd(params) {
  const { organizationId, sourceHeaderId, ...others } = params;
  return request(
    `${prefix}/${organizationId}/round-headers/end-quotation-validate/${sourceHeaderId}`,
    {
      method: 'POST',
      query: others,
    }
  );
}

// 完成状态寻源单回退至核价状态前的校验
export function backToCheckPriceValidate(params = {}) {
  const { organizationId, ...othersParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/validate/check/rollback`, {
    method: 'POST',
    body: othersParams,
  });
}

// 完成状态寻源单回退至核价状态接口
export function backToCheckPriceConfirm(params = {}) {
  const { organizationId, ...othersParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/confirm/check/rollback`, {
    method: 'POST',
    body: othersParams,
  });
}

// 明细页面获取下载PDF的token
export async function downLoadPDFToken(params) {
  return request(`${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/check/progress/print/token`, {
    method: 'GET',
    query: params,
  });
}

// 明细页面下载PDF的地址
export async function downLoadPDFFile(token) {
  return request(`${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print/file`, {
    method: 'POST',
    body: isArray(token) ? token : [token],
    query: {
      outType: 'PDF',
    },
    responseType: 'text',
  });
}

// 唱标查询
export async function queryBidAnnouncement(params) {
  const { rfxHeaderId, ...otherParams } = params;
  return request(
    `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/${rfxHeaderId}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

// 唱标保存
export async function saveBidAnnouncement(params) {
  return request(`${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/save`, {
    method: 'POST',
    body: params,
  });
}

// 唱标发布
export async function submitBidAnnouncement(params) {
  return request(`${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/submit`, {
    method: 'POST',
    body: params,
  });
}

// 唱标查询历史版本
export async function bidAnnouncementVersion(params) {
  return request(
    `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/search/version`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 切换附件类型查询模板中的配置
export async function fetchAttTemplateDataByAttType(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/change-type`, {
    method: 'POST',
    query: params,
  });
}

// 切换附件类型查询模板中的配置
export async function generateAttTemplate(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/generate-file`, {
    method: 'POST',
    body: params,
  });
}

// 切换附件类型查询模板中的配置
export async function fetchAttachmentTableList(params) {
  const { organizationId, customizeUnitCode, tablePage, ...others } = params || {};
  const paramData = parseParameters(tablePage || {}) || {};
  return request(`${SRM_SSRC}/v1/${organizationId}/attachment-lines/list`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
      ...paramData,
    },
  });
}

/**
 * 中标详情
 */
export async function fetchWinBidLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/check/suggested`, {
    method: 'GET',
    query: {
      ...param,
    },
  });
}
