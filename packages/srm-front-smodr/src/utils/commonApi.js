import request from 'utils/request';

// 进查询数据总数
export function fetchOnlyCount(url = '', params = {}) {
  return request(url, {
    method: 'GET',
    query: {
      ...params,
      size: 1,
      onlyCountFlag: 'Y',
    },
  });
}
