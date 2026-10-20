/**
 * prepareApplicationService.js - 供应商生命周期预留申请单 service
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 根据租户 ID 及申请 ID 查询预留升级申请单头表明细
 * @param {Object} params - 查询参数
 */
export async function queryPrepareDetail(params) {
  const { requisitionId, customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare/${requisitionId}`, {
    method: 'GET',
    query: { ...others, customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 删除供应商生命周期预留申请
 * @param {Object} params - 删除请求参数
 */
export async function deletePrepare(params) {
  const { requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare/${requisitionId}`, {
    method: 'DELETE',
  });
}

/**
 * 保存供应商生命周期预留申请
 * @param {Object} params - 添加请求参数
 */
export async function savePrepare(params) {
  const { pubEdit, customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare`, {
    method: 'POST',
    body,
    query: { pubEdit, customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 提交供应商生命周期预留申请
 * @param {Object} params - 提交请求参数
 */
export async function submitPrepare(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare/submit`, {
    method: 'POST',
    body,
    query: { customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 删除预留申请附件
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function deleteEnclosureData(params) {
  const { attachmentLineIdList, requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare-attachment-line/${requisitionId}`,
    {
      method: 'DELETE',
      body: [...attachmentLineIdList],
    }
  );
}

/**
 *删除文件服务器中的文件
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function onDraggerUploadRemove(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/**
 * 发起评审
 */
export async function scorePrepare(params) {
  const { customizeUnitCode, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare/${params.requisitionId}/score`,
    {
      method: 'POST',
      body,
      query: { customizeUnitCode: customizeUnitCode.join(',') },
    }
  );
}

/**
 * 发起评审
 */
export async function obsoletedPrepare(params) {
  const { requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare/${requisitionId}/obsoleted`, {
    method: 'POST',
  });
}

// 删除供货能力清单
export async function deleteAbilityData(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/prepare-supply-recs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 打印
 * @async
 * @function print
 */
export async function handlePrint(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/prepare/${params.requisitionId}/print`,
    {
      method: 'GET',
      query: params,
      responseType: 'blob',
    }
  );
}
