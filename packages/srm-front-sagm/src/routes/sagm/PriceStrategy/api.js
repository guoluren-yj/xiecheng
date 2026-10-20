import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 保存 ｜ 保存并执行
export function savePriceStrategy(params) {
  const executedUrl = `/sagm/v1/${organizationId}/price-strategys/save-execute`;
  return request(
    params.changeUuid ? executedUrl : `/sagm/v1/${organizationId}/sale-price-strategy-lines/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 查询单条
export function fetchSingle(params) {
  return request(`/sagm/v1/${organizationId}/price-strategys/${params.priceStrategyId}`, {
    method: 'GET',
  });
}

// 执行
export function executeStrategy(params) {
  return request(`/sagm/v1/${organizationId}/price-strategys/execute`, {
    method: 'POST',
    body: params,
  });
}

// 解锁
export function unLock(params) {
  return request(`/sagm/v1/${organizationId}/price-strategys/unlock/${params.priceStrategyId}`, {
    method: 'GET',
  });
}

// 删除维度
export function deleteDimension(params) {
  return request(`/sagm/v1/${organizationId}/price-strategy-conditions`, {
    method: 'DELETE',
    body: params,
  });
}

// 加入商品映射
export function joinAssignSku(params) {
  return request(`/sagm/v1/${organizationId}/sku-mappings`, {
    method: 'POST',
    body: params,
  });
}

// 删除商品映射
export function deleteAssignSku(params) {
  return request(`/sagm/v1/${organizationId}/sku-mappings`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除阶梯价格行
// 删除商品映射
export function deleteLadders(params) {
  return request(`/sagm/v1/${organizationId}/ladder-price-strategy`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询策略组织维度
export function fetchOrgDimension(params) {
  return request(`/sagm/v1/${organizationId}/strategy-dimensions`, {
    method: 'GET',
    query: {
      lovCode: 'SAGM.STRATEGY_DIMENSIONS',
      tenantId: organizationId,
      enabledFlag: 1,
      strategyDimensionCode: 'ORGANIZATION',
      ...params,
    },
  });
}
