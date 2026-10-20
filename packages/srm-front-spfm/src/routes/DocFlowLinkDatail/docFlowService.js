/**
 * docFlowService
 * 单据流接口
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';

export async function queryToken(params) {
  const { currentOrganizationId, activeTabMenuId, ...otherParams } = params;
  return request(`/hwfp/v1/${currentOrganizationId}/activiti/task/token`, {
    query: otherParams,
    responseType: 'text',
    headers: {
      'H-Menu-Id': activeTabMenuId,
    },
  });
}

export async function queryMenuId() {
  // const { currentOrganizationId, menuId} = params;
  return request(`/iam/hzero/v1/menu`, {
    query: { code: 'srm.bg.manager.docflow.detail', level: 'organization' },
    // responseType: 'text',
    // headers: {
    //     'H-Menu-Id': menuId,
    // },
  });
}
