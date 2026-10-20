/**
 * 考评档案管理 service
 * @date: 2019-1-14
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import {
  parseParameters,
  getCurrentOrganizationId,
  getCurrentTenant,
  filterNullValueObject,
} from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询请求
 * @param {string} data.tenantId - 租户id
 * @param {?string} data.evalNum - 档案编码
 * @param {?string} data.evalName - 档案描述
 * @param {?string} data.evalStatus - 档案状态
 * @param {?string} data.groupId - 集团
 * @param {?string} data.companyId - 公司
 * @param {?string} data.purOrgId - 采购组织
 * @param {?string} data.invOrgId - 库存组织
 * @param {?string} data.evalCycle - 考评周期
 * @param {?string} data.evalDimension - 考评维度
 * @param {?string} data.creationDateFrom - 建档日期从
 * @param {?string} data.creationDateTo - 建档日期至
 * @returns fetch promise
 */
export async function docManageSearch(params) {
  const { tenantId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers?tenantId=${params.tenantId}`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(rest)),
  });
}

/**
 *作废行请求
 *
 * @export
 * @param {string[]} params - 作废行的 key 组成的数组
 * @returns
 */
export async function docManageDelete(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/logicDeleteForEval`, {
    method: 'PUT',
    body: params.map(item => item.evalHeaderId),
  });
}

/**
 * 评分催办
 *
 * @export
 * @param {string[]} params - 评分催办行的 key 组成的数组
 * @returns
 */
export async function docManageScoreCuiBan(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/batch-urge`, {
    method: 'POST',
    body: {
      evalHeaderIds: params.map(item => item.evalHeaderId),
    },
  });
}

/**
 *获取页面基本信息
 * @export
 * @param {string} params.headerId - 详情页面/档案 headerId
 * @returns {object} fetch promise
 */
export async function initialFetch(params) {
  const { headerId, ...rest } = params;
  const queryParams = parseParameters(rest);
  const { page, size, customizeUnitCode, ...paramsRest } = queryParams;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/result/${headerId}/post`, {
    method: 'POST',
    query: {
      page,
      size,
      customizeUnitCode:
        'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE_SEARCH,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUM_SEARCH,SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
    },
    body: paramsRest,
  });
}

/**
 *获取评分汇总 table 数据
 *
 * @export
 * @param {string} params.headerId - 详情页面/档案 headerId
 * @returns {object} fetch promise
 */
export async function scoreSumTabFetch(params) {
  const { headerId, ...rest } = params;
  const queryParams = parseParameters(rest);
  const { page, size, customizeUnitCode, ...paramsRest } = queryParams;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/eval-lines/${headerId}/post`, {
    method: 'POST',
    query: {
      page,
      size,
      customizeUnitCode:
        'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUMLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUM_SEARCH',
    },
    body: paramsRest,
  });
}

/**
 *获取参评供应商 table 数据
 *
 * @export
 * @param {string} params.headerId - 详情页面/档案 headerId
 * @returns {object} fetch promise
 */
export async function scoreVendorTabFetch(params) {
  const { headerId, ...rest } = params;
  const queryParams = parseParameters(rest);
  const { page, size, customizeUnitCode, ...paramsRest } = queryParams;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/eval-suppliers-dis/${headerId}/post`,
    {
      method: 'POST',
      query: {
        page,
        size,
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDORLINE',
      },
      body: paramsRest,
    }
  );
}

/**
 *获取评分人信息 modal 数据
 * @export
 * @param {string} params.evalDtlId - 明细行id
 * @returns {object} fetch promise
 */
export async function evaluationPersonFetch(params) {
  const { customizeUnitCode = '' } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${params.evalDtlId}`, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}
/**
 *新建或修改评分人 modal 信息
 * @export
 * @param {string} params.evalDtlId - 明细行id
 * @param {object[]} params.addDataList - 新建或修改的评分人信息
 * @returns fetch promise
 */
export async function saveEvaluationPerson(params) {
  const { customizeUnitCode = '' } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${params.evalDtlId}/operate`, {
    method: 'POST',
    body: params.addDataList,
    query: { customizeUnitCode },
  });
}

/**
 *获取评分明细 modal 数据
 * @export
 * @param {string} params.evalLineId - 详情页面/档案 id
 * @returns {object} fetch promise
 */
export async function modalScoreDetailFetch(params) {
  const { customizeUnitCode = '' } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-dtls/${params.evalLineId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 *获取采购品类明细 modal 数据
 * @export
 * @param {string} params.headerId - 详情页面/档案 id
 * @param {string} params.supplierId - 供应商 id
 * @returns {object} fetch promise
 */
export async function productDetailFetch(params) {
  const page = filterNullValueObject(parseParameters(params));
  const { headerId, supplierId, ...rest } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-line/category/${params.headerId}/${params.supplierId}`,
    {
      method: 'GET',
      query: { ...rest, ...page },
    }
  );
}

/**
 *获取操作记录 modal 数据
 * @export
 * @param {string} params.headerId - 详情页面/档案 id
 * @returns {object} fetch promise
 */
export async function activityLogFetch(params) {
  const page = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-eval-opr-historys`, {
    method: 'GET',
    query: { evalHeaderId: params.headerId, ...page },
  });
}
// /**
//  *
//  *
//  * @export
//  * @param {string} params.tabKey - 发起请求的 tab 页
//  * @param {string} params.headerId - 详情档案/页面 id
//  * @param {?string} params.vendor - 查询字段 供应商
//  * @param {?string} params.purchaseProduct - 查询字段 采购品类
//  * @param {?string} params.evaluationIndicators - 查询字段 考评指标
//  * @returns
//  */
// export async function searchList(params) {
//   const { docId, tabKey, ...rest } = params;
//   return request(`${SRM_SSLM}/v1/doc-manage/detail/${params.headerId}/${tabKey}`, {
//     method: 'GET',
//     query: rest,
//   });
// }

/**
 * 新建文档请求
 * @export
 * @param {string} params.remark - 档案描述
 * @param {string} params.evalTplName - 考评模板
 * @param {string} params.evalDimension - 考评维度
 * @param {string} params.evalDimensionValue - 维度值
 * @param {string} params.evalCycle - 考评周期
 * @param {string} params.evalDateForm - 建档日期从
 * @param {string} params.evalDateTo - 建档日期至
 * @param {?string} params.evalRuleRemark - 考评规则说明
 * @param {?string} params.processRemark - 考评说明
 * @returns
 */
export async function saveThisDoc(params) {
  const { customizeUnitCode, ...others } = params;
  const med = params.evalHeaderId ? 'PUT' : 'POST';
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers`, {
    method: med,
    body: filterNullValueObject(others),
    query: { customizeUnitCode },
  });
}

/**
 * 执行评分
 * @param {string} params.evalHeaderId - 考评档案头id
 * @returns
 */
export async function executeScore(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/${params.evalHeaderId}/evaluate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 重新计算
 * @param {string} params.evalHeaderId - 考评档案头id
 * @returns
 */
export async function recalculate(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/${evalHeaderId}/re-evaluate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 汇总统计check
 * @param {string} params.evalHeaderId - 考评档案头id
 * @returns
 */
export async function sumStatisticsCheck(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/${params.evalHeaderId}/final-collect-check`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 汇总统计
 * @param {string} params.evalHeaderId - 考评档案头id
 * @returns
 */
export async function sumStatistics(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/${params.evalHeaderId}/final-collect`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 发布
 * @param {string} params.evalHeaderId - 考评档案头id
 * @returns
 */
export async function publish(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/${params.evalHeaderId}/publish`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取当考评维度为“集团”的时候的维度值
 */
export async function fetchGroupDimensionValue() {
  const params = parseParameters({
    lovCode: 'SSLM.KPI_EVAL_DIM_GROUP',
    tenantId: getCurrentTenant().tenantId,
  });
  return request(`${HZERO_PLATFORM}/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 自动考评查询
 * @export
 * @param {string} organizationId - 租户 id
 * @param {String} params.templateId - 评分模板ID
 * @returns
 */
export async function queryEvaluationAuto(evalTplId) {
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-auto-configs`, {
    query: {
      evalTplId,
      tenantId: organizationId,
    },
  });
}

/**
 * 查询供应商品类信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryScopeCategoryList(params) {
  const page = filterNullValueObject(parseParameters(params));
  const { headerId, supplierId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/category/${headerId}/${supplierId}`, {
    method: 'GET',
    query: { ...rest, ...page },
  });
}

/**
 * 查询供应商物料数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryScopeItemList(params) {
  const page = filterNullValueObject(parseParameters(params));
  const { headerId, supplierId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/item/${headerId}/${supplierId}`, {
    method: 'GET',
    query: { ...rest, ...page, enabledFlag: 1 },
  });
}

/**
 * 保存参评供应商信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveEvalTplScopeSupplierList(params) {
  const { headerId, body, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/save-eval-line/${headerId}`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 删除参评供应商信息
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteEvalTplScopeSupplierList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/delete/${params.headerId}`, {
    method: 'DELETE',
    body: params.body,
  });
}

export async function saveCoreDetail(Data) {
  const { data, customizeUnitCode } = Data;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-dtls/save`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

export async function saveScoreSum(Data) {
  const { data, customizeUnitCode } = Data;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/save-line`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 退回评分
 * （弃用）
 */
export async function handleBackScore(params) {
  const { evalHeaderId, body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/processEvalScoreBack/${evalHeaderId}`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 添加供应商-查询
 * @export
 * @param {string} organizationId - 租户 id
 * @returns
 */
export async function queryEvalTplScopeSupplierList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/supplier`, {
    query,
  });
}

export function saveBatchMaintenanceRaters(params) {
  const { evalHeaderId, body, customizeUnitCode = '' } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/batch-save/${evalHeaderId}`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 查询评分状态明细
 * @param params
 * @returns {Promise<void>}
 */
export async function queryEvaluationStatus(params) {
  const param = filterNullValueObject(parseParameters(params));
  const { evalDtlId, ...rest } = param;
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-eval-processs/${evalDtlId}`, {
    method: 'GET',
    query: { evalDtlId, ...rest },
  });
}

/**
 * 提交审批
 * @param {string} params.evalHeaderId - 考评档案头id
 * @returns
 */
export async function handleSubmit({ customizeUnitCode, ...params }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/approvalSubmit`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 提交新建审批
 * @returns
 */
export async function submitNewApproval({ customizeUnitCode, ...params }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/new-submit`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 查询参评供应商所有数据
 * @param {string} params.evalHeaderId - 考评档案头id
 * @returns
 */
export function queryAllSupplier(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-templates/select-all/supplier`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 退回评分
 * @param {object} params
 * @param {object[]} records - 要删除的记录
 * @return {Promise<void>}
 */
export async function backScore(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/processEvalScoreBack/${params.evalHeaderId}`,
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
  const { body, evalHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-headers/${evalHeaderId}/create-problem-headers`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 查询供应商申诉情况
 */
export async function queryComplaintSituation(params) {
  const { evalHeaderId, evalLineIDS, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/appeal/${evalHeaderId}`, {
    method: 'POST',
    query: { ...filterNullValueObject(parseParameters(rest)) },
    body: filterNullValueObject({ evalLineIDS }),
  });
}

/**
 * 采购方保存供应商申诉
 */
export async function saveComplaint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/appeal/save`, {
    method: 'POST',
    query: {
      customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
    },
    body: params,
  });
}

/**
 * 采购方发布供应商申诉
 */
export async function publishComplaint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-line/appeal/publish`, {
    method: 'POST',
    query: {
      customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
    },
    body: params,
  });
}

export async function dealCopy(params) {
  const { evalHeaderId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/copy/${evalHeaderId}`, {
    method: 'POST',
    body: rest,
  });
}

// 判断权重是否相同
export async function weightSameJudge(params) {
  const { evalHeaderId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${evalHeaderId}/user-weight-is-same`,
    {
      method: 'POST',
      body,
    }
  );
}

// 批量转交评分人
export async function batchTransfer(params) {
  const { evalHeaderId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${evalHeaderId}/batch-transform`,
    {
      method: 'POST',
      body,
    }
  );
}
