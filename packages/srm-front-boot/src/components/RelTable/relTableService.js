/**
 * 配置表组件service
 * relTableService.js
 * @date: 2020-08-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_ADAPTOR } from '@/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();

/**
 * 对参数处理
 * 如果是租户级，tenant数据不改变
 * 如果是平台级，tenantId 存在，使用原始值，不存在 给平台通用 tenantId=0
 * @param {Object} params 参数
 */
function setTenantId(params = {}) {
  return tenantFlag
    ? params
    : {
        ...params,
        tenantId: params.tenantId !== undefined ? params.tenantId : 0,
      };
}

/**
 * 更新数据
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function updateRelTableData(tableCode, params) {
  const newParams = {
    ...params,
    updateScenario: 'update',
  };
  return request(
    `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-records/${tableCode}`,
    {
      method: 'PUT',
      body: setTenantId(newParams),
    }
  );
}

/**
 * 创建数据
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function createRelTableData(tableCode, params) {
  const newParams = {
    ...params,
    updateScenario: 'new',
  };
  return request(
    `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-records/${tableCode}`,
    {
      method: 'POST',
      body: setTenantId(newParams),
    }
  );
}

/**
 * 删除数据
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function deleteRelTableData(tableCode, params) {
  const newParams = {
    ...params,
    updateScenario: 'delete',
  };
  return request(
    `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-records/${tableCode}`,
    {
      method: 'DELETE',
      body: setTenantId(newParams),
    }
  );
}

/**
 * 根据配置表 code 查询配置表的相关数据
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function queryRelTableConfig(tableCode) {
  return request(
    `${SRM_ADAPTOR}/v1${
      tenantFlag ? `/${organizationId}` : ''
    }/rel-table-definitions/find/${tableCode}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 批量删除接口
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 * @returns
 */
export async function batchDeleteRelTable(tableCode, params) {
  const newParams = params.map((rs) => {
    return { ...rs, updateScenario: 'delete' };
  });
  return request(
    `${SRM_ADAPTOR}/v1${
      tenantFlag ? `/${organizationId}` : ''
    }/rel-table-records/${tableCode}/batch/remove`,
    {
      method: 'DELETE',
      body: newParams,
    }
  );
}

/**
 * 更加动作id获取按钮操作数据
 * @param {Object} params 参数
 */
export async function getActionDetail(params) {
  const { actionId, records } = params;
  return request(
    `${SRM_ADAPTOR}/v1${
      tenantFlag ? `/${organizationId}` : ''
    }/rel-table-actions/execute?actionId=${actionId}`,
    {
      method: 'POST',
      body: records,
    }
  );
}
/*
 * MarmotScript代码自定义提示接口
 * @returns
 */
export async function getComplementaryWordsService() {
  return request(
    `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/adaptor-script/auto-prompt`,
    {
      method: 'GET',
      responseType: 'text',
    }
  );
}

/**
 * 对比数据
 * @param {Object} params 参数
 */
export async function getCompareData(params, tableCode) {
  return request(
    `${SRM_ADAPTOR}/v1${
      tenantFlag ? `/${organizationId}` : ''
    }/rel-table-record-history/${tableCode}/compare`,
    {
      method: 'POST',
      body: params,
    }
  );
}
