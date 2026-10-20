/**
 * model - 送样采购员发布
 * @date: 2020-5-14
 * @author: ygg <gege.yao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM, SRM_SSRC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 外层批量发布
 */
export async function handlePublish({ selectedData, customizeUnitCode }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/release/batchSubmit`, {
    body: selectedData,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 详情内发布
 */
export async function handleFormPublish(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/release/submit`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 附件删除
 */
export async function batchAttachRemove(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-attachments/batchRemove`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 详情表单第一次新建的保存
 */
export async function handleCreate(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/createReq`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 详情表单保存
 */
export async function handleFormSave(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/updateSendReq`, {
    body,
    method: 'POST',
    query: { customizeUnitCode },
  });
}

/**
 * 样品信息批量删除
 */
export async function handleDlete(data) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-infos/batchRemove`, {
    body: data,
    method: 'POST',
  });
}

/**
 * 查询当前用户默认信息
 */
export async function queryUserDefaultMsg() {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/get-user-default`, {
    method: 'GET',
  });
}

/**
 * 工作台新建时查询供应商信息
 */
export async function querySupplierInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/line-company-info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 列表复制
 */
export async function handleCopyReq({ reqId, customizeUnitCode }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/cloneReq/${reqId}`, {
    method: 'POST',
    query: { customizeUnitCode },
  });
}

// 复制时检查行来源是否包含引用寻源
export async function checkLineSource({ reqId, ...query }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/is_source_result_create/${reqId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 引用寻源结果
export async function quoteSourceResult(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/create_sample_by_sourceresult`,
    {
      method: 'POST',
      body: params,
      query: { customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_PUBLISH.SOURCE_RESULT_LIST' },
    }
  );
}

// 引用寻源结果-暂挂/取消暂挂
export async function sourcePending(params) {
  const { selectRows = [], isPending } = params;
  const url = isPending
    ? '/source/result/external-manage/pending/no-saga'
    : '/source/result/external-manage/cancel-pending/no-saga';
  return request(`${SRM_SSRC}/v1/${organizationId}${url}`, {
    method: 'POST',
    body: selectRows.map(n => ({ ...n, executeType: 'SUP' })),
  });
}
