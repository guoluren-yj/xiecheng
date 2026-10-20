/**
 * 卡片管理
 * @date: 2022-08-09
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchChangeStatus: 变更状态
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchChangeStatus(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除对应 attachmentUuid 下面所有文件
 * @param {s} params
 * @returns
 */
export async function fetchRemoveFile(params) {
  return request(`${HZERO_FILE}/v1/files/delete-by-uuid?bucketName=${params.bucketName}`, {
    method: 'POST',
    body: params.attachmentList,
  });
}

/**
 * 保存商品
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSaveProduct(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 初始化商品数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchInitData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity/init-data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取商品分类树
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchTreeData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity-category/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 上传文件
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchUploadFile(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity/import-price?commodityCode=${
      params.commodityCode
    }&tenantCommodityId=${params.tenantCommodityId}`,
    {
      method: 'POST',
      body: params.formData ?? {},
    }
  );
}

/**
 * 获取商品价格
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchGetPrice(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-commodity/get-price`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取商品价格图表数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchChartData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-market-data/trend-chart`, {
    method: 'GET',
    query: params,
  });
}
