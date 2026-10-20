/**
 * 会员中心 - service
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { MEMBER_MANAGE } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 启用或禁用标签数据
 * @export
 * @param {*} params
 * @returns
 */
export async function enabledTagItem(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/member-labels`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量发放积分
 * @export
 * @param {*} params
 * @returns
 */
export async function modifyPointsList(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/members/modify-list`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新积分信息
 * @export
 * @param {*} params
 * @returns
 */
export async function modifyPointsItem(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/members/modify`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取标签列表
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchTagList(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/member-labels`, {
    method: 'GET',
    query: params,
  });
}

export async function modifyMemberLabel(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/members/modify-member-label-rel`, {
    method: 'POST',
    body: params,
  });
}

export async function getMemberLabel(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/member-labels`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchSaveMember(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/members`, {
    method: 'POST',
    body: params,
  });
}
