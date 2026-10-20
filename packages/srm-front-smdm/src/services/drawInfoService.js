/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-11-02 21:15:49
 * @LastEditors: yanglin
 * @LastEditTime: 2022-11-17 15:20:30
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 *查询物料记录
 * @async
 * @function queryReqApprove
 * @param {obj} params.itemReqHeaderId
 * @returns fetch Promise
 */
export async function queryDrawInfo(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/drawings/list`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

// 外部附件下载
export async function rederctUrl(params) {
  return request(`/sitf/v1/${organizationId}/ext-file-download`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}
