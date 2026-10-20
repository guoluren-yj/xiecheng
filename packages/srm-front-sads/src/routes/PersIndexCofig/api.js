import request from 'utils/request';

// 保存索引信息
export async function fetchSave(params) {
  return request(`/sdap/v1/es-indexs`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchCodes(params) {
  return request(`/sdap/v1/es-indexs/refresh-obj`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDeleteSubLine(params) {
  return request(`/sdap/v1/sub-obj-headers`, {
    method: 'DELETE',
    body: params,
  });
}

export async function fetchDetails(indexId) {
  return request(`/sdap/v1/es-indexs/${indexId}`, {
    method: 'GET',
  });
}
