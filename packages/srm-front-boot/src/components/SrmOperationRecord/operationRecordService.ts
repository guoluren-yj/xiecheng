/**
 * docFlowService
 * 单据流接口
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export async function queryActions(params: any) {
  const { operationUrl, operationParams } = params;
  return request(operationUrl, {
     query: operationParams,
  });
}

// 查询审批历史记录
export async function fetchHistoryApproval(params) {
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/activiti/task/historyApproval`, {
    method: 'POST',
    query: params,
  });
}
