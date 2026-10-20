// 竞价大厅

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const currentOrganizationId = getCurrentOrganizationId();

// 竞价单头信息查询（采）API
export async function fetchPurchaseBiddingHeader(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header-info/query`, {
    method: 'POST',
    body: otherParams,
    query,
  });
}

// 开始竞价 (采)
export async function reqPurchaseResumeBid(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header/resume`, {
    method: 'POST',
    body: otherParams,
    query,
  });
}

// 暂停竞价 (采)
export async function reqPurchasePauseBid(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header/pause`, {
    method: 'POST',
    body: otherParams,
    query,
  });
}

// 开启试竞价 (采)
export async function reqOpenTrialBidding(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header/start-trial-bidding`, {
    method: 'POST',
    body: {
      ...otherParams,
      tenantId: organizationId,
    },
    query,
  });
}

// 开启正式竞价 (采)
export async function reqOpenBidding(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header/start-bidding`, {
    method: 'POST',
    body: {
      ...otherParams,
      tenantId: organizationId,
    },
    query,
  });
}

// 开启补充单价（采）
export async function reqStartSupplementPrice(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header/start-supplement-price`, {
    method: 'POST',
    body: {
      ...otherParams,
      tenantId: organizationId,
    },
    query,
  });
}

// 结束补充单价（采）
export async function reqEndSupplementPrice(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header/end-supplement-price`, {
    method: 'POST',
    body: {
      ...otherParams,
      tenantId: organizationId,
    },
    query,
  });
}

// 删除供应商最新报价 (采-单价)
export async function deleteSupplierNewPrice(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/unit/item/delete-latest-quote`, {
    method: 'POST',
    body: otherParams,
    query,
  });
}

// 请求当前服务器时间
export async function getCurrentServiceTime() {
  return request(`${prefix}/${currentOrganizationId}/bidding/server/info`, {
    method: 'GET',
  });
}

// 删除供应商最新报价 (采-总价)
export async function deleteTotalPriceSupplierNewPrice(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/total/delete-latest-quote`, {
    method: 'POST',
    body: otherParams,
    query,
  });
}

// 调整时间
export async function biddingAdjustTime(params = {}) {
  const { organizationId, query = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/header/adjust-times`, {
    method: 'POST',
    body: otherParams,
    query,
  });
}
