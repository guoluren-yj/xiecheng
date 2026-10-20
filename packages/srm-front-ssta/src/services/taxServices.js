// 直连开票相关接口
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const prefix = `/ssta/v1/${tenantId}`;

// 同步税务发票
export async function syncTaxControlInfo(params) {
  return request(`${prefix}/direct-tax-ctrl-headers/sync`, {
    method: 'POST',
    body: params,
  });
}

// 更新库存发票
export async function updateTaxIncoice(params) {
  return request(`${prefix}/direct-inventory-invoices/sync`, {
    method: 'POST',
    body: params,
  });
}

// 初始化商品信息
export async function initDirectCommoditys(params) {
  return request(`${prefix}/direct-commoditys/init`, {
    method: 'POST',
    body: params,
  });
}

// 保存信息
export async function saveDirectCommoditys(params) {
  return request(`${prefix}/direct-commoditys/update`, {
    method: 'PUT',
    body: params,
  });
}

// 编辑启用/不启用
export async function enableDirectCommoditys(params) {
  return request(`${prefix}/direct-commoditys/enable`, {
    method: 'PUT',
    body: params,
  });
}

export async function getNumber(params) {
  const { type } = params;
  const url = type === 'info' ? '/direct-commoditys/list' : '/direct-commodity-mappings/list';
  return request(`${prefix}${url}`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

// 税收商品映射新建提交
export async function createDirectCommoditys(params) {
  return request(`${prefix}/direct-commodity-mappings/create`, {
    method: 'POST',
    body: params,
  });
}

// 税收商品映射编辑提交
export async function updateMapDirectCommoditys(params) {
  return request(`${prefix}/direct-commodity-mappings/update`, {
    method: 'PUT',
    body: params,
  });
}

// 开票规则启用/不启用
export async function invoiceRuleEnable(params) {
  return request(`${prefix}/direct-invoice-rules/enable`, {
    method: 'PUT',
    body: params,
  });
}

// 开票规则复制
export async function invoiceRuleCopy(params) {
  return request(`${prefix}/direct-invoice-rules/copy/${params.ruleId}`, {
    method: 'POST',
    body: params,
  });
}

// 开票规则保存
export async function invoiceRuleSave(params) {
  return request(`${prefix}/direct-invoice-rules`, {
    method: 'POST',
    body: params,
  });
}

// 开票规则保存发布
export async function invoiceRulePublish(params) {
  return request(`${prefix}/direct-invoice-rules/release`, {
    method: 'PUT',
    body: params,
  });
}

// 开票规则历史版本
export async function invoiceRuleHistory(params) {
  return request(`${prefix}/direct-invoice-rules/history/page`, {
    method: 'GET',
    // body: params,
    query: params,
  });
}

// 点了开票规则列表的编辑
export async function invoiceRuleEdit(params) {
  return request(`${prefix}/direct-invoice-rules/create/${params.ruleId}`, {
    method: 'PUT',
    body: params,
  });
}
