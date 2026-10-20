import request from 'utils/request';

/**
 *查询分类
 *
 */
export async function fetchTypeTree() {
  return request(`/smpc/v1/category/getTreeWithThreeList`, {
    method: 'GET',
  });
}

/**
 * 查询
 * @async
 * @function fetchParityList
 * @returns {object} fetch Promise
 */
export async function fetchParityList(params) {
  const { categoryId, ...otherParams } = params;
  return request(`/smpc/v1/productCompareRule/${categoryId}/showCompare`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 保存
 * @function fetchSaveList
 * @returns {object} fetch Promise
 */
export async function fetchSaveList(params) {
  return request(`/smpc/v1/productCompareRule/saveOrUpdate`, {
    method: 'POST',
    body: params,
  });
}
