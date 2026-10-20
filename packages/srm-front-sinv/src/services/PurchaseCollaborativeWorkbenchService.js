// /v1/{organizationId}/stockout/inv/header/create-inv 库存新建 post
// /v1/{organizationId}/stockout/inv/header                   库存头上保存 put
// /v1/{organizationId}/stockout/inv/header	      库存删除 delete
// /v1/{organizationId}/stockout/inv/header/line            库存行删除 delete
// /v1/{organizationId}/stockout/inv/header/submit       库存提交 post
// /v1/{organizationId}/stockout/inv/header/query         库存查询 get

// 明细/v1/{organizationId}/stockout/inv/header/{invHeaderId}
// 明细/v1/{organizationId}/stockout/inv/header/line/{invHeaderId}

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 明细保存
export async function handleSaveDetailAll(data) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header?activeKey=${data.activeKey}`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

// 明细保存
export async function handleSaveDetail(data) {
  const { query, body } = data;
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/inv/header`, {
    method: 'PUT',
    body,
    query,
  });
}

export async function handleSaveInventory(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/create-inv`, {
    method: 'POST',
    body: data,
  });
}

export async function handleCreateInventory(data) {
  const { sureSupplier, activeKey } = data;
  const url = sureSupplier
    ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/create-inv`
    : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/create-inv`;
  return request(`${url}`, {
    method: 'POST',
    body: data,
    query: { activeKey },
  });
}

export async function submitInventoryListAll(data) {
  const { activeKey, params = [] } = data;
  const url =
    params.length && params[0].sureSupplier
      ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/submit`
      : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/submit`;
  return request(`${url}`, {
    method: 'POST',
    body: params,
    query: { activeKey },
  });
}

export async function submitInventoryList(data) {
  const { query, body, sureSupplier } = data;
  const url = sureSupplier
    ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/submit`
    : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/submit`;
  return request(`${url}`, {
    method: 'POST',
    body: [body],
    query,
  });
}

// 外协库存表配置头删除
export async function delInventoryLine(data) {
  const { activeKey, param } = data;
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/inv/header?activeKey=${activeKey}`, {
    method: 'DELETE',
    body: param,
  });
}

// 明细行删除
export async function delLineInventory(data) {
  const { activeKey, params } = data;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/line?activeKey=${activeKey}`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

// 删除
export async function delInventory(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/inv/header`, {
    method: 'DELETE',
    body: data,
  });
}

// 确认 拒绝 列表页的
export async function approveInventoryListAll(data) {
  const { activeKey, params = [] } = data;
  const url =
    params.length && params[0].sureSupplier
      ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/approve?activeKey=${activeKey}`
      : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/approve?activeKey=${activeKey}`;
  return request(`${url}`, {
    method: 'POST',
    body: params,
  });
}

// 确认 拒绝 明细页的
export async function approveInventoryList(data) {
  const { query, body, sureSupplier } = data;
  const url = sureSupplier
    ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/approve`
    : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/approve`;
  return request(`${url}`, {
    method: 'POST',
    body: [body],
    query,
  });
}

// 数量
export async function queryInventoryLineTotal(sureSupplier) {
  const url = sureSupplier
    ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/tab-line/quantity`
    : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/tab-line/quantity`;
  return request(`${url}`, {
    method: 'GET',
  });
}

// 按单数量
export async function queryInventoryTotal(sureSupplier) {
  const url = sureSupplier
    ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/tab/quantity`
    : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/tab/quantity`;
  return request(`${url}`, {
    method: 'GET',
  });
}

// 打印
export async function handlePrintInventory(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/export/batch-print-token`, {
    method: 'POST',
    responseType: 'blob',
    body: data,
  });
}

// 重新同步
export async function handleRetryInventory(data) {
  const { activeKey, param } = data;
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/retry`, {
    method: 'POST',
    body: param,
    query: { activeKey },
  });
}

// 更新发料消耗
export async function handleUpdateInventory(data) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/stockout/inv/line/detail/generate?activeKey=${data[0]?.activeKey}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 获取库存现有量
export async function handleGetInventory(data) {
  const { param, activeKey } = data;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/theoryQuantity?activeKey=${activeKey}`,
    {
      method: 'POST',
      body: param,
    }
  );
}

/**
 * 获取页面个性化模版详情
 */
export async function getCuszTemplate(body) {
  return request(`${SRM_SPUC}/v1/customize/template-cusz`, {
    method: 'POST',
    body,
  });
}

// 明细取消
export async function cancelInventoryList(data) {
  const { query, body, sureSupplier } = data;
  const url = sureSupplier
    ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/cancel`
    : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/cancel`;
  return request(`${url}`, {
    method: 'POST',
    body: [body],
    query,
  });
}

// 列表取消
export async function cancelInventoryListAll(data) {
  const { params = [], activeKey } = data;
  const url =
    params.length && params[0].sureSupplier
      ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/cancel?activeKey=${activeKey}`
      : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/cancel?activeKey=${activeKey}`;
  return request(`${url}`, {
    method: 'POST',
    body: params,
  });
}
