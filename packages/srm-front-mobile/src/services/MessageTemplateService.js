/* eslint-disable no-param-reassign */
import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 保存消息模板
 * @returns
 */
export async function saveMessageTemplate(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/msg/template/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取卡片列表
 */
export async function getMessageCardList(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/msg/template/content/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 编辑卡片
 */
export async function editMessageCard(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/msg/template/content/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除卡片
 */
export async function deleteMessageCard(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/msg/template/content/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 复制卡片
 */
export async function coypMessageTemplate(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/msg/template/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除模板
 */
export async function deleteMessageTemplateApi(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/robot/msg/template/delete`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchLovDetail(params) {
  return request(`/hpfm/v1/0/lov-headers/${params.lovId}`, {
    method: 'GET',
    query: params,
  });
}
