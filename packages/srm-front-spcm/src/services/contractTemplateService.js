/*
 * contractMaintainService - 协议模板service
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询
export async function queryList(params) {
  // 过滤掉空的
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 模板协议编码列表ID刷新
 * @async
 * @function getHeaderAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getHeaderAttachmentUuid(data) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/pc-template/list`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 模板协议编码列表ID刷新
 * @async
 * @function getLineAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getLineAttachmentUuid(data) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/pc-template/list`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 更新采模板协议编码列表
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function update(body) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/batch-create-update`,
    {
      method: 'POST',
      query: {
        customizeUnitCode: 'SPCM.CONTRACT.TEMPLATE.LIST',
      },
      body: body.lines,
    }
  );
}

/**
 * 更新采模板协议编码列表
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
// export async function update(body) {
//   return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/order-type/save`, {
//     method: 'POST',
//     body: body.lines,
//   });
// }

/**
 * 查询子账号权限下的公司列表
 * @param {Object} params - 查询参数
 */
export async function fetchCompany(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/company/page`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 保存协议模板列表下的公司
 * @param {Object} params - 查询参数
 */
export async function saveCompany(params) {
  const { pcTemplateId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/${pcTemplateId}/config-company`,
    {
      method: 'PUT',
      body: params.companyDataSource,
    }
  );
}

/**
 * 查询模板配置
 * @param {*} params
 */
export async function fetchTemplateConfig(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/page-temp-file`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 保存模板配置
 * @param {*} params
 */
export async function saveTemplateConfig(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/batch-create-update-temp-file`,
    {
      method: 'POST',
      body: params,
    }
  );
}
/**
 * 删除模板配置
 * @param {*} params
 */
export async function deleteTemplateConfig(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/batch-delete-temp-file`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

/**
 * 提交协议模板审批
 * @async
 * @function submitTemplate
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function submitTemplate({ lines }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/batch-submit`, {
    method: 'POST',
    body: lines,
  });
}

/**
 * 解锁审批后的协议模板
 * @async
 * @function unlockTemplate
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function unlockTemplate({ lines }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/unlock`, {
    method: 'POST',
    body: lines,
  });
}

/**
 * 历史记录查询
 * @async

 */
export async function versionTemplate({ pcTemplateId, ...restData }) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-template-records?pcTemplateId=${pcTemplateId}&tenantId=${organizationId}`,
    {
      method: 'GET',
      query: restData,
    }
  );
}

// 获取清稿文件
export async function clearRevisions(body) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/clear-revisions`,
    {
      method: 'POST',
      body,
    }
  );
}

// 退回至新建
export async function backToNew(body) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-template/back`,
    {
      method: 'POST',
      body,
    }
  );
}
