import request from 'utils/request';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
import { PrefixV2, Prefix } from '@/utils/globalVariable';

const curOrganizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSRC}/v1`;

/**
 * 获取单据样式定制的数据
 * return cuszTplStageCode // 单据样式阶段编码
 * cuszTplPageCode // 单据样式页面编码
 * cuszTplTemplateCode // 单据样式模板编码
 * cuszTplVersion // 单据样式模板版本
 * 通过查询接口使用，返回配置的单据样式定义的字段
 */
export async function getCuszTemplate(body) {
  return request(`${prefix}/customize/template-cusz`, {
    method: 'POST',
    body,
  });
}

/**
 * 获取相同询价单状态下的标段信息
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchSectionInfo(params = {}) {
  return request(`${SRM_SSRC}/v2/${curOrganizationId}/rfx/project/section`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 核价概览头查询
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchHeaderInfo(params = {}) {
  const { rfxHeaderId, organizationId, ...otherParams } = params;
  return request(`${Prefix}/${organizationId}/rfx/${rfxHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 新老UI-配置表查询
 * @param {!string} tableCode - 配置表名称
 * */
export async function queryUiDisplayConfig(params = {}) {
  const { organizationId, tableCode, ...otherParams } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

/**
 * 查询过程附件下载配置表
 */
export async function queryProcessAttachmentConfig() {
  const params = {
    organizationId: curOrganizationId,
    tableCode: 'ssrc_source_file_old_ui_config',
    tenant: getCurrentTenant().tenantNum,
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

/**
 * 核价-导出
 */
export function fetchAttachmentCount(params) {
  return request(`${PrefixV2}/${curOrganizationId}/rfx/check/files/count`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商列表-数据查询-不分页
 * @async
 * @function fetchSupplierLine
 * @param {object} params - 查询条件
 * @param {!string} [params.rfxHeaderId] - 单号
 * @returns {object} fetch Promise
 */
export async function fetchSupplierLine(params) {
  return request(`${prefix}/${curOrganizationId}/rfx/check/approval-form/supplier/list`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 物品列表-数据查询-不分页
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!string} [params.rfxHeaderId] - 单号
 * @returns {object} fetch Promise
 */
export async function fetchItemLine(params) {
  return request(`${prefix}/${curOrganizationId}/rfx/check/approval-form/item/list`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 单一供应商数据查询
 * @async
 * @function fetchSupplierLine
 * @param {object} params - 查询条件
 * @param {!string} [params.rfxHeaderId] - 单号
 * @param {!string} [params.rfxLineSupplierId] - 供应商id
 * @returns {object} fetch Promise
 */
export async function fetchSupplierData(params = {}) {
  const { rfxHeaderId = '', rfxLineSupplierId = '', ...others } = params;
  const bodyData = {
    rfxHeaderId,
    rfxLineSupplierId,
  };
  return request(`${prefix}/${curOrganizationId}/rfx/check/approval-form/supplier/single`, {
    method: 'POST',
    body: bodyData,
    query: others,
  });
}

/**
 * 单一物品数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!string} [params.rfxHeaderId] - 单号
 * @param {!string} [params.rfxLineItemId] - 物料id
 * @returns {object} fetch Promise
 */
export async function fetchItemData(params) {
  const { rfxHeaderId = '', rfxLineItemId = '', ...others } = params;
  const bodyData = {
    rfxHeaderId,
    rfxLineItemId,
  };
  return request(`${prefix}/${curOrganizationId}/rfx/check/approval-form/item/single`, {
    method: 'POST',
    body: bodyData,
    query: others,
  });
}
