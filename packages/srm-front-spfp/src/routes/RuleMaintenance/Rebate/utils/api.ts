import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = `${SRM_SSTA}/v1/${organizationId}`;

/**
 * @description:查询规则历史版本
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchRuleHistory(params)
{
  return request(`${prefix}/rules/history/page`, {
    method: 'GET',
    query: { page: 0, size: 0, ...params },
  });
}

/**
 * @description:行编辑
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function edit(params)
{
  const { ruleId } = params;
  return request(`${prefix}/rules/create/${ruleId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * @description:复制
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function copy(params)
{
  return request(`${prefix}/rules/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * @description:根据场景id查询字段配置信息
 * @param {string} scenarioConfigId
 * @returns {object} fetch Promise
 */
export async function getFieldsConfig(scenarioConfigId)
{
  return request(`${prefix}/preferential-common/dimension-info/by-scenario/list`, {
    method: 'GET',
    query: { scenarioConfigId },
  });
}

/**
 * @description:新建
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function create(params)
{
  const { ruleId } = params;
  return request(`${prefix}/rules/create/${ruleId}`, {
    method: 'PUT',
    body: params,
  });
}


/**
 * @description:获取查询视图数据
 * @param {object} ruleId
 * @returns {object} fetch Promise
 */
export async function getQueryDataApi(ruleId)
{
  return request(`${prefix}/rule-dimension-infos/${ruleId}/view`, {
    method: 'GET',
    query: { page: 0, size: 10 },
  });
}


export async function ruleUpdateValidate(body) {
  return request(`${prefix}/rules/update/validate`, {
    method: 'POST',
    body,
  });
}

export async function rulePublishValidate(body) {
  return request(`${prefix}/rules/publish/validate`, {
    method: 'POST',
    body,
  });
}




