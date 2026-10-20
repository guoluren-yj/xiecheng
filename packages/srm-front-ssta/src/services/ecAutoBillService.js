import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const prefix = `/ssta/v1/${tenantId}`;

/**
 * 保存
 * @param {数据} Object
 */
export async function save(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${prefix}/auto-bills?customizeUnitCode=${customizeUnitCode}`, {
    method: 'POST',
    body,
  });
}

/**
 * 获取电商信息
 * @param {数据} Object
 */
export async function match(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${prefix}/auto-bills/bill-match?customizeUnitCode=${customizeUnitCode}`, {
    method: 'PUT',
    body,
  });
}

/**
 * 确认
 * @param {数据} Object
 */
export async function confirm(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${prefix}/auto-bills/confirm?customizeUnitCode=${customizeUnitCode}`, {
    method: 'PUT',
    body,
  });
}

/**
 * 退回
 * @param {数据} Object
 */
export async function returnBack(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${prefix}/auto-bills/return-back?customizeUnitCode=${customizeUnitCode}`, {
    method: 'PUT',
    body,
  });
}

/**
 * 获取预算规则详情
 */
export async function getBillLineDetail(settleId) {
  return request(`${prefix}/settles/detail-for-bill/${settleId}`, {
    method: 'GET',
  });
}

/**
 * 获取电商对账单行总数
 */
export async function getEcLines(query) {
  return request(`${prefix}/auto-bills/ec-bill-count`, {
    method: 'GET',
    query,
  });
}

/**
 * 对账失败
 */
export async function billFail(data) {
  const { customizeUnitCode, ...body } = data;
  return request(`${prefix}/auto-bills/return-back?customizeUnitCode=${customizeUnitCode}`, {
    method: 'PUT',
    body,
  });
}
