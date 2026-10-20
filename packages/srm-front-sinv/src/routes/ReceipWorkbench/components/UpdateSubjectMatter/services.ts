import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchModal(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-strategy-change/query`, {
    query: params,
    method: 'GET',
  });
};

export async function confirm({oldStrategyHeaderId, newStrategyHeaderId, lineList}) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/rcv-strategy-change/change-strategy?oldStrategyHeaderId=${oldStrategyHeaderId}&newStrategyHeaderId=${newStrategyHeaderId}`,
    {
      method: 'POST',
      body: lineList,
    }
  );
}