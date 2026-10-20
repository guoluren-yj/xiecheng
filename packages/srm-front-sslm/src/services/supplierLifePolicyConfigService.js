/*
 * @Date: 2022-09-22 20:52:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 阶段配置-查询
export async function searchStageNodes(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-configs`, {
    method: 'GET',
    query: params,
  });
}

// 阶段配置-校验节点是否可删除
export async function checkStageNodes(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-stages/valid`, {
    method: 'POST',
    query: params,
  });
}

// 阶段配置-生效
export async function saveStageNodes(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-configs/from/strategy`, {
    method: 'PUT',
    body: params,
  });
}

// 查询历史版本
export async function queryHistoryVersion(params) {
  const { strategyCode, ...query } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys/history/${strategyCode}`, {
    method: 'GET',
    query,
  });
}

// 查询管控维度
export async function queryDimension(params) {
  const { strategyId, ...query } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategy-dim-sups/${strategyId}`, {
    method: 'GET',
    query,
  });
}

// 保存管控维度
export async function saveStrategy(params) {
  const { strategyId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys/saveConfig/${strategyId}`, {
    method: 'POST',
    body,
  });
}

// 发布管控维度
export async function publishStrategy(params) {
  const { strategyId, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys/release/${strategyId}`, {
    method: 'POST',
    body,
  });
}

// 分配公司
export async function assignCompany(params) {
  const { strategyId, selectedRows } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle-strategy-dim-sups/${strategyId}/company`,
    {
      method: 'POST',
      body: selectedRows,
    }
  );
}

// 适用阶段-查询
export async function queryApplyStage(params) {
  const { strategyId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle-strategy-stages/detailStrategy/${strategyId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 适用阶段-删除
export async function deleteApplyStage(params) {
  const { strategyStageId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategy-stages/${strategyStageId}`, {
    method: 'DELETE',
  });
}

// 适用阶段-恢复默认
export async function resetDefault(params) {
  const { strategyId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategy-stages/${strategyId}`, {
    method: 'PUT',
  });
}

// 流程设置-查询流程详情
export async function queryStageProcess(params) {
  const { strategyStageProcId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/stage-proc-branchs/${strategyStageProcId}`, {
    method: 'GET',
    query: others,
  });
}

// 流程设置-删除流程
export async function deleteStageProcess(params) {
  const { strategyStageProcId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-stage-procs/${strategyStageProcId}`, {
    method: 'DELETE',
    body: others,
  });
}

// 流程设置-批量创建流程
export async function batchCreateProcess(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-stage-procs/batch`, {
    method: 'POST',
    body: params,
  });
}

// 流程设置-查询批量创建的流程
export async function batchQueryProcess(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-stage-procs/batch/search`, {
    method: 'POST',
    body: params,
  });
}

// 流程设置-保存批量创建的流程节点
export async function batchSaveProcess(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-stage-procs/batch/procNodes`, {
    method: 'POST',
    body: params,
  });
}

// 查询流程明细
export async function queryProcessDetail(params) {
  const { currentProcId, ...others } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/stage-proc-branchs/${currentProcId}/all-detail`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 启用、禁用、编辑策略（路径上是草稿id）
export async function enable(params) {
  const { draftId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys/${draftId}`, {
    method: 'PUT',
    body: params,
  });
}
