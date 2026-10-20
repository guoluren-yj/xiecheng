/*
 * @Description:
 * @Date: 2022-04-14 16:31:30
 * @Author: yitian.mao@going-link.com
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询操作记录
 * @async
 */
export async function fetchOperationRecords(params) {
  const { pcHeaderId, ...rest } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/workbench/page`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

/**
 * 查询审批记录
 * @async
 */
export async function fetchApprovalRecords({ pcHeaderId } = {}) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-approval-records/workbench`, {
    method: 'GET',
    query: { pcHeaderId, commentStartFlag: true, commentRecordFlag: true },
  });
}

// 导出操作记录
export async function exportOperationRecord(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/history-record/operated-action/export`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}
