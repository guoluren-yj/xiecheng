import request from 'utils/request';
import { parseParameters } from 'utils/utils';

const SRM_PRODUCT = '/smpc';

// const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询
 * @async
 * @function fetchApproveList
 * @returns {object} fetch Promise
 */
export async function fetchApproveList(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_PRODUCT}/v1/productAudit/queryAudits?page=${param.page}&size=${param.size}`,
    {
      method: 'POST',
      body: { companyId: param.companyId },
    }
  );
}

/**
 * 分类查询
 * @async
 * @function fetchCategory
 * @returns {object} fetch Promise
 */
export async function fetchCategory() {
  return request(`${SRM_PRODUCT}/v1/category/getTreeWithThreeList`, {
    method: 'GET',
  });
}

export async function fetchselectedCategory(param) {
  return request(`${SRM_PRODUCT}/v1/productAudit/${param.id}/getById`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 确定保存
 * @function fetchHandleOk
 * @returns {object} fetch Promise
 */
export async function fetchHandleOk(params) {
  return request(`${SRM_PRODUCT}/v1/productAudit/saveOrUpdate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function fetchDelete
 * @returns {object} fetch Promise
 */
export async function fetchDelete(params) {
  return request(`${SRM_PRODUCT}/v1/productAudit/${params.id}/deleteById`, {
    method: 'DELETE',
    body: params.id,
  });
}
