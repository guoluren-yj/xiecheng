/* eslint-disable no-param-reassign */
import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 技能上线
 */
export async function onlineSkill(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/skill/online`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 技能下线
 */
export async function offlineSkill(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/skill/offline`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 技能复制
 */
export async function copySkill(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/skill/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 技能任务上线
 */
export async function onlineTask(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/task/online`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 技能任务下线
 */
export async function offlineTask(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/task/offline`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询数据源规则
 */
export async function getDataSourceRuleStatment(taskId) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/rule/query/${taskId}`, {
    method: 'GET',
  });
}

/**
 * 保存数据源规则
 */
export async function saveContantObjRuleStatment(taskId, params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/rule/save/${taskId}`, {
    method: 'POST',
    body: params,
  });
}

export async function getSkillRuleStatement(taskId) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/rule/query/${taskId}`, {
    method: 'GET',
  });
}

/**
 * 删除技能
 */
export async function deleteSkillApi(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/skill/delete`, {
    method: 'POST',
    body: params,
  });
}
