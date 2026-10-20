/**
 * service - 反馈单
 * @date: 2020-01-20
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询反馈单字段配置
 */
export async function fetchConfig(params) {
  return request(`/siec/v1/${organizationId}/feed-back-field/table-list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询反馈单引用申请数据的弹框表格字段的配置
 * @param {*} params
 * @returns
 */
export async function fetchConfigReferencing(params) {
  return request(`/siec/v1/${organizationId}/feed-back-field/referencing/table-list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询反馈单数据（行）
 */
export async function fetchFeedbackLine(params) {
  return request(`/siec/v1/${organizationId}/feedback-data/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取getStatusConfigId
 */
export async function getStatusConfigId(params) {
  return request(
    `${SRM_SIEC}/v1/${organizationId}/status-interaction/queryInitialStateCorrespondingOperation`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 导入按钮是否显示
 */
export async function getImportButton(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/feedback-import/button/display`, {
    method: 'GET',
    query: params,
  });
}

/**
 *  提交操作
 */
export async function handleCommit(params) {
  const { statusConfigId, operationCode, templateCode, data } = params;
  return request(
    `${SRM_SIEC}/v1/${organizationId}/feedback-data/save?templateCode=${templateCode}&statusConfigId=${statusConfigId}&operationCode=${operationCode}`,
    {
      method: 'POST',
      body: data,
    }
  );
}
