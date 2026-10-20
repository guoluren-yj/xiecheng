/**
 * 规则配置 Service
 * @date: 2021-06-24
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function queryRuleManageConfigOrg(params) {
  return request(
    `${SRM_DATA_PROCESS}/v1/${organizationId}/cnf-meta-definitions/${params.metaDefinitionId}`,
    {
      method: 'GET',
    }
  );
}

export async function saveRuleManageConfigOrg(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/cnf-meta-definitions`, {
    method: 'POST',
    body: params,
  });
}

export async function queryRuleManageConfig(params) {
  return request(`${SRM_DATA_PROCESS}/v1/cnf-meta-definitions/${params.metaDefinitionId}`, {
    method: 'GET',
    query: {
      tenantId: params.tenantId,
    },
  });
}

export async function saveRuleManageConfig(params) {
  return request(`${SRM_DATA_PROCESS}/v1/cnf-meta-definitions`, {
    method: 'POST',
    body: params,
    query: {
      tenantId: params.tenantId,
    },
  });
}

export async function createTenantRuleMessages(params) {
  return request(`${SRM_DATA_PROCESS}/v1/cnf-meta-definitions/saveMetaDefinitionForOrg`, {
    method: 'POST',
    body: params,
  });
}

// --------------------
// 以下是新增的service —— 2021.01.22版本迭代的新版规则管理页面需要的服务

// 规则对应的指标的维度新建时初始化
export async function initIndexDimesion(params) {
  return request(
    `${SRM_DATA_PROCESS}/v1/rule-management-lines/dimensionality/init/${params.serviceCode}`,
    { method: 'GET' }
  );
}

// 规则管理平台级进入时数据同步检查
export async function checkIsSync() {
  return request(`${SRM_DATA_PROCESS}/v1/rule-management-headers/isSync`, { method: 'GET' });
}

// 规则管理平台级数据同步
export async function dataSync() {
  return request(`${SRM_DATA_PROCESS}/v1/rule-management-headers/dataSync `, { method: 'GET' });
}

// --------------------
