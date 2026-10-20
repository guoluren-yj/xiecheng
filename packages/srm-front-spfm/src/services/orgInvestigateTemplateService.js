/*
 * orgInvestigateTemplateService - 租户级调查表定义
 * @date: 2018/10/13 10:41:35
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchInvestigateList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
export async function addInvestigate(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates`, {
    method: 'POST',
    body: params,
  });
}
export async function changeInvestigate(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates`, {
    method: 'PUT',
    body: params,
  });
}
export async function handleEffect(params) {
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/${params}/effective`,
    {
      method: 'POST',
      body: params,
    }
  );
}
export async function queryUpdateTemplateId(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates/${params}/update-able`, {
    method: 'GET',
  });
}
/**
 * 未分配调查表模板公司查询
 */
export async function fetchUnassignedCompanies(params) {
  return request(
    `${SRM_SSLM}/v1/${params.organizationId}/investigate-assigns/unassignedCompanies`,
    {
      method: 'GET',
      query: params.body,
    }
  );
}
/**
 * 已分配调查表模板公司查询
 */
export async function fetchAssignedCompanies(params) {
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate-assigns/assignedCompanies`, {
    method: 'GET',
    query: params.body,
  });
}
/**
 * 分配模板给公司（从左到右）
 */
export async function investigateAssign(params) {
  return request(
    `${SRM_SSLM}/v1/${params.tenantId}/investigate-assigns/assign?tenantId=${params.tenantId}`,
    {
      method: 'POST',
      query: params.tenantId,
      body: params.body,
    }
  );
}
/**
 * 移除调查表模板（从右到左）
 */
export async function investigateUnAssign(params) {
  return request(
    `${SRM_SSLM}/v1/${params.tenantId}/investigate-assigns/unassign?tenantId=${params.tenantId}`,
    {
      method: 'POST',
      query: params.tenantId,
      body: params.body,
    }
  );
}

// http://dev.hzero.org:8180/manager/swagger-ui.html?tdsourcetag=s_pctim_aiomsg#!/investigate-config-component/batchUpdateComponentUsingPUT
// http://dev.hzero.org:8180/manager/swagger-ui.html?tdsourcetag=s_pctim_aiomsg#!/Investigate_Config_Component_Attribute/batchUpdateUsingPUT
/**
 * 调查模板明细组件属性列表
 */
export async function queryInvestigateConfigComponents(params) {
  if (params.isOrg) {
    // 租户级
    return request(
      `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-config-components/${
        params.investgCfLineId
      }`,
      {
        method: 'GET',
      }
    );
  } else {
    // 平台级
    return request(`${SRM_PLATFORM}/v1/investg-cf-cmpts`, {
      method: 'GET',
      query: {
        investgCfLineId: params.investgCfLineId,
      },
    });
  }
}

/**
 * 修改调查模板明细组件属性
 */
export async function saveInvestigateConfigComponents(params) {
  if (params.isOrg) {
    // 租户级
    return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-config-components`, {
      method: 'PUT',
      body: params.data,
    });
  } else {
    // 平台级
    return request(`${SRM_PLATFORM}/v1/investg-cf-cmpts/batch`, {
      method: 'PUT',
      body: params.data,
    });
  }
}
