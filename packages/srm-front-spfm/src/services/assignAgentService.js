/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-09 17:24:32
 * @LastEditors: yanglin
 * @LastEditTime: 2022-11-25 15:23:02
 */
/**
 * assignOrganization 分配采购员
 * @date: 2020-02-18
 * @author: ls <shuo.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询分配采购组织
 */
export async function fetchPurAgent(params = {}) {
  const { purchaseOrgId, ...other } = params;
  const param = parseParameters(other);
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/purchase/org/${purchaseOrgId}/assign-agent`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 删除
 */
export async function deletePurAgent(params = {}) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/purchase/org/assign-agent`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 增加
 */
export async function addPurAgent(params = {}) {
  const { query, body } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/purchase/org/assign-agent`, {
    method: 'POST',
    body,
    query,
  });
}

/**
 * 设置默认采购员
 */
export async function setDefaultPurAgent(body = {}) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/purchase/org/assign-agent/default`, {
    method: 'POST',
    body,
  });
}
