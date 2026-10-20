/**
 * adaptorTaskService.js
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_ADAPTOR } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${organizationId}` : `${SRM_ADAPTOR}/v1`;
const debugUrlPre = tenantFlag ? `v1/${organizationId}` : `v1`;

export async function queryAdaptorTask(params) {
  return request(`${requestUrlPre}/adaptor-task-headers/${params.headerId}`, {
    method: 'GET',
  });
}

export async function saveAdaptorScript(params) {
  return request(`${requestUrlPre}/adaptor-task-headers/adaptor-save`, {
    method: 'POST',
    body: params,
  });
}

export async function saveAdaptorTask(params) {
  return request(`${requestUrlPre}/adaptor-task-headers/save`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteAdaptorTask(params) {
  return request(`${requestUrlPre}/adaptor-task-headers`, {
    method: 'DELETE',
    body: params,
  });
}

export async function queryScriptConfig() {
  return request(`${requestUrlPre}/adaptor-task-lines/test-structure`, {
    method: 'GET',
  });
}

export async function testScript(params) {
  const { scriptVersion, bindRoutePrefix, debugTenantNum } = params;
  // 3版本 ： 新的url
  // 2版本 ： 原来的url
  const url =
    // eslint-disable-next-line eqeqeq
    scriptVersion == 3
      ? `/${bindRoutePrefix}/${debugUrlPre}/script-debug/run`
      : `${SRM_ADAPTOR}/${debugUrlPre}/js-execute/js-test`;
  return request(url, {
    method: 'POST',
    body: params.body,
    query:
      scriptVersion === 3
        ? {
            debugTenantNum,
          }
        : {
            scriptVersion,
            debugTenantNum,
          },
  });
}

export async function setAdaptorEnabled(params) {
  const fetchUrl = `${requestUrlPre}/adaptor-task-headers/toggle-cache`;
  return request(fetchUrl, {
    method: 'GET',
    query: params,
  });
}

export async function fetchOutput(params) {
  const fetchUrl = `${SRM_ADAPTOR}/v1/adaptor-task-headers/task-config-one`;
  // const fetchUrl = `${SRM_PLATFORM}/v1/rel-table-records/adaptor_available_taskcode/lov?lovCode=SADA.TASK_CODE`;
  return request(fetchUrl, {
    method: 'GET',
    query: params,
  });
}

export async function saveScriptDataService(params) {
  return request(`${requestUrlPre}/adaptor-script/script-save`, {
    method: 'POST',
    body: params,
  });
}

export async function getScriptDataService(params) {
  return request(`${requestUrlPre}/adaptor-script/script/${params}`, {
    method: 'GET',
    responseType: 'text',
  });
}

export async function getComplementaryWordsService() {
  return request(`${requestUrlPre}/adaptor-script/auto-prompt`, {
    method: 'GET',
    responseType: 'text',
  });
}

// 租户级服务查询接口
export async function queryAdaptorServiceOrg() {
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/adaptor-task-headers/adaptor-service`, {
    method: 'GET',
  });
}

// 平台级服务查询接口
export async function queryAdaptorService() {
  return request(`${SRM_ADAPTOR}/v1/adaptor-task-headers/service-list`, {
    method: 'GET',
  });
}

// 加入收藏接口接口
export async function addAdaptorFavorite(params) {
  return request(`${requestUrlPre}/adaptor-favorites`, {
    method: 'POST',
    body: params,
  });
}

// 移除收藏接口接口
export async function deleteAdaptorFavorite(params) {
  return request(`${requestUrlPre}/adaptor-favorites`, {
    method: 'DELETE',
    body: params,
  });
}
