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
  const { data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}
export async function changeInvestigate(params) {
  const { customizeUnitCode, addList = [] } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates`, {
    method: 'PUT',
    body: addList,
    query: { customizeUnitCode },
  });
}
export async function updateBasicInfo(params) {
  const { data, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates/update-basic-info`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}
export async function handleEffect(params) {
  const { investigateTemplateId = '', customizeUnitCode } = params;
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/${investigateTemplateId}/effective`,
    {
      method: 'POST',
      body: params,
      query: { customizeUnitCode },
    }
  );
}
export async function queryUpdateTemplateId(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates/${params}/update-able`, {
    method: 'GET',
    responseType: 'text',
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
      query: parseParameters(params.body),
    }
  );
}
/**
 * 已分配调查表模板公司查询
 */
export async function fetchAssignedCompanies(params) {
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate-assigns/assignedCompanies`, {
    method: 'GET',
    query: parseParameters(params.body),
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
      query: params.query,
    });
  } else {
    // 平台级
    return request(`${SRM_PLATFORM}/v1/investg-cf-cmpts/batch`, {
      method: 'PUT',
      body: params.data,
      query: params.query,
    });
  }
}

/**
 * 保存条件配置
 */
export async function handeleSaveRule(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/save-config`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 复制调查表模板
 */
export async function investigateTemptCopy(params) {
  const { investigateTemplateId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate-templates/copy/${investigateTemplateId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 保存模板字段配置自定义条件
 */
export async function saveConditionRule(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investg-cf-line-fx/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询模板字段配置自定义条件
 */
export async function queryConditionRule(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investg-cf-line-fx/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 解锁调查表
 */
export async function handleUnlock(params) {
  const { investigateTemplateId = '' } = params;
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/${investigateTemplateId}/copy`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 保存组件属性公式配置
 */
export async function handleSaveExpressionConfig(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/updateConfigLineExpress`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 调查表模板分配公司保存
 */
export async function investigateAssignCompany(params) {
  const { templateCode, body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-assigns/assign/save-all`, {
    method: 'POST',
    query: { templateCode },
    body,
  });
}

// 调查表模板定义-列表导入
export async function importTempDetail(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-templates/import-template`, {
    method: 'POST',
    body: params,
  });
}

// 分配公司
export async function assignCompany(params) {
  const { companyList, templateCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate-assigns/assign-companies-new`, {
    method: 'POST',
    body: companyList,
    query: { templateCode },
  });
}

// 保存适用功能
export async function saveApplicableFunction(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/investigate-templates/update-assign-menu-scope`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
