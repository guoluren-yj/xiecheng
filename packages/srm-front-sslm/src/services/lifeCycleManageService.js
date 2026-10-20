/*
 * @Date: 2022-12-02 17:38:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询当前租户的管控维度
export async function queryCurrentConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-configs`, {
    method: 'GET',
    query: params,
  });
}

// 查询当前租户下的子公司
export async function querySubsidiary(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    query: params,
  });
}

// 查询供应商列表 - 泳道视图
export async function searchSupplier(params) {
  const { stageId, ...others } = parseParameters(params);
  let query = { ...others, stageId };
  let requestURL = `${SRM_SSLM}/v1/${organizationId}/life-cycles/stage-new`; // 查询阶段
  if (params.stageId === 'ALL') {
    query = others;
    requestURL = `${SRM_SSLM}/v1/${organizationId}/life-cycles/lane-new`; // 查询所有
  }
  return request(requestURL, {
    method: 'GET',
    query,
  });
}

// 初次新建申请单带出的基础信息
export async function queryInitInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycles/single-new`, {
    method: 'GET',
    query: params,
  });
}

// 查询供应商分类历史信息
export async function querySupplierClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-assign/queryAssign`, {
    method: 'GET',
    query: params,
  });
}

// 查询采购财务历史数据
export async function queryPurchase(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-change-syncs/findSync`, {
    method: 'GET',
    query: params,
  });
}

// 保存申请单
export async function saveApplication(params) {
  const { customizeUnitCode, wfParams = {}, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode, ...wfParams },
  });
}

// 提交申请单
export async function submitApplication(params) {
  const { requisitionId, customizeUnitCode, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/${requisitionId}/submit`,
    {
      method: 'POST',
      body: others,
      query: { customizeUnitCode },
    }
  );
}

// 批量提交申请单
export async function batchSubmitApplication(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/batch/submits`, {
    method: 'POST',
    body: params,
  });
}

// 废弃申请单
export async function discardApplication(params) {
  const { requisitionId, customizeUnitCode, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/${requisitionId}/obsoleted`,
    {
      method: 'POST',
      body: others,
      query: { customizeUnitCode },
    }
  );
}

// 查询单据页签数量
export async function queryDocumentCount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/count`, {
    method: 'GET',
    query: params,
  });
}

// 提交申请单前的校验接口
export async function checkSubmit(params) {
  const { requisitionId, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/${requisitionId}/check-submit`,
    {
      method: 'POST',
      body: others,
    }
  );
}

// 批量提交-校验接口
export async function batchCheckSubmit(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/batch/check-submits`, {
    method: 'POST',
    body: params,
  });
}

// 新建生命周期申请单前的校验
export async function verifySupplierLife(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/header-new-check`, {
    method: 'GET',
    query: params,
  });
}

// 查询生命周期历程
export async function fetchLifeCycle(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-Admission/history`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function riskEmbedPage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前租户开通风控的服务
 */
export async function queryRiskMonitorType(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/opened-service-query`, {
    method: 'GET',
    query: params,
  });
}
