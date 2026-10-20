// 竞价大厅

import request from 'utils/request';
import { SRM_SSRC, SRM_SMBL } from '_utils/config';
// import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const smblPrefix = `${SRM_SMBL}/v1`;

// 供应商-是否开始竞价大厅
export async function fetchSupplierBiddingHallConfig(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/share/config-table`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 单价 竞价单头信息查询（供）API
export async function fetchSupplierBiddingHeader(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/info-query`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 竞价单头规则信息查询（供）
export async function fetchSupplierBiddingRules(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/rule`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 用户信息监控（供）API
export async function userNetSignalInfo(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/user-info/monitor`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 回复-签到
export async function supplierBiddingHallSignIn(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/sign-in`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 回复-签到
export async function supplierCollection(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/line/cur/process-favorite`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 警戒价保存
export async function warningPriceSave(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/line/cur/warn-price-reduction/save`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 保存
export async function quotationPriceSave(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/line/cur/save`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 单价=提交
export async function quotationUnitPriceSubmit(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/line/cur/submit`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应商提交后，单价竞价-需要部分刷新逻辑
export async function quotationRefreshLine(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/line/cur/refresh`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应商提交后，总价竞价-需要部分刷新逻辑
export async function totalQuotationRefreshLine(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/refresh`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应商提交后，总价竞价-需要部分刷新逻辑
// 日/荷兰
export async function japanDutchTotalQuotationRefreshLine(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/round/refresh`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// total price 批量出价保存
export async function totalPriceBatchQuotationSave(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/direction/save`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// total price 批量出价保存
export async function totalPriceHeaderLinesSave(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/save`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// total price 提交
export async function totalPriceHeaderLinesSubmit(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/submit`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应商-节点
export async function supplierProcessBar(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/progress`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// // total price 批量出价保存
// export async function totalPriceHeaderLinesSubmit(params = {}) {
//   const { organizationId, querys = {}, ...otherParams } = params || {};
//   return request(`${prefix}/${organizationId}/bidding/sup/header/cur/submit`, {
//     method: 'POST',
//     body: otherParams,
//     query: querys,
//   });
// }

// 供应商物料行竞价表格-单价
// export async function fetchSupplierLineBiddingTable(params = {}) {
//   const { organizationId, querys = {}, ...otherParams } = params || {};
//   return request(`${prefix}/${organizationId}/bidding-sup-line-recs/unit/item/table`, {
//     method: 'POST',
//     body: otherParams,
//     query: querys,
//   });
// }

// 供应商物料行竞价趋势图-单价
export async function fetchSupplierLineBiddingChart(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding-sup-line-recs/unit/item/charts`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应方趋势图-总价
export async function fetchSupplierLineTotalBiddingChart(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding-sup-header-recs/total-price/charts`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 采购方趋势图-总价
export async function fetchPurchaseTotalLineBiddingChart(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/total-price/trend/charts`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 采购方趋势图-总价-japan dutch
export async function fetchPurchaseJapanDutchTotalLineBiddingChart(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/round-info/chart/purchase`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 采购方物料行竞价趋势图-单价
export async function fetchPurchaseLineBiddingChart(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/item/trend/charts`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应商-单价出价详情表单
export async function fetchSupplierTotalBiddingDetailViewForm(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/total-price/query-info`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应商-总价出价详情表单
export async function fetchSupplierUnitBiddingDetailViewForm(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/line/cur/info`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 批量编辑保存
export async function saveBatchEdit(params) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/batch/save`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

// 供应商-总价出价详情表单 bidding/sup/header/cur/base-info
export async function fetchSupplierBiddingCurrentHeader(params = {}) {
  const { organizationId, querys = {}, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/base-info`, {
    method: 'POST',
    body: otherParams,
    query: querys,
  });
}

export async function saveSupplierBiddingCurrentHeader(params = {}) {
  const { organizationId, querys = {}, data } = params || {};
  return request(`${prefix}/${organizationId}/bidding/sup/header/cur/base-info/save`, {
    method: 'POST',
    body: data,
    query: querys,
  });
}

/**
 * 接口目的：模块查询数据后渲染未读消息/公告红点、数量
在线沟通组件：提供某一个用户在聊天室中未读消息的数量
地址：/smbl/v1/chat-online/messages/unread-num
服务：srm-mobile-config
服务简称：smbl
请求方式：POST
*/
export async function fetchChatRoomUnreadMessage(params = {}) {
  const { querys = {}, data } = params || {};
  return request(`${smblPrefix}/chat-online/messages/unread-num`, {
    method: 'POST',
    body: data,
    query: querys,
  });
}

/**
 * 竞价大厅-多标段列表-supplier
 * @param {*} params 查询参数
 * @returns Promise
 */
export async function fetchBiddingSectionSupplier(params = {}) {
  const { organizationId, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/share/section-info`, {
    method: 'POST',
    body: otherParams,
  });
}

// 竞价大厅-多标段列表-supplier
export async function fetchBiddingSectionPurchase(params = {}) {
  const { organizationId, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/share/section-info/purchase`, {
    method: 'POST',
    body: otherParams,
  });
}

// 竞价大厅-chat-room add-members smbl/v1/chat-online/room/add-member
export async function biddingHallChatRoomAddMembers(params = {}) {
  const { organizationId, ...otherParams } = params || {};
  return request(`${smblPrefix}/chat-online/room/add-member`, {
    method: 'POST',
    body: otherParams,
  });
}

// 警示消息-供应商
export async function fetchWarningMessageSupplier(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/view/message/supplier`, {
    method: 'POST',
    body: otherParams,
  });
}

// 警示消息-采购方
export async function fetchWarningMessagePurchase(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params || {};
  return request(`${prefix}/${organizationId}/bidding/view/message/purchase`, {
    method: 'POST',
    body: otherParams,
  });
}
