/*
 * contractMaintainService - 协议审批
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

// -获取列表数据
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/approval/page`, {
    query,
  });
}

/**
 * -批量审批
 * @async
 * @function approveList
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function approveList(data) {
  const { pcHeaderList, approvedRemark } = data;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-approval-agree`, {
    method: 'POST',
    query: { approvedRemark },
    body: pcHeaderList,
  });
}
/**
 * -批量拒绝
 * @async
 * @function passApprovalList
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function rejectApprovalList(data) {
  const { pcHeaderList, approvedRemark } = data;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-approval-reject`, {
    method: 'POST',
    query: { approvedRemark },
    body: pcHeaderList,
  });
}
