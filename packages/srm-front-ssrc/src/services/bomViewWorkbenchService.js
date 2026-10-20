/*
 * @Description: 价格BOM工作台 services
 * @Date: 2024-02-23 16:14:26
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import request from 'utils/request';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SPC}/v1`;

/**
 * 价格BOM-视图请求头配置
 * @async
 * @function fetchBomLibHeaderConfig
 */
export async function fetchBomLibHeaderConfig(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-dim/list-all`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 发布
 * @export
 * @param {Object} data
 * @returns
 */
export async function release(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-workbenches/release`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 单个保存
 * @export
 * @param {Object} data
 * @returns
 */
export async function singleSave(data) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/price-bom-workbenches/save-details-lines`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 编辑
 * @export
 * @param {Object} data
 * @returns
 */
export async function editNew(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-workbenches/edit`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 启用/禁用
 * @export
 * @param {Object} data
 * @returns
 */
export async function enabled(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-workbenches/isEnabled`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 删除
 * @export
 * @param {Object} data
 * @returns
 */
export async function deleteRecord(data) {
  return request(`${prefix}/${getCurrentOrganizationId()}/price-bom-workbenches`, {
    method: 'DELETE',
    body: data,
  });
}

// bom-操作记录
export async function fetchOperationRecords(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-action/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}
