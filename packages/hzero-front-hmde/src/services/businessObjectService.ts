// 维护业务对象接口
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { HZERO_HMDE, HZERO_HPFM, HZERO_HLOD, HZERO_HADM } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

/**
 * 批量查询独立值集值
 * {HZERO_PLATFORM}/v1/lovs/value/batch
 * @param {Object} params
 * @example queryMapIdpValue({ level: 'HPFM.LEVEL', dir: 'HPFM.DIRECTION' })
 */
export async function queryMapIdpValue(params) {
  return request(`${HZERO_HMDE}/v1/lovs/value/batch`, {
    query: params,
  });
}

/**
 * 页面布局-页面布局名称唯一性校验
 * */
export async function businessObjectPageNameCheck(query) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-pages/unique-available`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 业务对象字段创建接口
 * */
export async function createBusinessObjectField({ body = {}, query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 业务对象字段更新接口
 * */
export async function updateBusinessObjectField({ body = {}, query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields`, {
    method: 'PUT',
    query,
    body,
  });
}

/**
 * 业务对象tab权限标志接口
 * hadm/v1/services?serviceCode=hzero-lowcode&page=0&size=1000
 * */
export async function getOBTabFlag() {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HADM,
    })}/services?serviceCode=hzero-lowcode&page=0&size=1000`,
    {
      method: 'GET',
    }
  );
}

/**
 * 业务对象字段发布接口
 * */
export async function getOBDetailService({ boId = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/${boId}/detail`,
    {
      method: 'GET',
    }
  );
}

/**
 * 业务对象字段发布接口
 * */
export async function publicBusinessObjects({ body = {}, ignoreWarning = false }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects/publish?ignoreWarning=${ignoreWarning}`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 *平台业务对象字段启用禁用
 * */
export async function updateSitBusinessObjectField({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-fields/enable`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 *租户业务对象字段启用禁用
 * */
export async function updateTenantBusinessObjectField({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-inherit-field/enable`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 业务对象字段通过对象编码查询字段列表
 */
export async function getBusinessObjectFieldListByCode(code) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-fields/list-by-code`,
    {
      method: 'GET',
      query: {
        businessObjectCodeList: [code],
      },
    }
  );
}

/**
 * 业务对象字段详情接口
 * */
export async function getBusinessObjectField({ query, businessObjectFieldId }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-fields/${businessObjectFieldId}/detail`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 业务对象字段钻取接口
 * */
export async function drill({ query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/drill`, {
    method: 'GET',
    query,
  });
}

/**
 * 业务对象字段钻取接口
 * */
export async function getDrillInfo(body: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/reference-info`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 业务对象组合对象左侧对象详情关系树
 * */
export async function getCombinationBOList({ businessObjectId, query }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-relations/${businessObjectId}/tree`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 业务对象组合对象右侧字段树
 * */
// export async function getRightFieldInfo({ _businessObjectId }) {
//   return request(
//     `${lowcodeOrganizationURL({
//       route: HZERO_HMDE,
//     })}/business-object-relations/${_businessObjectId}/list`,
//     {
//       method: 'GET',
//     }
//   );
// }

/**
 * 业务对象组合对象创建字段弹窗保存
 * */
export async function updateRelationObject({ body }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-relations`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 业务对象组合对象创建字段弹窗查询
 * */
export async function getCreateFieldInfo({ _businessObjectId, query, body }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects/combine/${_businessObjectId}/tree`,
    {
      method: 'POST',
      query,
      body,
    }
  );
}

/**
 * 新建导出模板
 * */
export async function createTemplate({ body = {}, query }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects-export-templates/save`,
    {
      method: 'POST',
      query,
      body,
    }
  );
}

/**
 * 删除导出模板
 * */
export async function deleteTemplate({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects-export-templates`,
    {
      method: 'DELETE',
      body,
    }
  );
}

export async function queryExportTemplateDetail(businessObjectExportTemplateId) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects-export-templates/${businessObjectExportTemplateId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询业务对象字段
 * */
export async function getBoFieldList({ query = {} }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/list`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询导出模板字段列表
 * */
export async function getFieldList({ query = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects-export-template-columns/list`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 保存导出模板字段列表
 * */
export async function saveFieldList({ body = {}, query }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects-export-template-columns/batch`,
    {
      method: 'POST',
      query,
      body,
    }
  );
}

/**
 * 新建导入模板
 * */
export async function createImportTemplate({ body = {}, query = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-import-templates`,
    {
      method: 'POST',
      body,
      query,
    }
  );
}

/**
 * 编辑导入模板
 * */
export async function editorImportTemplate({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-import-templates`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 根据id删除导入模板
 * */
export async function deleteImportTemplate(id) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-import-templates/${id}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 查询导入模板sheet页
 * */
export async function getImportTemplateSheet(id) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-import-template-sheets/${id}/list`,
    {
      method: 'GET',
    }
  );
}

/**
 * 保存导入模板sheet页配置
 * */
export async function saveImportTemplateSheet({ body = {} }) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-import-template-sheets/batch`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 删除导入模板sheet页
 * */
export async function deleteImportTemplateSheet(id) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-import-template-sheets/${id}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 查询业务对象字段列表，过滤了一些字段
 * */
export async function getImportObjectCol({ query = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-import-templates/business-object-field/list`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 查询导入模板字段列表
 * */
export async function getImportFieldCol({ id, query }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-import-template-columns/${id}/page`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 保存导入模板sheet页数据
 * */
export async function saveSheetPage({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-import-template-sheets`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 批量删除导入模板字段
 * */
export async function deleteTemplateCol({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-import-template-columns`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 平台层业务对象创建扩展字段接口
 * */
export async function createPlateformExtensionBusinessObjectField({ body = {}, query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-extend-field`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 平台层业务对象更新扩展字段接口 (暂时平台扩展字段不可编辑)
 * */
export async function updatePlateformExtensionBusinessObjectField({ body = {}, query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-extend-field`, {
    method: 'PUT',
    query,
    body,
  });
}

/**
 * 平台业务对象扩展字段详情接口
 * */
export async function getPlateformExtensionBusinessObjectField({
  query,
  businessObjectFieldId,
}: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-extend-field/${businessObjectFieldId}/detail`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 租户层业务对象创建扩展字段接口
 * */
export async function createTenantExtensionBusinessObjectField({ body = {}, query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-inherit-field`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 租户业务对象查询扩展字段详情接口
 * */
export async function getTenantBusinessObjectFieldDetail({ query }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-inherit-field/detail`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 模板导出接口
 * */
export async function exportTemplate(id) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-import-templates/download/${id}`,
    {
      method: 'PUT',
      responseType: 'blob',
    }
  );
}

/**
 * 根据id删除业务对象组合
 * */
export async function deleteBoComposition(id) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects/${id}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 创建业务对象组合
 * */
export async function createBoComposition({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects/combine`,
    {
      method: 'POST',
      body,
    }
  );
}

/*
 * 平台业务对象字段更新保存接口
 * */
export async function updateExtensionBusinessObjectField({ body = {}, query }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-extend-field`, {
    method: 'PUT',
    query,
    body,
  });
}

/**
 * 更新业务对象组合
 * */
export async function updateBoComposition({ body = {} }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects/combine`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 多语言请求
 * */
export async function queryIntlDataService() {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HPFM,
    })}/lovs/data?lovCode=HPFM.LANGUAGE`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询业务对象详情
 * */
export async function getCompositionDetail(id) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects/combine/${id}/detail`,
    {
      method: 'GET',
    }
  );
}

/**
 * 禁用业务对象值列表
 * */
export async function disableOption(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-options/disable`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 启用业务对象值列表
 * */
export async function enableOption(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-options/enable`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 复制业务对象值列表
 * */
export async function copyOption(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-options/copy`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 禁用字段依赖
 * */
export async function disableFieldRely(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-field-dependence/disable`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 启用字段依赖
 * */
export async function enableFieldRely(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-field-dependence/enable`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * * 禁用业务规则
 * */
export async function disableBusinessObjectRule(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-validate-rules/${body.validateRuleId}/disable`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * * 启用业务规则
 * */
export async function enableBusinessObjectRule(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-validate-rules/${body.validateRuleId}/enable`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 禁用事件流
 * */
export async function disableEventFlow(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-event-flow/disable`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 启用事件流
 * */
export async function enableEventFlow(body) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-event-flow/enable`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 查询字段依赖受控字段值列表
 * */
export async function getFieldRelyValueMap(lovCode, query) {
  return lovCode
    ? request(
        `${lowcodeOrganizationURL({
          route: HZERO_HPFM,
        })}/lovs/value`,
        {
          method: 'GET',
          query: {
            lovCode,
          },
        }
      )
    : request(
        `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-field-dependence/custom-option-list`,
        {
          method: 'GET',
          query,
        }
      );
}

/**
 * 查询业务对象导出模板列树
 * */
export async function getBusinessObjectTree({ query }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-objects-export-template-columns/tree`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 查询业务对象导入模板列树
 * */
export async function getBusinessObjectImportTree({ query }: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-import-templates/business-object-field/tree`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 业务对象字段发布接口
 * */
export async function enableBOPage({ body = {} }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-pages/enable`, {
    method: 'PUT',
    body,
  });
}

/**
 * 业务对象字段发布接口
 * */
export async function disableBOPage({ body = {} }: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-pages/disable`, {
    method: 'PUT',
    body,
  });
}

/**
 * 从领域入口进入添加模板标准字段和扩展字段
 * */
export async function createDomainTemplateField({ body = {}, query }) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/domain-template-fields`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 领域生成 HZERO 数据源
 * */
export async function generateHZERODataSource({ body = {} }) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/domains/datasource/create`, {
    method: 'POST',
    body,
  });
}

/**
 * 同步物理模型
 */
export async function syncModel(body: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/sync`, {
    method: 'PUT',
    body,
  });
}

/**
 * 修复关联表
 */
export async function fixPhysical(body: any) {
  return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/physical`, {
    method: 'PUT',
    body,
  });
}

/**
 * 重置规则-标准
 */
export async function resetCodeRuleService(id) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/${id}/code-rule/reset`,
    {
      method: 'PUT',
    }
  );
}

/**
 * 重置规则-租户角色扩展字段
 */
export async function tenantExtendResetCodeRuleService(id) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-inherit-field/${id}/code-rule/reset`,
    {
      method: 'PUT',
    }
  );
}

/**
 * 页面布局发布
 */
export async function pageLayoutPublish(query: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HLOD,
    })}/business-object-pages/batch-publish`,
    {
      method: 'POST',
      query,
    }
  );
}

/**
 * 页面布局发布 - 发布路由列表查询
 */
export async function pageLayoutPublishRouterList(query: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HLOD,
    })}/business-object-pages/published-page-routes`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 页面布局发布 - 发布路由列表查询
 */
// export async function queryAdvanceDetail(businessObjectAssociateId) {
//   return request(
//     `${lowcodeOrganizationURL({
//       route: HZERO_HMDE,
//     })}/business-object-associates/${businessObjectAssociateId}`,
//     {
//       method: 'GET',
//     }
//   );
// }

/**
 * 创建高级关系
 */
export async function createAdvanceService(body: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-associates`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 更新高级关系
 */
export async function editAdvanceService(body: any) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-associates`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 删除高级关系
 */
export async function deleteAdvanceService(businessObjectAssociateId: string) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-associates/${businessObjectAssociateId}`,
    {
      method: 'DELETE',
    }
  );
}

export async function getNewDrillInfo(body: any) {
  return request(
    `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/cascade/analyze`,
    {
      method: 'POST',
      body,
    }
  );
}

export async function exportModalDataToJson(param) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-data-migration/export`,
    {
      method: 'POST',
      body: param,
      responseType: 'text',
    }
  );
}


export async function exportModalDataToExcel() {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-data-migration/export-excel`,
    {
      method: 'GET',
      responseType: 'text',
    }
  );
}

export async function importModalDataJson(params) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-data-migration/import`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function queryModalDataImportHistory() {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-data-migration/import-history`,
    {
      method: 'GET',
    }
  );
}

export async function queryTemplateTree() {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-data-migration/template-export-tree`,
    {
      method: 'GET',
    }
  );
}

export async function exportTemplateDataToJson(params) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/model-data-migration/export-template`,
    {
      method: 'POST',
      body: params,
      responseType: 'text',
    }
  );
}

export async function queryAdvanceDetail(businessObjectAssociateId) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-associates/${businessObjectAssociateId}`,
    {
      method: 'GET',
    }
  );
}

export async function copyImportTemplate({ body }) {
  return request(
    `${lowcodeOrganizationURL({
      route: HZERO_HMDE,
    })}/business-object-import-templates/copy`,
    {
      method: 'POST',
      body,
    }
  );
}
