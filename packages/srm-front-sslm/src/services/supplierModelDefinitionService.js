/**
 * service - 供应商模型定义
 * @date: 2020/7/22
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 保存头
 * @param {*}
 * @returns
 */
export async function saveHeader(payload) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-settings`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * 保存头
 * @param {*}
 * @returns
 */
export async function saveFieldPropertys(payload = []) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-line-propertys/save`, {
    method: 'POST',
    body: payload,
  });
}
