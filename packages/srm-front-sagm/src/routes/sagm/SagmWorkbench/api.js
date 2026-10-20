import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SAGM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 保存
export function saveAgreement(params) {
  return request(
    `${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers?customizeUnitCode=SAGM.SALE_WORKBENCH.DETAIL.BASE_INFO.EDIT`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 发布
export function effectAgreement(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/published`, {
    method: 'POST',
    body: params,
  });
}

// // 发布预校验
// export function validatePublish(params) {
//   return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/published-check`, {
//     method: 'POST',
//     body: params,
//   });
// }

// 取消发布
export function expireAgreement(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/cancel`, {
    method: 'POST',
    body: params,
  });
}

// 查询
export function fetchAgreementDetail(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers`, {
    method: 'GET',
    query: params,
  });
}

// 删除
export function deleteAgreement(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询价格策略行
export function fetchSalePriceStrategy(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-price-strategy-lines`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 保存价格策略行
export function saveSalePriceStrategy(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-price-strategy-lines`, {
    method: 'POST',
    body: params,
  });
}

// 查询最大优先级
export function fetchMaxPriority(params) {
  return request(
    `${SRM_SAGM}/v1/${organizationId}/sale-price-strategy-lines/${params.agreementHeaderId}`,
    {
      method: 'GET',
    }
  );
}

// 删除价格策略行
export function deleteSalePriceStrategy(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-price-strategy-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 执行价格策略行
export function executeStrategy(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-price-strategy-lines/execute`, {
    method: 'POST',
    body: params,
  });
}

// 还原价格策略行
export function restoreStrategy(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-price-strategy-lines/restore`, {
    method: 'POST',
    body: params,
  });
}

// 保存权限集
export function savePermissionList(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/authority-lists`, {
    method: 'POST',
    body: params,
  });
}

// 查询权限集
export function fetchPermissionList(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/authority-lists`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 查询业务规则销售协议审批方式
export function fetchSaleAgreeApprove(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/query-approve-type`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

// 加入商品映射
export function joinAssignSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/auth-sku-details`, {
    method: 'POST',
    body: params,
  });
}

// 删除商品映射
export function deleteAssignSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/auth-sku-details`, {
    method: 'DELETE',
    body: params,
  });
}

// 销售协议行状态变更
export function updateSaleLine(params) {
  const { suffix, saleLines } = params;
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-lines/${suffix}`, {
    method: 'POST',
    body: saleLines,
  });
}

// 删除领用销售协议行
export function deleteReceiveSaleLine(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除领用限制行
export function deleteReceiveLimit(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-receive-limits`, {
    method: 'DELETE',
    body: params,
  });
}

// 批量提交协议
export function batchSubmitAgr(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/batch-submit`, {
    method: 'POST',
    body: params,
  });
}

// 审批通过协议
export function agreementApprove(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/approve`, {
    method: 'POST',
    body: params,
  });
}

// 审批拒绝协议
export function agreementReject(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/reject`, {
    method: 'POST',
    body: params,
  });
}

// 提交协议预校验
export function validateSubmitAgr(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/submit-check`, {
    method: 'POST',
    body: params,
  });
}

// 提交协议
export function submitAgr(params) {
  return request(
    `${SRM_SAGM}/v1/${organizationId}/sale-agreement-headers/submit?customizeUnitCode=SAGM.SALE_WORKBENCH.DETAIL.BASE_INFO.EDIT`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 历史价格记录
export function fetchPriceRecord(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/sale-price-historys/list`, {
    method: 'GET',
    query: params,
  });
}
