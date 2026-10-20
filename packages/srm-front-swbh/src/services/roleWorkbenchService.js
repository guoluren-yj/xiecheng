import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SWBH } from '_utils/config';
//  import { parseParameters } from 'utils/utils';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function getLayout() {
  return request(`${HZERO_PLATFORM}/v1/dashboard/layout`, {
    method: 'GET',
  });
}

// 卡片查询
export async function getCardSetting() {
  return request(`/swbh/v1/${organizationId}/card-setting/layout`, {
    method: 'GET',
  });
}

// 卡片汇总单据数量查询
export async function getDocTotal(params) {
  return request(`/swbh/v1/${organizationId}/card-search/total`, {
    method: 'GET',
    query: filterNullValueObject({ ...params }),
  });
}

// 卡片汇总单据数量查询
export async function getTransferTotalElements(params) {
  return request(`/swbh/v1/${organizationId}/card-search/transfer-total`, {
    method: 'GET',
    query: filterNullValueObject({ ...params }),
  });
}

// 单据查询
export async function queryList(params) {
  return request(`/swbh/v1/${organizationId}/card-search/query`, {
    method: 'GET',
    query: { ...params },
  });
}

// 筛选器查询
export async function queryCustomizeUnitCode(params) {
  return request(`/swbh/v1/${organizationId}/doc_data_search/doc/customizeUnitCode/query`, {
    method: 'GET',
    query: { ...params },
    responseType: 'text',
  });
}

// 关注忽略
export async function attentionIgnore(params) {
  return request(`/swbh/v1/${organizationId}/card-search/attention/ignore`, {
    method: 'GET',
    query: { ...params },
    responseType: 'text',
  });
}

/**
 * 查询单据类型
 * @param {*} params
 * @returns
 */
export async function getSearchCustomizer(params) {
  return request(`${SRM_SWBH}/v1/${getCurrentOrganizationId()}/doc_data_search/doc/customizeUnitCode/query`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

export async function todoDocStatus(params) {
  return request(`/swbh/v1/${organizationId}/card-search/todo/query`, {
    method: 'GET',
    query: { ...params },
    // responseType: 'text',
  });
}

// 是否显示采购驾驶舱
export async function isShowReportCards() {
  return request(`/sdat/v1/${organizationId}/report-cockpit-headers/verify-service`, {
    method: 'GET',
  });
}
