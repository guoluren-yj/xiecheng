// import { HZERO_FILE } from 'utils/config';
import { SRM_SPUC, SRM_SSRC } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export function fetchList(payload) {
  const param = filterNullValueObject(parseParameters(payload));
  // return request(`${SRM_SPUC}/v1/${organizationId}/po-header/source-result`, {
  return request(`${SRM_SSRC}/v1/${organizationId}/source/result/external-call/result-list`, {
    method: 'GET',
    query: param,
  });
}

export function createOrder(sourceResultDTOList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/rfx-to-order`, {
    method: 'POST',
    body: sourceResultDTOList,
  });
}

//  showLadderInquiry
export async function showLadderInquiry(params) {
  const { sourceLineItemId } = params;
  return request(`/ssrc/v1/${organizationId}/rfx/${sourceLineItemId}/ladder-inquiry`, {
    method: 'GET',
  });
}
