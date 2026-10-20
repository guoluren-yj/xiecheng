/**
 * 卡片配置
 * @date: 2022-08-18
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * getTemplateLayout: 获取模板布局详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getTemplateLayout(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-cockpit-templates/cockpit-header`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchReadyCards: 可加入布局的卡片列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchReadyCards(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers/ready-cards?page=-1`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchOrderStatus: 查询是否开通订单
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getOrderStatus(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers/verify-service`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getSheetList: 查询头卡片列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getSheetList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getHeaderLayout: 查询单个布局数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getHeaderLayout(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers/cockpit-header`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchSaveHeader: 保存头信息
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSaveHeader(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchSaveLayout: 保存卡片配置信息
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSaveLayout(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers/lines`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchCardLayout: 获取卡片信息列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchCardLayout(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers/lines`, {
    method: 'GET',
    query: params,
  });
}

/**
 * getTemplateList: 获取模板列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getTemplateList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-templates/ready-templates`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchDeleteLayout: 删除操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchDeleteLayout(params) {
  return request(`${SRM_DATA_SDAT}/v1/${organizationId}/report-cockpit-headers`, {
    method: 'DELETE',
    body: params,
  });
}
