import request from 'utils/request';

export function fetchEnableSupplier(params) {
  const { enableFlag } = params;
  const req = enableFlag === 1 ? 'disable' : 'enable';
  return request(`/smkt/v1/pick-suppliers/${req}`, {
    method: 'POST',
    body: params,
  });
}

export function fetchNewSupplier(params) {
  return request(`/smkt/v1/pick-suppliers/add`, {
    method: 'POST',
    body: params,
  });
}
