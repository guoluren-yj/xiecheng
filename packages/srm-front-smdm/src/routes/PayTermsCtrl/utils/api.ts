import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DetailCustomizeCode } from './type';

interface FetchTermsHistoryParams {
  termNum: string;
  page?: number;
  size?: number;
};

/**
 * @description:查询付款条款管控历史版本
 * @param {FetchTermsHistoryParams} params
 * @returns {object} fetch Promise
 */
export async function fetchTermsHistory(query: FetchTermsHistoryParams) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSTA}/v1/${organizationId}/term-headers/history/page`, {
    method: 'GET',
    query,
  });
}

/**
 * @description: 查询付款条款管控启用状态
 * @return {object} fetch Promise
 */
export async function fetchPayTermsCtrlState() {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSTA}/v1/${organizationId}/term-headers/query-enable-record`, {
    method: 'GET',
    query: { tenantId: organizationId },
  });
}

/**
 * @description: 切换付款条款管控启用状态
 * @param {SwitchPayTermsCtrlStateParams} body { enableRecord: 1 | 0 }
 * @return {object} fetch Promise
 */
export async function switchPayTermsCtrlState(enableRecord: 1 | 0) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSTA}/v1/${organizationId}/term-headers/term-switch`, {
    method: 'PUT',
    query: { enableRecord },
  });
}

/**
 * @description: 编辑付款条款管控
 * @param {string} termHeaderId 付款条款id
 * @return {object} fetch Promise
 */
export async function editPayTermsCtrl(termHeaderId: string | number) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSTA}/v1/${organizationId}/term-headers/create/${termHeaderId}`, {
    method: 'PUT',
  });
}

export async function fetchTermHeaderData(termHeaderId: string | number) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSTA}/v1/${organizationId}/term-headers/detail`, {
    method: 'GET',
    query: {
      termHeaderId,
      customizeUnitCode: Object.values(DetailCustomizeCode).join(),
    },
  });
}