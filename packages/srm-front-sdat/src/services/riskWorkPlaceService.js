/* eslint-disable no-param-reassign */
/**
 * 风险工作台
 * @date: 2023-04-10
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
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
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events`, {
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
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/status-report`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchLevelChartData: 风险级别图表数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchLevelChartData(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/level-report`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchBarChartData: 柱状图图表数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchBarChartData(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/theme-code-report`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchRecallProcess: 撤回操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchRecallProcess(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-process/recall/${
      params.riskProcessId
    }`,
    {
      method: 'PUT',
      body: params,
    }
  );
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
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-process/${
      params.riskProcessId
    }`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchApprovePeople: 风险广播人群
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchApprovePeople(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-process/${
      params.riskProcessId
    }/users`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchCloseData: 关闭当前单据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchCloseData(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/update-event`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * fetchDynamicDetail: 查询事件动态详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchDynamicDetail(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/event-detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询监控信息
 * @param {*} params
 * @returns
 */
export async function fetchMonitorMsg(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-company`, {
    method: 'GET',
    query: params,
  });
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
  // const actionList = param?.processAction ?? [];
  const userList = param?.customerRiskProcessPersonList ?? [];

  if (userList.length) {
    userList.forEach((item) => {
      item.userId = item.id || item.userId;
    });
  }

  // delete param.processAction;

  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-process`, {
    method: 'POST',
    body: {
      ...param,
      // processAction: actionList.join(','),
      customerRiskProcessPersonList: userList,
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
  const userList = param?.customerRiskProcessPersonList ?? [];

  if (userList.length) {
    userList.forEach((item) => {
      item.userId = item.id || item.userId;
    });
  }

  delete param.processAction;

  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-process`, {
    method: 'POST',
    body: {
      ...param,
      processAction: actionList.join(','),
      customerRiskProcessPersonList: userList,
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
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/event-operate-log`, {
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
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/customer-risk-events/query-event-type`,
    {
      method: 'GET',
      query: params,
    }
  );
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
