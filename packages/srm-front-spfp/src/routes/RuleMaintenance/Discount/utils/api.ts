/*
 * @Description: 通用接口
 * @Date: 2023-04-07 11:05:35
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = `${SRM_SPCM}/v1/${organizationId}`;

/**
 * @description:查询规则历史版本
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchRuleHistory(params) {
  return request(`${prefix}/pfp-rule/history/page`, {
    method: 'GET',
    query: { page: 0, size: 0, ...params },
  });
}

/**
 * @description:行编辑
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function edit(params) {
  const { ruleId } = params;
  return request(`${prefix}/pfp-rule/create/${ruleId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * @description:复制
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function copy(params) {
  return request(`${prefix}/pfp-rule/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * @description:启用/停用
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function changeEnable(params) {
  return request(`${prefix}/pfp-rule/enable`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * @description:根据场景id查询字段配置信息
 * @param {string} scenarioConfigId
 * @returns {object} fetch Promise
 */
export async function getFieldsConfig(scenarioConfigId) {
  return request(`${prefix}/preferential-common/dimension-info/by-scenario/list`, {
    method: 'GET',
    query: { scenarioConfigId },
  });
}

/**
 * @description:获取查询视图数据
 * @param {object} ruleId
 * @returns {object} fetch Promise
 */
export async function getQueryDataApi(ruleId) {
  return request(`${prefix}/pfp-rule-dimension-info/queryViewList`, {
    method: 'GET',
    query: { ruleId, page: 0, size: 10 },
  });
}




