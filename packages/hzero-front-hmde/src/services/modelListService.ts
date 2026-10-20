import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

// import ServerResponse, { FailureResponse } from '@/typings/ServerResponse'

// 查询应用列表
export async function queryAppListService() {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/app`, {
    method: 'GET',
    query: {
      size: 999,
    },
  });
}

/**
 * 模型发布
 */
export async function modelReleaseService({ query = {} }: any = {}) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/${query.id}/publish`,
    {
      method: 'PUT',
    }
  );
}

/**
 * 查询左边侧边栏数据
 */
export async function queryModelList({ query = {} }: any = {}): Promise<model.LogicModelTreeVO> {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/list`, {
    method: 'GET',
    query,
  });
}

export async function queryModelListPage(
  params: {
    query: {
      dataSourceType?: 'TABLE' | 'API';
      page: number;
      size: number;
      tenantId?: number;
    };
  } = { query: { page: 0, size: 20 } }
) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/logic-models/page`,
    {
      method: 'GET',
      query: {
        tenantId: isTenantRoleLevel() ? getCurrentOrganizationId() : undefined,
        ...params.query,
        includePlatformSameCode: true,
      },
    }
  );
}

/**
 * 获取API模型字段定义数据
 *  入参->logicModelId：number|string,ModelField 在queryRelationListService.d.ts
 *      出参->ModelField[] 在queryRelationListService.d.ts
 * */
export async function getApiFieldsService(id) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-fields/${id}/list?fieldType=API_FIELD`,
    {
      method: 'GET',
    }
  );
}

/**
 * 保存API模型接口定义头行数据
 *  入参->logicModelId：number|string
 *      出参->ModelApiBind 在getInterfaceInfoService.d.ts
 * */
export async function saveApiInterfaceService({ body, query }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-api-binds/${query.logicModelId}`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 删除API模型接口定义头行数据
 *  入参->logicModelId：number|string
 *      出参->ModelApiBind 在getInterfaceInfoService.d.ts
 * */
export async function deleteApiInterfaceService({ logicModelId, body }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-api-binds/${logicModelId}`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * API模型接口定义查询
 *  入参->logicModelId：number|string
 *      出参->ModelApiBind 在getInterfaceInfoService.d.ts
 * */
export async function getInterfaceInfoService(query: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-api-binds/${query.logicModelId}/list`,
    {
      method: 'GET',
    }
  );
}

/**
 * 删除左边侧边栏模块数据
 */
export async function deleteModelList({ body = {} }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/batch-delete`, {
    method: 'DELETE',
    body: [body],
  });
}

/**
 * 查询模型关系下拉框数据
 * */
export async function modelObjectsSelectService({ query = {} }: any = {}): Promise<
  // model.ModelField[]
  any
> {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-fields/${query.id}/list`, {
    method: 'GET',
  });
}

/**
 * 模型数据创建
 * */
export async function createLogicModelsService({ query = {}, body = {} }: any = {}): Promise<
  model.relation.ModelRelation
> {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-relations/${query.id}`, {
    method: 'POST',
    body: { ...body, tenantId: '0' },
  });
}

/**
 * 查询模型关系详情
 * */
export async function queryRelationService({ query = {} }: any = {}): Promise<
  model.relation.ModelRelation
> {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-relations/${query.relId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 模型关系保存
 * */
export async function editLogicModelsService({ query = {}, body = {} }: any = {}): Promise<
  model.relation.ModelRelation
> {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-relations/${query.id}/${query.relId}`,
    {
      method: 'PUT',
      body: { ...body, tenantId: '0' },
    }
  );
}

/**
 * 同步模型
 * */
export async function refreshModelService({ query = {} }: any = {}): Promise<
  model.SyncModelResultVO
> {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/${query.id}/sync-model`,
    {
      method: 'PUT',
    }
  );
}

/**
 * 同步模型-警告模式提交
 * */
export async function refreshWarningSubmitService({ body = {} }: any = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/sync-fields`, {
    method: 'PUT',
    body,
  });
}

/**
 * 模型字段-添加字段
 * */
export async function fieldBatchUpdateService({ query = {}, body = {} }: any = {}): Promise<
  model.ModelField
> {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-fields/${query.postid}/batch-update`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 模型字段-扩展表保存
 * */
export async function createRedTableService({ body = {}, id }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/${id}/design-redundant-table`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 模型字段-扩展表查询
 * */
export async function fetchRedAllInfo(id: any): Promise<model.baseStructure.RedundantTableVO> {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/${id}/redundant-table-info`,
    {
      method: 'GET',
    }
  );
}

/**
 * 模型字段-扩展引用表查询
 * */
export async function fetchQuoteRedTable() {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/page?tableTypeList=REDUNDANT`,
    {
      method: 'GET',
    }
  );
}

/**
 * 模型字段-基础表名称唯一性校验
 * */
export async function tablesCheck(body = {}) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/check`, {
    method: 'POST',
    body,
  });
}

/**
 * 模型字段-基础表字段名唯一性校验
 * */
export async function checkRedundantFieldName({ fieldName, modelId }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/logic-models/${modelId}/check-redundant-field?fieldName=${fieldName}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 分页-标签基本信息表列表
 * @param query labelName
 */
export async function checkLabelNameExist(query) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/labels/check`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询分配目标分配到的标签信息列表
 */
export async function queryCheckedLabelAssigns(query, body) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/label-assigns/label-list`, {
    method: 'POST',
    query,
    body,
  });
}
/**
 * 批量创建标签分配表
 */
export async function batchCreateLabelAssigns(body: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/label-assigns`, {
    method: 'POST',
    body,
  });
}

/**
 * api模型可选服务列表
 *  出参->string[]
 * */
export async function servicesListService() {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/logic-models/assigned-api-service`,
    {
      method: 'GET',
    }
  );
}

/**
 * 批量保存模型授权租户
 */
export async function saveModelBatchAuthorization(body: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-assigns`, {
    method: 'POST',
    body,
  });
}
