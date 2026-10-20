/* eslint-disable no-nested-ternary */
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * 修改数据源
 */
export async function sourceEditService({ body = [] }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects`, {
    method: 'PUT',
    body,
  });
}

/**
 * 新建数据源
 */
export async function sourceCreateService({ body = [] }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects`, {
    method: 'POST',
    body,
  });
}

/**
 * 继承数据源
 */
export async function sourceExtendService({ body = [] }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects/extend`, {
    method: 'POST',
    body,
  });
}

/**
 * 删除数据源
 */
export async function sourceDeleteService({ body = [] }: any = {}) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects?bothDeletePub=true`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 数据源发布
 */
export async function sourcePublishService({ body = [] }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects/batch-publish`, {
    method: 'PUT',
    body,
  });
}
/**
 * 根据数据源code,数据源查询详情
 */
export async function querySourceDetailService({ query = {} }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects`, {
    method: 'GET',
    query,
  });
}
/**
 * 获取树形结构左边列表
 */
export async function querySourceLeftTreeService({ query = {} }: any = {}): Promise<
  model.data.DataSourceTreeVO
> {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 模型list查询
 */
// export async function querySourceListService({ query = {} } = {}) {
//   return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects/list`, {
//     method: 'GET',
//     query,
//   });
// }

/**
 * 查询模型字段POST /v1/{organizationId}/data-objects/source-field-list
 */
export async function querySourceFieldsService({ query = {}, body = [] }: any = {}): Promise<
  model.data.DataObjectFieldVO[]
> {
  const _body = body.map((item) => ({
    extendsParentCode: item.extendsParentCode,
    logicModelCode: item.logicModelCode,
    logicModelName: item.logicModelName,
    logicModelId: item.logicModelId,
    relationCode: item.relationCode,
    masterFlag: item.masterFlag === 1 ? 1 : 0,
  }));
  // code=79f43bccd601447097ed07e5018ab85d
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects/data-field-list`, {
    method: 'POST',
    query,
    body: _body,
  });
}

/**
 * 获取关联模型列表
 */
export async function queryRelationListService({ query = {}, body = [] }: any = {}): Promise<
  model.BaseLogicModel[]
> {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/data-objects/relation-list`,
    {
      method: 'POST',
      query,
      body: body.headers,
    }
  );
}

/**
 * 获取模型数据
 */
export async function queryModelDataService({ query = {} }: any = {}): Promise<model.LogicModel> {
  const { id, ...rest } = query;
  // query:logicModelCode
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/${id}`, {
    method: 'GET',
    query: rest,
  });
}

/**
 * 校验虚拟字段表达式
 */
export async function checkVirtualFields({ body }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-objects/check-formula`, {
    method: 'POST',
    body,
  });
}

/**
 * 解除模型对象的扩展表绑定并删除所有扩展字段
 */
export async function unBindRedundantTableServices({ body, id }: any) {
  //  /v1/{organizationId}/logic-models/{id}/unbind-redundant-table
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/logic-models/${id}/unbind-redundant-table`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 保存数据对象授权租户
 */
// export async function saveSourceAuthorization({ body }: any) {
//   return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-assigns`, {
//     method: 'POST',
//     body,
//   });
// }

/**
 * 批量保存数据对象授权租户
 */
export async function saveBatchAuthorization(body: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-assigns`, {
    method: 'POST',
    body,
  });
}

/**
 * 保存字段映射关系
 */
export async function saveFieldMapping(body: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-relations`, {
    method: 'POST',
    body,
  });
}

/**
 * 删除字段映射关系
 */
export async function batchRemoveFieldMapping(body: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-relations`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 查询字段映射关系组
 */
export async function fetchFieldMappingGroup(query: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-relations/query-group`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询字段映射行
 */
export async function fetchFieldMappingLine(query: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-field-relations/${query.dataRelationId}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 获取API类型数据启用/禁用的状态
 */
export async function fetchApiDisableStatus(dataObjectId: string | number) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-api/${dataObjectId}/list`, {
    method: 'GET',
  });
}

/**
 * 更新API类型数据启用/禁用的状态
 */
export async function updateApiDisableStatus(dataObjectId: string | number, body: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/data-api/${dataObjectId}/updateStatus`,
    {
      method: 'POST',
      body,
    }
  );
}
