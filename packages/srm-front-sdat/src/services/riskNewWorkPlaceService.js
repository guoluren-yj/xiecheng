/* eslint-disable no-param-reassign */
/*
 * Description: 风险事件管理-风险事件 v2
 * @Author: lqx(qingxiang.luo@going-link.com)
 * @Date: 2025-01-23 14:07:51
 * @Last Modified by: lqx(qingxiang.luo@going-link.com)
 * @Last Modified time: 2025-06-05 20:39:03
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchRiskList: 查询风险事件列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchRiskList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/search-events`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchTypeChartData: 事件类型图表数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchTypeChartData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/status-report`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchLevelChartData: 风险级别图表数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchLevelChartData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/level-report`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchBarChartData: 柱状图图表数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchBarChartData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/item-report`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchRecallProcess: 撤回操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchRecallProcess(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-process/recall`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchApproveRecord: 审批记录
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchApproveRecord(params) {
  // return request(
  //   `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-process/${
  //     params.riskProcessId
  //   }/approve/detail`,
  //   {
  //     method: 'GET',
  //     query: params,
  //   }
  // );

  return request(`/hwfp/v1/${getCurrentOrganizationId()}/activiti/task/historyApproval`, {
    method: 'POST',
    query: params,
  });
}

/**
 * fetchApproveSvg: 流程图
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchApproveSvg(params) {
  return request(
    `/hwfp/v1/${getCurrentOrganizationId()}/process/instance/diagram/${params.workflowId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchApproveDetail: 审批详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchApproveDetail(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-process/process-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchApprovePeople: 风险广播人群
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchApprovePeople(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-process/process-user`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchCloseData: 关闭当前单据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchCloseData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/close-event`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchOpenData: 开启当前单据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchOpenData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/open-event`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchDynamicDetail: 查询事件动态详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchDynamicDetail(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询监控信息
 * @param {*} params
 * @returns
 */
export async function fetchMonitorMsg(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/company-basic-info`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询供应商信息
 * @param {*} params
 * @returns
 */
export async function fetchSupplierMsg(params) {
  return request(`/sslm/v1/${getCurrentOrganizationId()}/supplier-basics/is_partner_relation`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询供应商信息
 * @param {*} params
 * @returns
 */
export async function fetchSubmitData(params) {
  const param = params || {};
  const userList = param?.broadcastReceivers ?? [];

  if (userList.length) {
    userList.forEach((item) => {
      item.userId = item.id || item.userId;
    });
  }

  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-process/process`, {
    method: 'POST',
    body: {
      ...param,
      broadcastReceivers: userList,
    },
  });
}

/**
 * 广播提交
 * @param {*} params
 * @returns
 */
export async function fetchSubmitCastData(params) {
  const param = params || {};
  const actionList = param?.processAction ?? [];
  const userList = param?.broadcastReceivers ?? [];
  const url =
    param?.url || `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-process/process`;

  if (userList.length) {
    userList.forEach((item) => {
      item.userId = item.id || item.userId;
    });
  }

  delete param.processAction;

  return request(url, {
    method: 'POST',
    body: {
      ...param,
      processAction: actionList.join(','),
      broadcastReceivers: userList.map((item) => item.userId),
    },
  });
}

/**
 * 查询订单信息
 * @param {*} params
 * @returns
 */
export async function checkOrderStatus(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/workbench-service-open`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取风险事件操作记录
 * @param {*} params
 * @returns
 */
export async function fetchOperationRecord(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/event-operate-log/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取风险事件类型
 * @param {*} params
 * @returns
 */
export async function fetchThemeList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/item-tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存主题信息
 * @param {*} params
 * @returns
 */
export async function fetchSaveThemeType(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/add-event-type`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取风险事件类型对应的默认审批人
 * @param {*} params
 * @returns
 */
export async function fetchTypePeople(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define-theme-person/query-event-person`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询单据审批状态
 * @param {*} params
 * @returns
 */
export async function fetchApproveStatus(params) {
  return request(`/hwfp/v1/${getCurrentOrganizationId()}/activiti/task/taskEntry`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询跳转页面路径
 * @param {*} params
 * @returns
 */
export async function fetchPagePath(params) {
  return request(`/sslm/v1/${getCurrentOrganizationId()}/common-data/relation-req/url`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 查询质量整改参数
 * @param {*} params
 * @returns
 */
export async function fetchQualityParam(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/get-quality-params`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取处置列表
 * @param {*} params
 * @returns
 */
export async function fetchProcessList(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-event/process-rule-detail-by-event`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询单据 ID
 */
export async function fetchProblemId(params) {
  return request(`/sqam/v1/${getCurrentOrganizationId()}/problem-headers/query-by-problemNums`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询是否合作企业
 * @param {*} params
 * @returns
 */
export async function fetchCooperationFlag(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/exists-partner-relation`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询事件树形数据
 * @param {*} params
 * @returns
 */
export async function fetchEventTree(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/item-tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询订单状态
 * @param {*} params
 * @returns
 */
export async function fetchOrderStatus(params = {}) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/workbench-service-open`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取快捷入口权限
 * @param {*} params
 * @returns
 */
export async function fetchPermissions(params = {}) {
  return request(`/iam/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取 供应商360 老页面租户列表
 * @param {*} params
 * @returns
 */
export async function fetchSupplierList(params) {
  const { code } = params || {};
  return request(
    `/spfm/v1/${getCurrentOrganizationId()}/rel-table-records/${code}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}
