import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询采购方是否启用隐私政策
export async function fetchPrivacyPolicyText(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/privacy-agreement`, {
    method: 'GET',
    query: params,
  });
}

// 列表操作按钮回调
export async function listOperate(params) {
  const { type, data } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/${type}`, {
    method: 'POST',
    body: data,
  });
}

// 列表批量删除
export async function batchDelete(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/batch-delete`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存
export async function saveApplication(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/save`, {
    method: 'POST',
    body: params,
  });
}

// 发布
export async function publishApplication(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/release`, {
    method: 'POST',
    body: params,
  });
}

// 删除
export async function deleteApplication(params) {
  const { extSourceReqId, ...body } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/${extSourceReqId}`, {
    method: 'DELETE',
    body,
  });
}

// 完成
export async function finishApplication(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/finish`, {
    method: 'POST',
    body: params,
  });
}

// 撤销
export async function revokeApplication(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/revoke`, {
    method: 'POST',
    body: params,
  });
}

// 建立合作
export async function buildPartner(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/ext-source-quota-suppliers/build-partnership`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 供应商响历史报价信息
export async function queryQuotaHistory(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/ext-source-quota-infos/supplier-history-quota`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 供应商响应左侧卡片组件
 * @param {*} params
 * @returns
 */
export async function supplierQuery(params) {
  const { extSourceReqId, activeTab } = params;
  const url = activeTab === 'supplier' ? 'quota-suppliers' : 'items';
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-${url}/${extSourceReqId}`, {
    method: 'GET',
    query: { page: -1, size: -1 },
  });
}

/**
 * 供应商响应右侧卡片组件
 * @param {*} params
 * @returns
 */
export async function rightQuery(params) {
  const { extSourceItemId, quotaSupplierId, activeTab } = params;
  const url = activeTab === 'supplier' ? 'supplier' : 'item';
  const id = activeTab === 'supplier' ? quotaSupplierId : extSourceItemId;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-quota-infos/${url}/${id}`, {
    method: 'GET',
  });
}

// 候选
export const handleCandidate = data => {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-quota-suppliers/candidate`, {
    method: 'POST',
    body: data,
  });
};

// 拒绝
export const rejectApplication = data => {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-quota-suppliers/reject`, {
    method: 'POST',
    body: data,
  });
};

// 当前租户是否开通寻源系统
export const fetchSourceType = params => {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/get-source-type`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
};

// 查询供应商档案页面地址
export const fetchSupplierFilesUrl = params => {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/ext-source-quota-suppliers/redirect-ext-system-sup-info`,
    {
      method: 'POST',
      body: params,
      responseType: 'text',
    }
  );
};
