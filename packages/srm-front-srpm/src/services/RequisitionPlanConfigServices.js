/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-25 14:27:32
 * @LastEditors: yanglin
 * @LastEditTime: 2021-11-25 14:33:08
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SRPM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 复制需求计划配置
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function copyContainer(body) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-container/copy`, {
    method: 'POST',
    body,
  });
}

/**
 * 创建或修改需求计划配置
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function saveContainer(body) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-container`, {
    method: 'POST',
    body,
  });
}

/**
 * 需求计划配置明细
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchContainer(containerId) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-container/detail/${containerId}`, {
    method: 'GET',
  });
}

/**
 * 需求计划配置历史列表
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchContainerHistory(containerId) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-container/history/${containerId}`, {
    method: 'GET',
  });
}

/**
 * 需求计划配置删除行
 * @async
 * @returns {object} fetch Promise
 */
export async function deleteLines(body) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-container/lines`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 发布需求计划配置
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function releaseContainer(body) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-container/release`, {
    method: 'POST',
    body,
  });
}
