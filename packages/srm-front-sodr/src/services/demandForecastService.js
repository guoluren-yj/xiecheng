/*
 * sendOrderService - 我发出的订单
 * @date: 2018/10/13 11:44:47
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

// import { HZERO_FILE } from 'utils/config';
import { SRM_SPRM, SRM_PLATFORM, SRM_MDM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询我发出的订单列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function fetchList(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast/list`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询我发出的订单列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function fetchListSupplier(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast-supplier/check`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 操作记录
 * @param {object} params
 */
export async function fetchOperationRecordList(params) {
  const { forecastId, ...otherParams } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast/action/${forecastId}/history`, {
    method: 'GET',
    query: parseParameters(otherParams),
  });
}

/**
 * 保存
 * @param {object} params
 */
export async function fetchSave(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast/save`, {
    method: 'POST',
    body: params.data,
    query: { customizeUnitCode: params.customizeUnitCode },
  });
}

/**
 * 发布
 * @param {object} params
 */
export async function batchRelease(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast/release`, {
    method: 'POST',
    body: params.data,
    query: { customizeUnitCode: params.customizeUnitCode },
  });
}

/**
 * 批量删除
 * @param {object} params
 */
export async function batchDelete(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast/delete`, {
    method: 'DELETE',
    body: params.data,
  });
}

/**
 * 批量关闭
 * @param {object} params
 */
export async function batchClose(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast/close`, {
    method: 'POST',
    body: params.data,
  });
}

/**
 * 预测单批量反馈
 * @param {object} params
 */
export async function fetchFeedback(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast-supplier/feedback`, {
    method: 'PUT',
    body: params.data,
    query: { customizeUnitCode: params.customizeUnitCode },
  });
}

/**
 * 预测单批量反馈
 * @param {object} params
 */
export async function fetchSupplySave(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/forecast-supplier/save`, {
    method: 'POST',
    body: params.data,
    query: { customizeUnitCode: params.customizeUnitCode },
  });
}

/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 查询预测单详情
 * @param {object} params
 */
export async function getDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { forecastId, bizFlag, operateType } = query;
  return request(
    `${SRM_SPRM}/v1/${organizationId}/demand-forecast-detail/${forecastId}/${bizFlag}`,
    {
      method: 'GET',
      query: { operateType },
    }
  );
}

/**
 * 保存预测单详情
 * @param {object} params
 */
export async function detailSave(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/demand-forecast-detail/save`, {
    method: 'POST',
    body: params.data,
    query: { operateType: params.operateType },
  });
}

export async function queryPermissions(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}
