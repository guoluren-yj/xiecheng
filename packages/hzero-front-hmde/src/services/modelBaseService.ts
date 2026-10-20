// import request from 'utils/request';
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * 模型发布
 */
export async function serviceRefreshService({ query = {} }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/refresh`, {
    method: 'GET',
    query,
  });
}

/**
 * 表同步
 */
export async function tableRefresh(tableId: string) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/refresh/${tableId}`, {
    method: 'GET',
    // query,
  });
}

/**
 * api表同步
 * ts化  入参  ->  apiId:number
 * 出参 -> void
 */
export async function synchronizeService(apiId) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/apis/${apiId}/refresh`,
    {
      method: 'PUT',
    }
  );
}

/**
 * 删除表
 */
export async function tableDeleteService({ body = {} }: any) {
  // console.log(body);
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/positive/delete-table`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 正向见表保存
 * */
export async function createTableService({ body = {} }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/positive/create-table`, {
    method: 'POST',
    body,
  });
}

/**
 * 批量生成逻辑模型
 * */
export async function batchGenerationModelService({ body = {} }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/batch-create`, {
    method: 'POST',
    body,
  });
}

/**
 * 上传脚本
 * */
export async function uploadService({ body = {}, query = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/ddl/batch-upload?serviceCode=${
      query.serviceCode
    }`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 查询基础表API菜单数据
 *  ts化  入参  ->  apiMethod:string ,apiPath:string
 *            出参->   getApiMenuList
 */
export async function getApiMenuList(query: any, viewType: string) {
  return request(
    viewType === 'labelView'
      ? `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/apis/page`
      : `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/apis/tree`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 删除API表
 *  出参数为ApiInfo 在getApiMenuList.d.ts中
 */
export async function deleteApiItem(body: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/apis`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 保存API表
 *  入参在saveApiInfo.d.ts
 * 出参为ApiInfo 在getApiMenuList.d.ts中
 */
export async function saveApiInfo(body: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/apis`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 查询租户数据库权限分配（服务 > 数据库 分级展示）
 * ts化  入参  ->  query
 * 出参->   getApiMenuList
 */
export async function queryBasicTableAuthorized(query: any = {}) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/datasource/assign`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 保存数据源表授权
 */
export async function saveDataSourceAuthorization({ query = {}, body = {} }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/datasource/assign`,
    {
      method: 'PUT',
      query,
      body,
    }
  );
}

/**
 * 保存API表授权
 */
export async function saveApiAuthorization({ query = {}, body = {} }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/datasource/assign`,
    {
      method: 'PUT',
      query,
      body,
    }
  );
}

/**
 * 全量保存已分配表
 */
export async function saveAllAssignedTable({ query = {}, body = {} }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/datasource/assign/table/replace`,
    {
      method: 'PUT',
      query,
      body,
    }
  );
}

/**
 * 全量保存已分配表
 */
export async function saveAllApiAssignedTable({ query = {}, body = {} }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/service/assign/api/replace`,
    {
      method: 'PUT',
      query,
      body,
    }
  );
}
