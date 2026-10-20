import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = `${SRM_SSTA}/v1/${organizationId}`;

/**
 * @description:获取计算结果数据
 * @param {object} query
 * @returns {object} fetch Promise
 */
export async function getResultApi(query)
{
  return request(`${prefix}/rebates-execute-data/page`, {
    method: 'GET',
    query: { page: 0, size: 10, ...query },
  });
}

/**
 * @description:重新执行
 * @param {object} body
 * @returns {object} fetch Promise
 */
export async function reExecuteApi(body)
{
  return request(`${prefix}/rebates-execute-record/re-execute`, {
    method: 'PUT',
    body,
  });
}