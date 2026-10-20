import request from 'utils/request';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { ActiveKey, ActionMap, HeadCustCodeMap } from './type';

/**
 * @description:列表页整单查询接口
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchPayDocListTotal(activeKey: ActiveKey) {
  const actionType = ActionMap[activeKey];
  const urlMap = {
    [ActiveKey.DetailPayment]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-lines/list`,
    [ActiveKey.DetailStatement]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/list`,
  };
  return request(urlMap[activeKey] || `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/list`, {
    method: 'POST',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
    body: { actionType },
  });
}

export async function fetchPayDocDetail(payHeaderId: string) {
  return request(`${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/detail/${payHeaderId}`, {
    method: 'GET',
    query: {
      customizeUnitCode: [HeadCustCodeMap.Basic, HeadCustCodeMap.Attachment].join(),
    },
  });
};

export async function updateStep(body) {
  return request(`${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/update-step`, {
    method: 'PUT',
    body,
  });
}

export async function checkCurrency(body) {
  return request(`${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/check-currency`, {
    method: 'POST',
    body,
  });
}