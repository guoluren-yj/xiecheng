import querystring from 'querystring';
import request from 'hzero-front/lib/utils/request';
import { HZERO_HITF, HZERO_PLATFORM, HZERO_MSG } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  parseParameters,
} from 'hzero-front/lib/utils/utils';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';

// const HZERO_HITF = '/hitf-12710';
const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

export async function queryList(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      query: parseParameters(params),
    }
  );
}

export async function edit(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function interfaceServerRelease(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/release`
      : `${HZERO_HITF}/v1/interface-servers/release`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function interfaceServerOffline(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/offline`
      : `${HZERO_HITF}/v1/interface-servers/offline`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function rollbackHistoryInterfaceServer(params = {}) {
  const { interfaceServerId, version } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/${interfaceServerId}/override/${version}`
      : `${HZERO_HITF}/v1/interface-servers/${interfaceServerId}/override/${version}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function create(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function deleteHeader(deleteList = []) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      method: 'DELETE',
      body: deleteList,
    }
  );
}

export async function deleteLines(interfaceIds = []) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces`
      : `${HZERO_HITF}/v1/interfaces`,
    {
      method: 'DELETE',
      body: interfaceIds,
    }
  );
}

export async function queryInterfaceDetail(params) {
  const { interfaceServerId, ...query } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/${interfaceServerId}`
      : `${HZERO_HITF}/v1/interface-servers/${interfaceServerId}`,
    {
      query,
    }
  );
}

export async function importService(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/import`
      : `${HZERO_HITF}/v1/interface-servers/import`,
    {
      query: params,
      method: 'POST',
    }
  );
}

/**
 * 查询接口文档
 * @async
 * @function queryDocument
 * @param {number} interfaceId - 接口ID
 */
export async function queryDocument(interfaceId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/documents`
      : `${HZERO_HITF}/v1/${interfaceId}/documents`
  );
}

/**
 * 查询请求类型的所有参数
 * @async
 * @function queryParams
 * @param {number} documentId 接口文档Id
 */
export async function queryParams(documentId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params`
      : `${HZERO_HITF}/v1/${documentId}/params`
  );
}

/**
 * 新建请求参数
 * @async
 * @function createParams
 * @param {object} params - 请求参数
 */
export async function createParams(params) {
  const { documentId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params`
      : `${HZERO_HITF}/v1/${documentId}/params`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 编辑请求参数
 * @async
 * @function updateParams
 * @param {object} params - 请求参数
 */
export async function updateParams(params) {
  const { documentId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params`
      : `${HZERO_HITF}/v1/${documentId}/params`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 删除请求参数
 * @async
 * @function deleteParams
 * @param {object} params - 请求参数
 */
export async function deleteParams(params) {
  const { documentId, paramId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params/${paramId}`
      : `${HZERO_HITF}/v1/${documentId}/params/${paramId}`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

/**
 * 查询请求示例
 * @async
 * @function queryReqDemo
 * @param {object} params 请求参数
 */
export async function queryReqDemo(params) {
  const { interfaceId, documentId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/documents/${documentId}/request-demo`
      : `${HZERO_HITF}/v1/${interfaceId}/documents/${documentId}/request-demo`
  );
}

/**
 * 查询参数的所有备选值
 * @param {number} paramId - 参数IDgit
 */
export async function queryAlternative(paramId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${paramId}/param-values`
      : `${HZERO_HITF}/v1/${paramId}/param-values`
  );
}

/**
 * 批量新建/编辑接口文档参数备选值
 * @async
 * @function createAlternative
 * @param {object} params - 参数数据
 */
export async function saveAlternative(params) {
  const { paramId, alternativeList } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${paramId}/param-values`
      : `${HZERO_HITF}/v1/${paramId}/param-values`,
    {
      method: 'POST',
      body: alternativeList,
    }
  );
}

/**
 * 删除接口文档参数备选值
 * @async
 * @function deleteAlternatives
 * @param {object} params - 参数数据
 */
export async function deleteAlternative(params) {
  const { paramId, paramValueId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${paramId}/param-values/${paramValueId}`
      : `${HZERO_HITF}/v1/${paramId}/param-values/${paramValueId}`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

/**
 * 编辑接口文档
 * @async
 * @function updateDocument
 * @param {object} params - 接口文档数据
 */
export async function updateDocument(params) {
  const { interfaceId, documentId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/documents/${documentId}`
      : `${HZERO_HITF}/v1/${interfaceId}/documents/${documentId}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 查询测试用例列表
 * @async
 * @function queryTestCase
 * @param {object} params - 分页参数
 */
export async function queryTestCase(params) {
  const { interfaceId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases`,
    {
      query: parseParameters(params),
    }
  );
}

/**
 * 新建测试用例
 * @async
 * @function createTestCase
 * @param {number} interfaceId - 接口ID
 */
export async function createTestCase(interfaceId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases`,
    {
      method: 'POST',
    }
  );
}

/**
 * 查询测试用例详情
 * @async
 * @function queryTestCaseDetail
 * @param {number} params.interfaceId - 接口ID
 * @param {number} params.usecaseId - 测试用例ID
 */
export async function queryTestCaseDetail(params) {
  const { interfaceId, usecaseId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${usecaseId}`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${usecaseId}`
  );
}

/**
 * 删除用例详情的参数
 * @async
 * @function deleteTestCaseParams
 * @param {number} params.interfaceId - 接口ID
 * @param {number} params.usecaseId - 测试用例ID
 * @param {number} params.paramId - 参数ID
 */
export async function deleteTestCaseParams(params) {
  const { interfaceId, usecaseId, paramId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${usecaseId}/${paramId}`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${usecaseId}/${paramId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 更新测试用例参数
 * @async
 * @function updateTestCaseParams
 * @param {object} params - 更新的数据
 */
export async function updateTestCaseParams(params) {
  const { interfaceId, interfaceUsecaseId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${interfaceUsecaseId}`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${interfaceUsecaseId}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 保存测试用例参数
 * @async
 * @function saveTestCaseParams
 * @param {*} params - 更新的数据
 */
export async function saveTestCaseParams(params) {
  const { interfaceId, interfaceUsecaseId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${interfaceUsecaseId}`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${interfaceUsecaseId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 执行测试用例
 * @async
 * @function executeTestCase
 * @param {number} params.interfaceId - 接口ID
 * @param {number} params.usecaseId - 测试用例ID
 */
export async function executeTestCase(params) {
  const { interfaceId, usecaseId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${usecaseId}/invoke`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${usecaseId}/invoke`
  );
}

/**
 * 删除测试用例
 * @async
 * @function deleteTestCase
 * @param {number} interfaceUsecaseId - 测试用例ID
 */
export async function deleteTestCase(interfaceUsecaseId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceUsecaseId}`
      : `${HZERO_HITF}/v1/${interfaceUsecaseId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 查询测试历史
 * @async
 * @function queryTestCaseHistory
 * @param {number} params.interfaceId - 接口ID
 * @param {number} params.usecaseId - 测试用例ID
 */
export async function queryTestCaseHistory(params) {
  const { interfaceId, usecaseId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${usecaseId}/his`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${usecaseId}/his`,
    {
      query: parseParameters(params),
    }
  );
}

/**
 * 查询预览代码
 * @async
 * @function queryViewCode
 * @param {number} params.interfaceId - 接口ID
 * @param {number} params.usecaseId - 测试用例ID
 * @param {number} params.type - 代码语言类型
 */
export async function queryViewCode(params) {
  const { interfaceId, usecaseId, type, requestMethod = 'GET' } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${usecaseId}/code-preview?type=${type}&requestMethod=${requestMethod}`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${usecaseId}/code-preview?type=${type}&requestMethod=${requestMethod}`
  );
}

/**
 * 删除测试历史
 * @async
 * @function deleteTestHistory
 * @param {number} params.interfaceId - 接口ID
 * @param {number} params.interfaceLogId - 测试历史ID
 */
export async function deleteTestHistory(params) {
  const { interfaceId, interfaceLogId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${interfaceId}/usecases/${interfaceLogId}/his`
      : `${HZERO_HITF}/v1/${interfaceId}/usecases/${interfaceLogId}/his`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 查询文档的所有参数信息及参数备选值
 * @param {number} documentId - 文档ID
 */
export async function queryParamsAndAlternative(documentId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params/detail`
      : `${HZERO_HITF}/v1/${documentId}/params/detail`
  );
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}

/**
 * 保存接口
 * @async
 * @function saveInterfaces
 * @param {object} params - 请求参数
 */
export async function saveInterfaces({ interfaceServerId, data }) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceServerId}`
      : `${HZERO_HITF}/v1/interfaces/${interfaceServerId}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 批量创建内部接口
 * @async
 * @function saveBatchInterfaces
 * @param {object} params - 请求参数
 */
export async function saveBatchInterfaces(interfaceServerId, data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceServerId}/batch-save`
      : `${HZERO_HITF}/v1/interfaces/${interfaceServerId}/batch-save`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 接口详情查询
 * @param {number} interfaceId - 参数
 */
export async function queryInterfacesListDetail(interfaceId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}`
  );
}

/**
 * 查询接口文档预览
 * @param {number} params - 查询参数
 */
export async function queryDocumentView(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/document`
      : `${HZERO_HITF}/v1/interfaces/document`,
    {
      query: params,
    }
  );
}

/**
 * 测试服务认证配置
 * @async
 * @function testAuth
 * @param {object} params - 请求参数
 */
export async function testAuth(data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/auth/test`
      : `${HZERO_HITF}/v1/interface-servers/auth/test`,
    {
      method: 'POST',
      body: { ...data },
    }
  );
}

/**
 * 测试OAuth2服务认证配置
 * @async
 * @function testOAuth2
 * @param {object} params - 请求参数
 */
export async function testOAuth2(data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/http-authorizations/test`
      : `${HZERO_HITF}/v1/http-authorizations/test`,
    {
      method: 'POST',
      body: { ...data },
    }
  );
}

/**
 * 查询映射类
 */
export async function queryMappingClass() {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/param-template`
      : `${HZERO_HITF}/v1/interfaces/param-template`
  );
}

/**
 * 测试映射类
 */
export async function testMappingClass(payload) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/param-template`
      : `${HZERO_HITF}/v1/interfaces/param-template`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

/**
 * 接口参数识别
 * @param {object} payload - 请求数据
 */
export async function recognizeParam(params) {
  const queryParam = querystring.stringify(params);
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/recognize-param?${queryParam}`
      : `${HZERO_HITF}/v1/interfaces/recognize-param?${queryParam}`
  );
}

/**
 * 服务参数识别
 * @param {object} payload - 请求数据
 */
export async function recognizeServiceParam(interfaceServerId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/${interfaceServerId}/refresh-param`
      : `${HZERO_HITF}/v1/interface-servers/${interfaceServerId}/refresh-param`
  );
}

/**
 * 运维配置-消息模板账户关联：查询模板行
 * @param {object} params - 请求数据
 */
export async function getTemplateServerDetail({ params }) {
  return request(
    organizationRoleLevel
      ? `${HZERO_MSG}/v1/${organizationId}/template-servers/detail/line`
      : `${HZERO_MSG}/v1/template-servers/detail/line`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询表结构
 * @param params
 * @returns {Promise<void>}
 */
export async function fetchColumn(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/model-configs/desc-table/${params.datasourceId}`
      : `${HZERO_HITF}/v1/model-configs/desc-table/${params.datasourceId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 解析sql获取属性和参数
 */
export async function sqlParser(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/model-configs/parser`
      : `${HZERO_HITF}/v1/model-configs/parser`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 接口发布
 * @param data
 * @returns {Promise<void>}
 */
export async function release({ data }) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/release`
      : `${HZERO_HITF}/v1/interfaces/release`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 接口下线
 * @param params
 * @returns {Promise<void>}
 */
export async function offline(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/offline`
      : `${HZERO_HITF}/v1/interfaces/offline`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function rollbackHistory(params) {
  const { interfaceId, version, tenantId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/override/${version}`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/override/${version}?organizationId=${tenantId}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 删除全部属性列表
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteAllAttr(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/model-fields/${params.modelId}`
      : `${HZERO_HITF}/v1/model-fields/${params.modelId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 删除全部参数列表
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteAllParam(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/model-request-params/${params.modelId}`
      : `${HZERO_HITF}/v1/model-request-params/${params.modelId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 批量创建更新属性列表
 * @param params
 * @returns {Promise<void>}
 */
export async function batchSaveModel(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/model-fields/save-all`
      : `${HZERO_HITF}/v1/model-fields/save-all`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取服务领域数据
 * @returns {Promise<void>}
 */
export async function getServerDomain(tenantId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/server-domains`
      : `${HZERO_HITF}/v1/server-domains`,
    {
      method: 'GET',
      query: { tenantId, page: -1 },
    }
  );
}

/**
 * 获取服务领域详情
 */
export async function getServerDomainDetail(domainId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/server-domains/${domainId}`
      : `${HZERO_HITF}/v1/server-domains/${domainId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 映射转化流程测试
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function mappingFlowTest(params) {
  const { interfaceId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/mapping-flow-test`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/mapping-flow-test`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 导入映射配置
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function packetMappingImport(params) {
  const { file, interfaceId } = params;
  const data = new FormData();
  data.append('file', file, file.name);
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/packet-mapping-import`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/packet-mapping-import`,
    {
      method: 'POST',
      type: 'FORM',
      body: data,
    }
  );
}

/**
 * 导出映射配置
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function packetMappingExport(params) {
  const { interfaceId, level } = params;
  const queryStr = level ? `?level=${level}` : '';
  return downloadFileByAxios({
    requestUrl: organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/packet-mapping-export${queryStr}`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/packet-mapping-export${queryStr}`,
    method: 'POST',
  });
}

/**
 * 导入解析请求报文参数
 * @param {*} params
 */
export async function reqParamParse(params) {
  const { documentId, dataStr } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params/req-param-parse`
      : `${HZERO_HITF}/v1/${documentId}/params/req-param-parse`,
    {
      method: 'POST',
      body: { dataStr },
    }
  );
}

/**
 * 导入解析响应报文参数
 * @param {*} params
 */
export async function resParamParse(params) {
  const { documentId, dataStr } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params/res-param-parse`
      : `${HZERO_HITF}/v1/${documentId}/params/res-param-parse`,
    {
      method: 'POST',
      body: { dataStr },
    }
  );
}

export async function loadWsdl(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/wsdl-url-parser`
      : `${HZERO_HITF}/v1/interface-servers/wsdl-url-parser`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function loadWsdlFile(params) {
  const { formData } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/wsdl-file-parser`
      : `${HZERO_HITF}/v1/interface-servers/wsdl-file-parser`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

/**
 * 测试FTP/SFTP连接
 * @param params
 * @returns {Promise<void>}
 */
export async function testConnect(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/test/connect`
      : `${HZERO_HITF}/v1/interfaces/test/connect`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 批量删除接口文档参数行
 * @param params
 * @returns {Promise<void>}
 */
export async function batchDeleteDocumentParam(params) {
  const { documentId, data } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/${documentId}/params/batch`
      : `${HZERO_HITF}/v1/${documentId}/params/batch`,
    {
      method: 'DELETE',
      body: data,
    }
  );
}

/**
 * 批量删除接口文档参数行
 * @param params
 * @returns {Promise<void>}
 */
export async function batchDeleteTestCaseParam(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/usecases/params`
      : `${HZERO_HITF}/v1/usecases/params`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}
