/**
 * qualifiedApplicationService.js - 供应商生命周期合格申请单 service
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商供货能力清单
 * @param {Object} params - 查询参数
 */
export async function querySupplierAbility(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail`, {
    method: 'GET',
    query: {
      ...others,
      page: 0,
      size: 0,
      isAllSupplyAbilitys: 0, // 区分生命周期申请单和供货能力清单明细查询标识
      customizeUnitCode: customizeUnitCode.join(','),
    },
  });
}

/**
 * 根据租户 ID 及申请 ID 查询合格升级申请单头表明细
 * @param {Object} params - 查询参数
 */
export async function queryQualifiedDetail(params) {
  const { requisitionId, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/${requisitionId}`, {
    method: 'GET',
    query: { customizeUnitCode: customizeUnitCode.join(',') },
  });
}

/**
 * 删除供应商生命周期合格申请
 * @param {Object} params - 删除请求参数
 */
export async function deleteQualified(params) {
  const { requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/${requisitionId}`, {
    method: 'DELETE',
  });
}

/**
 *删除表格行数据
 *
 * @export
 * @function deleteData
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 推荐申请单头Id
 * @param {Array} params.itemLineIdList 物料/品类主键
 * @returns
 */
export async function deleteData(params) {
  const { itemLineIdList, requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified-sup-rec/${requisitionId}`, {
    method: 'DELETE',
    body: [...itemLineIdList],
  });
}

/**
 * 保存供应商生命周期合格申请
 * @param {Object} params - 添加请求参数
 */
export async function saveQualified(params) {
  const { pubEdit, customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified`, {
    method: 'POST',
    query: { customizeUnitCode: customizeUnitCode.join(','), pubEdit },
    body,
  });
}

/**
 * 发起供应商生命周期合格申请
 * @param {Object} params - 发起请求参数
 */
export async function scoreQualified(params) {
  const { customizeUnitCode, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/${params.requisitionId}/score`,
    {
      method: 'POST',
      query: { customizeUnitCode: customizeUnitCode.join(',') },
      body,
    }
  );
}

/**
 * 提交供应商生命周期合格申请
 * @param {Object} params - 提交请求参数
 */
export async function submitQualified(params) {
  const { customizeUnitCode, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/${params.requisitionId}/submitFix`,
    {
      method: 'POST',
      query: { customizeUnitCode: customizeUnitCode.join(',') },
      body,
    }
  );
}

/**
 * 删除合格申请附件
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function deleteEnclosureData(params) {
  const { attachmentLineIdList, requisitionId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/${requisitionId}/attachment/batchDelete`,
    {
      method: 'POST',
      body: [...attachmentLineIdList],
    }
  );
}

/**
 * 打印
 * @async
 * @param {!number} asnHeaderId - 送货单发运行id
 * @function print
 */
export async function handleAsnPrint(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/print`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

/**
 * 废弃申请单
 */
export async function obsoletedQualified(params) {
  const { requisitionId, remark } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/life-cycle/qualified/${requisitionId}/obsoleted`,
    {
      method: 'POST',
      body: remark,
    }
  );
}

/**
 * 现场考察报告管理列表查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryManageList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers`, {
    method: 'GET',
    query,
  });
}
