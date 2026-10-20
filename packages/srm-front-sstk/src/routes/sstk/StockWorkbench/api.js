import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_STCK = '/stck';

// 库存策略保存
export function fetchSaveOrder(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/in-out-order-headers`, {
    method: 'POST',
    body: params,
  });
}

// 库存策略提交
export function fetchSubmitOrder(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/in-out-order-headers/submit`, {
    method: 'POST',
    body: params,
  });
}

// 库存策略删除
export function fetchDeleteOrder(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/in-out-order-headers`, {
    method: 'DELETE',
    body: params,
  });
}

// 确认出库
export function fetchDeliveryOrder(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/in-out-order-headers/confirm-delivery`, {
    method: 'POST',
    body: params,
  });
}

// 确认入库
export function fetchStorageOrder(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/in-out-order-headers/confirm-storage`, {
    method: 'POST',
    body: params,
  });
}

// 调拨完成
export function fetchTransferOver(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/in-out-order-headers/confirm-transfer`, {
    method: 'POST',
    body: params,
  });
}

// 当前库存数量
export function fetchCurrentStock(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stocks/batch-get-stock`, {
    method: 'POST',
    body: params,
  });
}

// 查询单据业务类型
export function fetchOrderTypes() {
  return request(`/hpfm/v1/${organizationId}/lovs/batch/data`, {
    method: 'POST',
    body: {
      'STCK.IN_OUT_ORDER.ORDER_TYPE': {},
    },
  });
}
// 打印
export async function fetchPrint(inOutHeaderId) {
  return request(`${SRM_STCK}/v1/${organizationId}/in-out-order-headers/print-order`, {
    method: 'POST',
    body: [inOutHeaderId],
    responseType: 'blob',
  });
}

// 判断是否有撤销按钮
export async function fetchOperationFlagService(params) {
  return request(`/hwfp/v1/${organizationId}/runtime/prc/operation-flag?revokeFlag=1`, {
    method: 'POST',
    body: params,
  });
}

// 撤销工作流审批
export function revokeApproveService(params) {
  return request(`/hwfp/v1/${organizationId}/runtime/prc/revoke-by-key/${params}`, {
    method: 'GET',
    responseType: 'text',
  });
}
