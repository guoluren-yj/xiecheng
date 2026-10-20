/**
 * service - 现场考察报告
 * @date: 2020-05-10
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { SRM_SSLM, SRM_SPUC } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 现场考察报告管理列表查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryManageList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers`, {
    method: 'GET',
    query,
  });
}

/**
 * 现场考察报告填制列表查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryFillingList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/evaluating`, {
    method: 'GET',
    query,
  });
}

/**
 * 已填制现场考察报告列表查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryFilledList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/already/evaluating`, {
    method: 'GET',
    query,
  });
}

/**
 * 现场考察结果查询列表查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryResultList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/result/evaluating`, {
    method: 'GET',
    query,
  });
}

/**
 * 列表-作废
 * @async
 * @param {Object} params - 查询参数
 */
export async function listInvalid({ params, customizeUnitCode }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/batch-discard`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 列表-删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function listDelete({ params, customizeUnitCode }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers`, {
    method: 'DELETE',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 明细大保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveAll(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 执行评分
 * @async
 * @param {Object} params - 查询参数
 */
export async function performScore(params) {
  const { evalHeaderId, customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/evaluate`, {
    method: 'POST',
    body: { ...others, evalHeaderId },
    query: { customizeUnitCode },
  });
}

/**
 * 提交审批
 * @async
 * @param {Object} params - 查询参数
 */
export async function submitApproval(params) {
  const { evalHeaderId, customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/submit/${evalHeaderId}`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 汇总统计
 * @async
 * @param {Object} params - 查询参数
 */
export async function summaryStatistics(params) {
  const { evalHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/final-collect`,
    {
      method: 'POST',
    }
  );
}

/**
 * 详情-作废
 * @async
 * @param {Object} params - 查询参数
 */
export async function detailInvalid(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}`, {
    method: 'PUT',
  });
}

/**
 * 详情页-删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function detailDelete(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}`, {
    method: 'DELETE',
  });
}

/**
 * 操作记录查询
 */
export async function queryOperationRecord(params) {
  const { evalHeaderId, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-opr-historys/${evalHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 基本信息查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryBasicInfo(params) {
  const { evalHeaderId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}`, {
    method: 'GET',
    query: others,
  });
}

export async function queryReceivedBasicInfo(params) {
  const { evalHeaderId, customizeUnitCode = '' } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/supplierHeaderDetail`,
    {
      method: 'POST',
      query: { customizeUnitCode },
    }
  );
}

/**
 * 物料品类查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryMaterialCategory(params) {
  const { evalHeaderId, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates/${evalHeaderId}`, {
    method: 'GET',
    query,
  });
}

export async function querySupplierMaterialCategory(params) {
  const { evalHeaderId, isAlreadyFeedback, ...others } = params;
  const url = isAlreadyFeedback
    ? `${SRM_SSLM}/v1/${organizationId}/site-eval-item-cate-copy/${evalHeaderId}/supplier`
    : `${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates/${evalHeaderId}/supplier`;
  const query = filterNullValueObject(parseParameters(others));
  return request(url, {
    method: 'POST',
    query,
  });
}

/**
 * 物料品类保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveMaterialCategory(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 物料品类删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteMaterialCategory(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 考察小组查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryTeam(params) {
  const { evalHeaderId, isAlreadyFeedback, ...others } = params;
  const url = isAlreadyFeedback
    ? `${SRM_SSLM}/v1/${organizationId}/site-eval-group-copy/${evalHeaderId}`
    : `${SRM_SSLM}/v1/${organizationId}/site-eval-groups/${evalHeaderId}`;
  const query = filterNullValueObject(parseParameters(others));
  return request(url, {
    method: 'GET',
    query,
  });
}

/**
 * 考察小组保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveTeam(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-groups`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 考察小组删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteTeam(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-groups`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 附件信息查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryAttachment(params) {
  const { evalHeaderId, isAlreadyFeedback, ...others } = params;
  const url = isAlreadyFeedback
    ? `${SRM_SSLM}/v1/${organizationId}/site-eval-att-ln-copy/${evalHeaderId}`
    : `${SRM_SSLM}/v1/${organizationId}/site-eval-att-lns/${evalHeaderId}`;
  const query = filterNullValueObject(parseParameters(others));
  return request(url, {
    method: 'GET',
    query,
  });
}

/**
 * 附件信息保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveAttachment(params) {
  const { customizeUnitCode = '', tableValues } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-att-lns`, {
    method: 'POST',
    body: tableValues,
    query: { customizeUnitCode },
  });
}

/**
 * 附件信息删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteAttachment(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-att-lns`, {
    method: 'DELETE',
    body: params,
  });
}

export async function onDraggerUploadRemove(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/**
 * 评分信息查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryScoreInfo(params) {
  const { evalHeaderId, isAlreadyFeedback, ...query } = params;
  const url = isAlreadyFeedback
    ? `${SRM_SSLM}/v1/${organizationId}/site-eval-line-copy/${evalHeaderId}`
    : `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${evalHeaderId}`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// 查询评分人汇总信息
export async function queryScorerInfo(params) {
  const { evalHeaderId, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-resp-headers/get-resp-header/${evalHeaderId}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/**
 * 现场考察报告填制-评分信息查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryFillingScoreInfo(params) {
  const { evalHeaderId, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${evalHeaderId}/evaluating`, {
    method: 'GET',
    query,
  });
}

/**
 * 评分人查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryScorer(params) {
  const { evalLineId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/${evalLineId}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 评分人保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveScorer(params) {
  const { evalLineId, tableValues } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/${evalLineId}`, {
    method: 'POST',
    body: tableValues,
  });
}

/**
 * 评分人删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteScorer(params) {
  const { selectedRows } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps`, {
    method: 'DELETE',
    body: selectedRows,
  });
}

/**
 * 评分状态查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryScoreStatus(params) {
  const { evalLineId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/${evalLineId}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 考察结果查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryResults(params) {
  const { evalHeaderId, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 现场考察报告填制-保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveFillingScore(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/preservation`, {
    method: 'PUT',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 现场考察报告填制-提交
 * @async
 * @param {Object} params - 查询参数
 */
export async function submitFillingScore(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps`, {
    method: 'PUT',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 查询抄送人
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryCopyPerson(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/lovs/sql/data`, {
    method: 'GET',
    query,
  });
}

/**
 * 现场考评档案管理提交反馈接口
 * @param params
 * @returns {Promise<void>}
 */
export async function submitFeedback(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/feedbackSiteEval`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 发布接口
 * @param params
 * @returns {Promise<void>}
 */
export async function publishReport(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/releaseSiteEval`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 保存现场考评档案
 * @param params
 * @returns {Promise<void>}
 */
export async function saveFeedBackInfo(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/updateSiteEvalHeader`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 现场考评档案反馈页面提交接口
 * @param params
 * @returns {Promise<void>}
 */
export async function submitFeedBack(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/feedbackedSiteEval`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 现场考察报告管理详情页评分信息保存接口
 * @param params
 * @returns {Promise<void>}
 */
export async function saveManageScoreInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/preservation`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 现场考察报告管理批量保存评分人
 * @param params
 * @returns {Promise<void>}
 */
export async function batchSaveGrader(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/batchCreate`, {
    method: 'POST',
    body: params,
  });
}

/*
 * 考察报告结果-打印
 */
export async function handlePrint(params) {
  const { evalHeaderId, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/print`, {
    method: 'GET',
    query,
    responseType: 'blob',
  });
}

/**
 * 退回评分
 */
export async function handleBackScore(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/processEvalScoreBack/${params.evalHeaderId}`,
    {
      method: 'POST',
      body: filterNullValueObject(params),
    }
  );
}

/**
 * 查询质量整改单据头ID
 */
export async function queryProblemHeader(params) {
  const { body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/create_problem_headers`, {
    method: 'POST',
    body,
  });
}

/**
 * 质量整改采购方列表
 */
export async function queryPurchaserQualityRectify(params) {
  const { evalHeaderId, ...other } = params;
  const query = parseParameters(other);
  return request(`${SRM_SSLM}/v1/${organizationId}/site_eval_external_orders/${evalHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 质量整改供应商列表
 */
export async function querySupplierQualityRectify(params) {
  const { evalHeaderId, ...other } = params;
  const query = parseParameters(other);
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site_eval_external_orders/supplier/${evalHeaderId}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 工作台新建时查询供应商信息
 */
export async function querySupplierInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/line-company-info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 退回
 * @async
 * @param {Object} params - 查询参数
 */
export async function handleBack(params) {
  const { customizeUnitCode = '', evalHeaderId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/back`, {
    method: 'POST',
    body: {
      ...others,
      evalHeaderId,
    },
    query: { customizeUnitCode },
  });
}

// 查询评分附件
export async function queryGradeAttachment(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-att`, {
    method: 'GET',
    query,
  });
}

// 保存评分附件
export async function saveGradeAttachment(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-att`, {
    method: 'POST',
    body: params,
  });
}

// 删除附件保存
export async function deleteGradeAttachment(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-att`, {
    method: 'DELETE',
    body: params,
  });
}

// 判断权重是否相同
export async function weightSameJudge(params) {
  const { evalHeaderId, customizeUnitCode, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/current-user-weight-is-same/${evalHeaderId}/post`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body,
    }
  );
}

// 转交评分人
export async function transmitScorer(params) {
  const { evalHeaderId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/batch-save-transform/${evalHeaderId}`,
    {
      method: 'POST',
      body,
    }
  );
}

// 放弃评分
export async function batchCancel(params) {
  const { evalHeaderId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/batchCancel/${evalHeaderId}`,
    {
      method: 'POST',
      body,
    }
  );
}

// 现场考察---复制
export async function dealCopy(params) {
  const { evalHeaderId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/copy/${evalHeaderId}`, {
    method: 'POST',
    body: rest,
  });
}
