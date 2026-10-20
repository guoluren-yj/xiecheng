/**
 * service - 报表平台/数据集
 * @date: 2018-11-19
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_RPT } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_RPT}/v1`;

/**
 * 数据查询
 * @async
 * @function fetchDataSetList
 * @param {object} params - 查询条件
 * @param {!string} params.tenantId - 租户ID
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchDataSetList(params) {
  const param = parseParameters(params);
  return request(
    organizationRoleLevel ? `${prefix}/${organizationId}/datasets` : `${prefix}/datasets`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}
/**
 * 初始化元数据
 * @async
 * @function getMetadata
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function getMetadata(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/datasets/execute-sql`
      : `${prefix}/datasets/execute-sql`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}
/**
 * 初始化参数
 * @async
 * @function getParameters
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function getParameters(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/datasets/extract-param`
      : `${prefix}/datasets/extract-param`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}
/**
 * 预览sql
 * @async
 * @function previewSql
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function previewSql(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/datasets/preview-sql`
      : `${prefix}/datasets/preview-sql`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}
/**
 * 获取xml示例数据
 * @async
 * @function handleGetXmlSample
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function handleGetXmlSample(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/datasets/xml-sample`
      : `${prefix}/datasets/xml-sample`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}
/**
 * 导出xml文件
 * @async
 * @function handleExportXmlFile
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function handleExportXmlFile(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/datasets/xml-sample-file`
      : `${prefix}/datasets/xml-sample-file`,
    {
      method: 'POST',
      query: { ...params },
    }
  );
}
/**
 * 获取数据集明细
 * @async
 * @function fetchDataSetDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */

export async function fetchDataSetDetail(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/datasets/${params.datasetId}`
      : `${prefix}/datasets/${params.datasetId}`,
    {
      method: 'GET',
    }
  );
}
/**
 * 新增数据集
 * @async
 * @function createDataSet
 * @param {object} params - 请求参数
 * @param {!object} params.dto - 待保存对象
 */
export async function createDataSet(params) {
  return request(
    organizationRoleLevel ? `${prefix}/${organizationId}/datasets` : `${prefix}/datasets`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}

/**
 * 更新数据集
 * @async
 * @function updateDataSet
 * @param {object} params - 请求参数
 */
export async function updateDataSet(params) {
  return request(
    organizationRoleLevel ? `${prefix}/${organizationId}/datasets` : `${prefix}/datasets`,
    {
      method: 'PUT',
      body: { ...params },
    }
  );
}
/**
 * 删除数据集
 * @async
 * @function deleteHeader
 * @param {object} params - 请求参数
 */
export async function deleteDataSet(params) {
  return request(
    organizationRoleLevel ? `${prefix}/${organizationId}/datasets` : `${prefix}/datasets`,
    {
      method: 'DELETE',
      body: { ...params },
    }
  );
}

/**
 * 查询数据集关联报表
 * @async
 * @function fetchDataSetList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchAssignList(params) {
  const param = parseParameters(params);
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/reports/${params.datasetId}/assign`
      : `${prefix}/reports/${params.datasetId}/assign`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

// 复制自平台的数据集
export async function createByCopyModal(params) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-datasets/create-by-copy`
      : `${prefix}/print-datasets/create-by-copy`,
    {
      method: 'POST',
      query: { ...params },
    }
  );
}

// 删除数据集
export async function deletePrintDataset(datasetId) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-datasets/${datasetId}`
      : `${prefix}/print-datasets/${datasetId}`,
    {
      method: 'DELETE',
    }
  );
}

// 查询数据集可以添加的字段列表
export async function fetchCanAddFields(params) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-fields/can-be-add-fields`
      : `${prefix}/print-dataset-fields/can-be-add-fields`,
    {
      method: 'GET',
      query: { ...params },
    }
  );
}

// 数据集加字段
export async function addDatasetFields(params) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-fields/add-fields`
      : `${prefix}/print-dataset-fields/add-fields`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}

/**
 * 新增数据集
 */
export async function createPrintDataSet(params) {
  const { tenantId } = params;
  return request(`${prefix}/print-datasets`, {
    method: 'POST',
    body: { ...params },
    query: {
      tenantId,
    },
  }, { encryptBody: true });
}

/**
 * 更新数据集
 */
export async function updatePrintDataSet(params) {
  const { tenantId } = params;
  return request(`${prefix}/print-datasets`, {
    method: 'PUT',
    body: { ...params },
    query: {
      tenantId,
    },
  }, { encryptBody: true });
}

export async function updateDataSetParams(params) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-params`
      : `${prefix}/print-dataset-params`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function updateDataSetNode(params) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-nodes`
      : `${prefix}/print-dataset-nodes`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
export async function updateDataSetObj(params) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-objects`
      : `${prefix}/print-dataset-objects`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function updateDataSetField(params) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-fields`
      : `${prefix}/print-dataset-fields`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

// 查询数据集详情
export async function fetchDataSet(datasetId) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-datasets/${datasetId}`
      : `${prefix}/print-datasets/${datasetId}`,
    {
      method: 'GET',
    }
  );
}

export async function savePrintDatasetMetas({ params, data }) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-metas`
      : `${prefix}/print-dataset-metas`,
    {
      method: 'POST',
      query: params,
      body: data,
    }
  );
}

export async function copyDataSet({ params, data }) {
  return request(`${prefix}/print-datasets/copy`,
    {
      method: 'POST',
      query: params,
      body: data,
    }
  );
}
export async function saveApproveNode({ params, data }) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-nodes/save`
      : `${prefix}/print-dataset-nodes/save`,
    { method: 'POST', query: params, body: data }
  );
}

export async function deleteApproveNode({ params, data }) {
  return request(
    isTenantRoleLevel()
      ? `${prefix}/${getCurrentOrganizationId()}/print-dataset-nodes`
      : `${prefix}/print-dataset-nodes`,
    { method: 'DELETE', query: params, body: data }
  );
}