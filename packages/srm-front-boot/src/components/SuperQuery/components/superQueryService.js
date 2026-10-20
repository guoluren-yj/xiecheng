import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SWBH } from '@/utils/config';

export async function getSearchSetting() {
  return request(`${SRM_SWBH}/v1/${getCurrentOrganizationId()}/card-setting/doc-search-setting`, {
    method: 'GET',
  });
}
export async function getSearchCustomize(params) {
  return request(
    `${SRM_SWBH}/v1/${getCurrentOrganizationId()}/doc_data_search/doc/customizeUnitCode/query`,
    {
      method: 'GET',
      query: params,
      responseType: 'text',
    }
  );
}
/**
 * 访问历史查询
 * @returns
 */
export async function getAccessQuery() {
  return request(`${SRM_SWBH}/v1/${getCurrentOrganizationId()}/card-search/history/query`, {
    method: 'GET',
  });
}
/**
 * 访问历史存储
 * @returns
 */
export async function getAccessStore(params) {
  return request(`${SRM_SWBH}/v1/${getCurrentOrganizationId()}/card-search/history/insert`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 访问历史删除
 * @returns
 */
export async function getAccessDelete() {
  return request(`${SRM_SWBH}/v1/${getCurrentOrganizationId()}/card-search/history/delete`, {
    method: 'DELETE',
    // body: params,
  });
}
