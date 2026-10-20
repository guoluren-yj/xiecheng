import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export function savePriceMonitor(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/ec-price-monitor-strategys`, {
    method: 'POST',
    body: params,
  });
}

export function saveDimensions(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/ec-price-monitor-dimensions`, {
    method: 'POST',
    body: params,
  });
}

export function deleteDimensions(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/ec-price-monitor-dimensions`, {
    method: 'DELETE',
    body: params,
  });
}

export function saveTreeDimensions(params, monitorStrategyId) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/ec-price-monitor-dimensions/treeSaveDimension/${monitorStrategyId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export function fetchTreeDimensions(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/ec-price-monitor-dimensions/tree-list`, {
    method: 'GET',
    query: params,
  });
}
