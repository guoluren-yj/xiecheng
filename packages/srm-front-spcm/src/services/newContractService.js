/*
 * contractMaintainService - 新service
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { SRM_SPCM, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const { tenantNum } = getCurrentTenant() || {};

/**
 * 判断是新链路还是老链路
 * @param {*} params
 */
export async function queryNewOrOldLink() {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-common/use-new-link`, {
    method: 'GET',
  });
}

/**
 * 打印
 * @param {*} pcHeaderId
 */
export async function handlePrint(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/${pcHeaderId}/rtf-print`,
    {
      method: 'POST',
      responseType: 'blob',
    }
  );
}

/**
 * 引用采购申请创建协议时进行取价
 * @param {*} params
 */
export async function batchQueryPrice(params) {
  const { pcHeaderId, data } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-subject/batchQuery/${pcHeaderId}/price`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 寻源暂挂
 */
export async function toSuspend(data) {
  const { suspendFlag } = data[0];
  return request(
    `${SRM_SPCM}/v1/${organizationId}/source-results/suspend-flag?suspendFlag=${suspendFlag}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 业务规则定义-【协议生成付款计划】
 */
export async function createPaymentPlan(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/contract-cnf/get-pay-plan-setting?pcHeaderId=${pcHeaderId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 协议变更时数据预校验
 */
export async function preSubmitValid(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/contract-plan/stage-change-valida`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 预览合同文本
 * @returns
 */
export async function previewContractText(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/preview-contract-text`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 引用寻源结果是否需要带上扩展字段到协议
 * @returns
 */
export async function referenceWhitelist() {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-common/query-reference-whitelist`, {
    method: 'GET',
    responseType: 'text',
  });
}


/**
 * 协议通用变量配置查询
 * @returns
 */
export async function getCommonVariableConfig(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/spcm_pc_control_setting/page`,
    {
      method: 'POST',
      body: { tenantNum, ...params },
    }
  );
}

/**
 * 全选新建并单校验
 * @param {*} params
 * @returns
 */
export async function getSourceResultsAndCheckMerge(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/source-results/get-source-results-and-check-merge`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 在线聊天室
 * @param {object} params - 接口传参
 */
export async function initChatOnlineRoom(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/chatOnlineRoom`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询在线编辑共享配置
 * @param {*} params
 */
export async function queryShareEditConfig() {
  return request(`${SRM_SPCM}/v1/${organizationId}/edit-share/queryShareEditConfig`, {
    method: 'GET',
  });
}

/**
 * 查询文本对比下拉列表
 * @param {*} params
 */
export async function fetchCompareSelect(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-compare/get-compare-contract-file`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 不同版本的合同文本和最新合同文本对比
 * @param {*} params
 */
export async function fetchCompareFile(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-compare/get-compare-texts`, {
    method: 'GET',
    query: params,
  });
}
