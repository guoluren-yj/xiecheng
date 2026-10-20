import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchClaim(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/approval/page`, {
    method: 'GET',
    query,
  });
}

export async function fetchHeader(params) {
  const customizeUnitCode =
    'SQAM.CLAIM_APPROVAL_DETAIL.BASIC_INFO,SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_INFO';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/approval/detail/${params}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
    }
  );
}

export async function fetchLines(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { formHeaderId, ...others } = query;
  const customizeUnitCode =
    'SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM,SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM_FILTER';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form-lines/approval/detail/${formHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

export async function approval(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/approve/agree`, {
    method: 'POST',
    body: params,
  });
}

export async function refuse(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/approve/refuse`, {
    method: 'POST',
    body: params,
  });
}

export async function saveClaim(params) {
  const code =
    'SQAM.CLAIM_APPROVAL_DETAIL.BASIC_INFO,SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_INFO,SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM,SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM_FILTER';
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/save?customizeUnitCode=${code}`, {
    method: 'POST',
    body: params,
  });
}
