/**
 * model - 送样采购员反馈
 * @date: 2020-5-14
 * @author: ygg <gege.yao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function handleSaveBackInfo(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/updateSendReq`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 列表批量提交反馈
 */
export async function handleSubmitCallback(data) {
  const { dataList, customizeUnitCode } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/batchFeedback`, {
    body: dataList,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 详情单独提交反馈
 */
export async function handleSingleSubmit(data) {
  const { customizeUnitCode, ...others } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/batchFeedback`, {
    body: [others],
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 整单删除
 */
export async function queryDelete(payload) {
  const { customizeUnitCode, data } = payload;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/batchRemove`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: [data],
  });
}

/**
 * 列表批量提交反馈
 */
export async function handleBackCallback(data) {
  const { reqIds, remark, customizeUnitCode } = data;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/pageSampleSendReq/feedback-back`,
    {
      body: reqIds,
      method: 'POST',
      query: { remark, customizeUnitCode },
    }
  );
}
