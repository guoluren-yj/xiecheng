/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-05 16:15:46
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-20 11:14:30
 */
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 保存属性定义
 * @param {Object} params - 查询参数
 */
export async function getSynsPlatform() {
  return request(`${SRM_MDM}/v1/${organizationId}/countrys/reference`, {
    method: 'POST',
  });
}

/**
 * 保存属性定义
 * @param {Object} params - 查询参数
 */
export async function saveAttribute(data) {
  return request(`${SRM_MDM}/v1/${organizationId}/countrys`, {
    method: 'PUT',
    body: data,
  });
}
