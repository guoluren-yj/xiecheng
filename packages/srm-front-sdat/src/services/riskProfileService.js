/**
 * 风险工作台
 * @date: 2024-05-28
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchRiskTroubleshoot: 关系排查详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchRiskTroubleshoot(params) {
  const { organizationId } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${
      organizationId || getCurrentOrganizationId()
    }/risk-report-record/company-relation-mining`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 风险等级查询
 * @param {*} params
 * @returns
 */
export async function fetchRiskProfileDetail(params) {
  const { organizationId } = params;

  return request(
    `${SRM_DATA_SDAT}/v1/${
      organizationId || getCurrentOrganizationId()
    }/risk-report-record/company-risk-profile`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function fetchMiningDetail(params) {
  const { organizationId } = params;

  return request(
    `${SRM_DATA_SDAT}/v1/${
      organizationId || getCurrentOrganizationId()
    }/blacklist-relation-info/relation-statistics`,
    {
      method: 'GET',
      query: params,
    }
  );
}
