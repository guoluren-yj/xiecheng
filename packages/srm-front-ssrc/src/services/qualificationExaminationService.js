/**
 * service - 资格审查
 * @date: 2019-1-25
 * @version: 0.0.1
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
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
 * 资格审查列表入口
 * @async
 * @function fetchRfqDataList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQualificationDataList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/prequal/list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 资格审查头信息
 * @async
 * @function fetchInquiryHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchQualificationHeader(params) {
  const { organizationId, rfxHeaderId } = params;
  return request(`${prefix}/${organizationId}/prequal/${rfxHeaderId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 资格审查头信息 - 分标段
 * @async
 * @function fetchQualificationSectionHeader
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchQualificationSectionHeader(params) {
  const { organizationId, prequalGroupHeaderId } = params;
  return request(
    `${prefix}/${organizationId}/prequal-group-headers/detail/${prequalGroupHeaderId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 资格审查行列表查询
 * @async
 * @function fetchRfqDataList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQualificationLineList(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/prequal/${rfxHeaderId}/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 资格审查行列表查询 - 分标段
 * @async
 * @function fetchQualificationSectionLineList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQualificationSectionLineList(params) {
  const { organizationId, prequalGroupHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/prequal-group-supplier-lines/${prequalGroupHeaderId}/suppliers`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * 评分明细查询
 * @async
 * @function fetchRfqDataList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQualificationRankList(params) {
  const { organizationId, prequalLineId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/prequal/approval/${prequalLineId}/score-indic`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 评分明细查询 - 分标段
 * @async
 * @function fetchQualificationSectionRankList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQualificationSectionRankList(params) {
  const { organizationId, prequalGroupSupplierLineId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/prequal-group-headers/approval/${prequalGroupSupplierLineId}/score-indic`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}
/**
 * 评分明细保存
 * @async
 * @function saveCheckPrice
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveQualificationRankList(params) {
  const { organizationId, validateDataSource } = params;
  return request(`${prefix}/${organizationId}/prequal/approval/score-indic`, {
    method: 'POST',
    body: validateDataSource,
  });
}
/**
 * 评分明细保存 - 分标段
 * @async
 * @function saveQualificationSectionRankList
 * @param {object} params - body params
 * @returns {object} fetch Promise
 */
export async function saveQualificationSectionRankList(params) {
  const { organizationId, validateDataSource } = params;
  return request(`${prefix}/${organizationId}/prequal-group-headers/approval/score-indic`, {
    method: 'POST',
    body: validateDataSource,
  });
}
/**
 * 资格审查保存
 * @async
 * @function saveCheckPrice
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveQualificationExamination(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal/approval/save`, {
    method: 'POST',
    body: otherParams,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 资格审查保存 - 分标段
 * @async
 * @function saveCheckPrice
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function saveQualificationSectionExamination(params) {
  const { organizationId, prequalGroupSupplierLines } = params;
  return request(`${prefix}/${organizationId}/prequal-group-supplier-lines/prequal/save`, {
    method: 'POST',
    body: prequalGroupSupplierLines,
  });
}

/**
 * 资格审查提交
 * @async
 * @function saveCheckPrice
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function submitQualificationExamination(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal/approval/submit`, {
    method: 'POST',
    body: otherParams,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 资格审查提交 - 分标段
 * @async
 * @function saveCheckPrice
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function submitQualificationSectionExamination(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal-group-supplier-lines/prequal/submit`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 专家评审-资格审查汇总数据
 * @async
 * @function fetchQualificationSum
 * @param {object} params - 查询条件
 */
export async function fetchQualificationSum(params) {
  const { organizationId, sourceFrom, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal/${sourceFrom}/summary`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 专家评审-资格审查汇总数据-分标段
 * @async
 * @function fetchQualificationSectionSum
 * @param {object} params - 查询条件
 */
export async function fetchQualificationSectionSum(params) {
  const { organizationId, sourceFrom, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal-group-headers/summary`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 专家评审-资格审查汇总保存提交api
 * @async
 * @function saveSubmitQualificationSum
 * @param {object} params - 保存提交参数
 */
export async function saveSubmitQualificationSum(params) {
  const { organizationId, doFlag, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal/summary/${doFlag}/submit`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 专家评审-资格审查-分标段汇总保存提交api
 * @async
 * @function saveSubmitQualificationSectionSum
 * @param {!Object} params - 保存提交参数
 * @param {number} [params.doFlag] - 区分: 保存(0)/提交(1)
 * @description 复用之前接口
 */
export async function saveSubmitQualificationSectionSum(params) {
  const { organizationId, doFlag, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/prequal-group-headers/summary/${doFlag}/submit`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 操作询报价
 * @function
 */
export async function quotationControll(params) {
  const { organizationId, remark, rfxHeaderIds } = params;
  return request(`${prefix}/${organizationId}/rfx/close`, {
    method: 'POST',
    body: {
      rfxHeaderIds,
      terminatedRemark: remark,
    },
  });
}

/**
 * 操作招标书
 * @function
 */
export async function quotationContBid(params) {
  const { organizationId, remark, bidHeaderId } = params;
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/close`, {
    method: 'POST',
    body: remark,
  });
}

/**
 * 预审小组-分标段-数据查询
 * @async
 * @function fetchPretrialSectionPanel
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPretrialSectionPanel(params) {
  const { organizationId, prequalGroupHeaderId } = params;
  return request(
    `${prefix}/${organizationId}/prequal-group-headers/${prequalGroupHeaderId}/prequal-group-members`,
    {
      method: 'GET',
    }
  );
}
