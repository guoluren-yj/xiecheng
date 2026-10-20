/*
 * @Date: 2023-11-06 13:43:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 查询页签下数据数量
export async function queryCount(params) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/count`, {
    method: 'GET',
    query: params,
  });
}

// 废弃档案
export async function deleteAppraisal(params) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/logicDeleteForEval`, {
    method: 'PUT',
    body: params,
  });
}

// 重新计算-明细
export async function recalculate(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/${evalHeaderId}/re-evaluate`, {
    method: 'POST',
    body: params,
  });
}

// 重新计算-列表
export async function listRecalculate(params) {
  const { evalHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/${evalHeaderId}/re-evaluate`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 复制
export async function dealCopy({ evalHeaderId, ...rest }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/copy/${evalHeaderId}`, {
    method: 'POST',
    body: rest,
  });
}

// 保存档案
export async function saveAppraisal(params) {
  const { customizeUnitCode, wfParams = {}, ...body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/update`, {
    body,
    method: 'PUT',
    query: { customizeUnitCode, ...wfParams },
  });
}

// 执行评分
export async function executeScore(params) {
  const { evalHeaderId, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/${evalHeaderId}/evaluate`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

// 提交新建审批
export async function submitNewApproval({ customizeUnitCode, ...params }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/new-submit`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

// 汇总统计前的校验
export async function sumStatisticsCheck(params) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-headers/${params.evalHeaderId}/final-collect-check`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 汇总统计
export async function sumStatistics({ evalHeaderId, customizeUnitCode, ...rest }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/${evalHeaderId}/final-collect`, {
    method: 'POST',
    body: rest,
    query: { customizeUnitCode },
  });
}

// 退回评分
export async function backScore(params) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-headers/processEvalScoreBack/${params.evalHeaderId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 判断权重是否相同
export async function weightSameJudge(params) {
  const { evalHeaderId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/${evalHeaderId}/user-weight-is-same`, {
    method: 'POST',
    body,
  });
}

// 批量转交评分人
export async function batchTransfer(params) {
  const { evalHeaderId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/${evalHeaderId}/batch-transform`, {
    method: 'POST',
    body,
  });
}

// 提交考评档案
export async function submitAppraisal({ customizeUnitCode, ...rest }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/approvalSubmit`, {
    method: 'POST',
    body: rest,
    query: { customizeUnitCode },
  });
}

// 发布
export async function publish({ evalHeaderId, customizeUnitCode, ...rest }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/${evalHeaderId}/publish`, {
    method: 'POST',
    body: rest,
    query: { customizeUnitCode },
  });
}

// 新增指标
export async function addIndicator(params) {
  const { evalHeaderId, data } = params;
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/createOrUpdate/${evalHeaderId}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 新增参评供应商
export async function addSuppliers(params) {
  const { evalHeaderId, data } = params;
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/save-eval-line/${evalHeaderId}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 批量新增评分人
export async function addScorer(params) {
  const { evalHeaderId, evalRespRule, ...rest } = params;
  return request(
    `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-resp-dmss/eval-manage/${evalRespRule}/${evalHeaderId}`,
    {
      method: 'POST',
      body: rest,
    }
  );
}

// 评分人-分配评分人
export async function assignScorer(params) {
  const { evalRespRule, evalHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-resp-dmss/eval-manage/${evalRespRule}/${evalHeaderId}`,
    {
      method: 'POST',
      body: filterNullValueObject(params),
    }
  );
}

// 查询质量整改单据头ID
export async function queryProblemHeader(params) {
  const { body, evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/${evalHeaderId}/create-problem-headers`, {
    method: 'POST',
    body,
  });
}

// 采购方发布供应商申诉
export async function publishComplaint({ publishData, customizeUnitCode }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-line/appeal/publish`, {
    method: 'POST',
    body: publishData,
    query: { customizeUnitCode },
  });
}

// 批量分配品类/物料
export async function batchAssignItemOrCategory(params) {
  const { evalHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/batch-save-eval-line/${evalHeaderId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 获取指标
export async function queryIndicatorType({ evalTplId, ...rest }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-templates/indicators/${evalTplId}/has-level`, {
    method: 'GET',
    query: rest,
  });
}

// 获取指标等级分布统计图数据
export async function queryIndicatorChartData({ evalHeaderId, ...rest }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-dtls/${evalHeaderId}/count`, {
    method: 'GET',
    query: rest,
  });
}

// 获取其他统计图数据
export async function queryChartData({ evalHeaderId, ...rest }) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/query/count/${evalHeaderId}`,
    {
      method: 'GET',
      query: rest,
    }
  );
}
