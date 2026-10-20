/**
 * service - 寻源结果查询
 * @date: 2019-2-18
 * @version: 0.0.1
 * @author: HZL <zili.hou@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 询报价查询
 * @async
 * @function fetchRfqDataList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchEntranceList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source/result/list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 询价结果-明细页面头
 * @async
 * @function fetchResultsHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchResultsHeaderDetail(params) {
  return request(`${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}`, {
    method: 'GET',
  });
}
/**
 * 询价结果全部报价明细-数据查询
 * @async
 * @function fetchQuoteLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQuoteLine(params) {
  const { organizationId, sourceHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source/result/${sourceHeaderId}/details`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 寻源结果-导入
 * @async
 * @function sourceImportErp
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function sourceImportErp(params) {
  const { organizationId, systemType, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source/result/sync`, {
    method: 'POST',
    query: { systemType },
    body: otherParams.newParams,
  });
}

/**
 * 寻源结果-导入
 * @async
 * @function sourceImportErp
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function sourceImportToErp(params) {
  const { organizationId, systemType, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source/result/import/${systemType}`, {
    method: 'POST',
    body: otherParams.newParams,
  });
}
/**
 * 询价结果-修改保存
 * @async
 * @function saveData
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveData(params) {
  const { rfxLineItemId, organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source/result/update`, {
    method: 'POST',
    body: otherParams.newParams,
  });
}
/**
 * 寻源结果-导入
 * @async
 * @function abandonData
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function abandonData(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source/result/abandon`, {
    method: 'POST',
    body: otherParams.resultIdList,
  });
}

/**
 * 获取当前租户对接的系统
 * @param {Object} 当前租户
 */
export async function getSystem(params) {
  const { organizationId } = params;
  return request(`${prefix}/${organizationId}/source/result/system-type`, {
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 获取业务实体
 * @async
 * @param {Object} params - 入参
 */
export async function getBusinessOu(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company-ou`, {
    method: 'GET',
    query: {
      ...otherParams,
    },
  });
}

/**
 * 获取库存组织
 * @async
 * @param {Object} params - 入参
 */
export async function getInventoryOrg(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company-invorg`, {
    method: 'GET',
    query: {
      ...otherParams,
    },
  });
}

/**
 * 创建复制行数据
 * @async
 * @param {Object} params - 复制行列表数据
 */
export async function createSourceResult(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source-result-temps`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 修改复制行数据
 * @async
 * @param {Object} params - 复制行列表数据
 */
export async function updateSourceResult(params) {
  const { organizationId, tempData = [] } = params;
  return request(`${prefix}/${organizationId}/source-result-temps`, {
    method: 'PUT',
    body: [...tempData],
  });
}

/**
 * 查询复制行数据
 * @async
 * @param {Object} params - 查询参数
 */
export async function querySourceResult(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-result-temps`, {
    method: 'GET',
    query: {
      ...param,
    },
  });
}

/**
 * 弹窗内导入ERP复制行数据
 * @async
 * @param {Object} params - 导入数据列表
 */
export async function importErpWithSourceResult(params = []) {
  const { organizationId, systemType } = params;
  return request(`${prefix}/${organizationId}/source-result-temps/import`, {
    method: 'POST',
    body: {
      systemType,
    },
  });
}
