// 维护业务对象接口
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchAudit: 审核数据列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAudit(params) {
  return request(`${SRM_DATA_SDAT}/v1/audit-center/batch-audit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * getCombinationBOList: 获取模型对象列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function getCombinationBOList(params) {
  return request(params.url, {
    method: 'GET',
    query: {
      ...params,
      url: '',
    },
  });
}

/**
 * 业务对象组合对象左侧对象详情关系树
 * */
export async function getCombinationBOTreeList({ businessObjectId, query }) {
  return request(
    `/hmde/v1/${getCurrentOrganizationId()}/business-object-relations/${businessObjectId}/tree`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 批量查询字段列表
 * @param {*} params
 * @returns
 */
export async function fetchBatchColumns(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/meta-table/table-fields`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量查询字段列表
 * @param {*} params
 * @returns
 */
export async function fetchPlatformBatchColumns(params) {
  return request(`${SRM_DATA_SDAT}/v1/meta-table/table-fields`, {
    method: 'POST',
    body: params,
  });
}
