import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SMALL_ORDER, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 批量查询值集
export async function fetchBatchCodes(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/batch`, {
    method: 'GET',
    query: params,
  });
}

// 公司查询接口
export async function fetchCompany() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/supplier`, {
    method: 'GET',
    query: { tenantId: organizationId },
  });
}

// 订单行查询api
export async function fetchOrderLine(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys`, {
    method: 'GET',
    query: param,
  });
}

// 订单行拓展信息
export async function fetchExtensionLine(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/detail`, {
    method: 'GET',
    query: params,
  });
}

// 订单行预占信息拓展
export async function fetchPreemptInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/preempt`, {
    method: 'GET',
    query: params,
  });
}

// 订单行配送信息拓展
export async function fetchConsignInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/consignment`, {
    method: 'GET',
    query: params,
  });
}

// 订单行接收信息拓展
export async function fetchReceiptInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/receipt`, {
    method: 'GET',
    query: params,
  });
}

// 订单行对账信息拓展
export async function fetchStatementsInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/statements`, {
    method: 'GET',
    query: params,
  });
}

// 订单行审批信息拓展
export async function fetchApproveInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/approve`, {
    method: 'GET',
    query: params,
  });
}

// 订单售后信息拓展
export async function fetchAfterSaleInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/aftersale`, {
    method: 'GET',
    query: params,
  });
}

// 订单取消信息拓展
export async function fetchCancelInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/cancel`, {
    method: 'GET',
    query: params,
  });
}

// 订单头拓展信息
export async function fetchExtensionHeader(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/detail`, {
    method: 'GET',
    query: params,
  });
}

// 订单头拓展A-B信息
export async function fetchWFPExtensionHeader(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/inner-detail`, {
    method: 'GET',
    query: params,
  });
}
// 订单其他拓展信息
// export async function fetchExtensionInfo(params) {
//   return request(`${SMALL_ORDER}/v1/${organizationId}/order-entry-statuss`, {
//     method: 'GET',
//     query: params,
//   });
// }

export async function handleToCheck(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/ec_reconFirm`, {
    method: 'POST',
    body: params,
  });
}


export async function handleToAgainCheck(params, paramType) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/consignment-entrys/resend-${paramType}
  `, {
    method: 'POST',
    body: [params.consignmentCode],
  });
}

export async function fetchSaleRetry(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/retry`, {
    method: 'POST',
    body: params,
  });
}

export async function handleToReceiveCheck(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/receipt-entrys/resend-receipt
  `, {
    method: 'POST',
    body: [params.receiptCode],
  });
}

export async function fetchApproveRecord(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/order-approve-history`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchAfsApproveRecord(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/after-sale-internal-approve-history`, {
    method: 'POST',
    body: params,
  });
}

// 发起扣款
export async function initiatePay(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/order-payment`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDocPermissionApi() {
  return request(`/spfm/v1/${organizationId}/cnf-actions/SITE.SPFM.RELATION_DOC_CONTROL/invoke_with_parameter`, {
    method: 'GET',
    query: {
      businessModule: "MALL_BACK",
    },
  });
}

export async function fetchReceiptApproveRecord(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/receipt-entrys/receipt-approve-history`, {
    method: 'POST',
    body: params,
  });
}