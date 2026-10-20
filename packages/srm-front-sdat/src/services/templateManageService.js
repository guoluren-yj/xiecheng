/**
 * 模板管理
 * @date: 2022-10-21
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchEnabledTemplate: 模板禁用启用操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchEnabledTemplate(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-cockpit-templates`, {
    method: 'POST',
    body: params,
  });
}

/**
 * getTemplateDetail: 查询模板详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getTemplateDetail(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-cockpit-templates`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchAddDefault: 添加默认
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAddDefault(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-cockpit-templates/modify-default`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchUpdate: 更新数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchUpdate(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-cockpit-templates`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchSaveHeader: 保存头信息
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSaveHeader(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-cockpit-templates/cockpit-header`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchReadyCards: 可加入布局的卡片列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchReadyCards(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-cockpit-templates/ready-cards?page=-1`, {
    method: 'GET',
    query: params,
  });
}

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
