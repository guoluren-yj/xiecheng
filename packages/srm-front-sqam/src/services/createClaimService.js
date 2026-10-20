import request from 'utils/request';
import { SRM_SQAM, SRM_ADAPTOR } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import moment from 'moment';

const organizationId = getCurrentOrganizationId();

export async function createClaim(params) {
  const customizeUnitCode =
    'SQAM.CREATE_CLAIM.DETAIL.BASIC_INFO,SQAM.CREATE_CLAIM.DETAIL.CLAIM_INFO,SQAM.CREATE_CLAIM.DETAIL.LINES';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/save?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function fetchClaim(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/create/page`, {
    method: 'GET',
    query,
  });
}

export async function deleteLines(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form-lines/delete-batch`, {
    method: 'DELETE',
    body: params,
  });
}

export async function fetchHeader(params) {
  const customizeUnitCode =
    'SQAM.CREATE_CLAIM.DETAIL.BASIC_INFO,SQAM.CREATE_CLAIM.DETAIL.CLAIM_INFO';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/create/detail/${params}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
    }
  );
}

export async function fetchLines(params) {
  const customizeUnitCode = 'SQAM.CREATE_CLAIM.DETAIL.LINES';
  const query = filterNullValueObject(parseParameters(params));
  const { formHeaderId, ...others } = query;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form-lines/detail/${formHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

export async function deleteClaim(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/delete`, {
    method: 'DELETE',
    body: params,
  });
}

export async function submitClaim(params) {
  const customizeUnitCode =
    'SQAM.CREATE_CLAIM.DETAIL.BASIC_INFO,SQAM.CREATE_CLAIM.DETAIL.CLAIM_INFO,SQAM.CREATE_CLAIM.DETAIL.LINES';
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form/submit-batch?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function bindUUID(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/attachment/add`, {
    method: 'PUT',
    query: params,
  });
}

export async function create() {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-types/default-type-query`, {
    method: 'GET',
  });
}

export async function userID(params) {
  return request(`/iam/v1/${organizationId}/user-defaults`, {
    method: 'GET',
    query: params,
  });
}

export async function userIDDefault(params) {
  const { userId } = params || {};
  return request(`/iam/v1/${organizationId}/user-defaults/${userId}`, {
    method: 'GET',
  });
}

// 引用创建
export async function fetchQuoteData(params) {
  const { creationDateFrom, creationDateTo, ...query } = filterNullValueObject(
    parseParameters(params.query)
  );
  const dataQuery = Object.assign(
    query,
    creationDateFrom && {
      creationDateFrom: moment(creationDateFrom).format(DATETIME_MIN),
    },
    creationDateTo && {
      creationDateTo: moment(creationDateTo).format(DATETIME_MAX),
    },
    {
      customizeUnitCode:
        'SQAM.CREATE_CLAIM_LIST.QUOTE_FILTER,SQAM.CREATE_CLAIM_LIST.QUOTE_GRID,SQAM.CREATE_CLAIM_LIST.TRX_QUOTE_FILTER',
    }
  );
  return request(`${SRM_SQAM}/v1/${params.tenantId}/incoming-inspections`, {
    query: dataQuery,
  });
}

export async function createClaimByInspection(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/create-claim-by-inpection`, {
    method: 'POST',
    body,
  });
}

export async function queryAmountMaintenanceMode(body) {
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/marmot-organization-api/CNF_INVOKE`, {
    method: 'POST',
    body,
  });
}

export async function submitValidate(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/validate-submit-batch`, {
    method: 'PUT',
    body,
  });
}
