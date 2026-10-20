/**
 * 协议控制
 * @date: 2020-09-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 作废
 * @param {*} params
 */
export async function invalidContract(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-control/invalid-approval`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 协议终止是否受下游控制
 * @param {Array} pcHeaderIds 协议ID
 * @returns
 */
export async function terminateContractValid(pcHeaderIds) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/terminationCheck`, {
    method: 'POST',
    body: pcHeaderIds,
  });
}

/**
 * 终止
 * @param {*} params
 */
export async function terminateContract(params) {
  const { pcHeaderStatus, pcHeaderDetailDtos } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-control/change-status`, {
    method: 'PUT',
    query: { pcHeaderStatus },
    body: pcHeaderDetailDtos,
  });
}

/**
 * 变更
 * @param {*} params
 */
export async function changeContract(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-control/alter-approval`, {
    method: 'POST',
    body: filterNullValueObject(body),
  });
}

/**
 * 更新协议
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function updateContract({ customizeUnitCode, ...body }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: filterNullValueObject(body),
  });
}

/**
 * -提交采购协议
 * @async
 * @function submit
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function submitContract({ customizeUnitCode, submitBody }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: submitBody,
  });
}

/**
 * 更新采购申请头
 * @async
 * @function updateHeaderInfo
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function updateHeaderInfo({ customizeUnitCode, ...body }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'POST',
    query: { customizeUnitCode },
    body,
  });
}

/**
 * 查询公司拓展信息
 * @export
 * @param {*} params
 */
export async function fetchExtended(params) {
  const { companyId, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/extended`,
    {
      method: 'GET',
      query: { companyId },
    }
  );
}
