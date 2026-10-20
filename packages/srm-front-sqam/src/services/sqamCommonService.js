import request from 'utils/request';
import { SRM_SQAM, SRM_SSTA } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchOperationRecord(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { formHeaderId, ...others } = query;
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form-records/${formHeaderId}/records`, {
    method: 'GET',
    query: others,
  });
}

export async function approveHistory(params) {
  const { formHeaderId } = params;
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form-records/${formHeaderId}/work/flow/records`,
    {
      method: 'GET',
    }
  );
}

export async function fetchFlag(formHeaderId) {
  return request(
    `${SRM_SQAM}/v1/${organizationId}/claim-form-records/work/flow/records/${formHeaderId}`,
    {
      method: 'GET',
    }
  );
}

// 根据公司获取业务实体默认值，根据公司和业务实体获取采购组织默认值
export async function getDefaultFromCompany(query) {
  return request(`${SRM_SSTA}/v1/${organizationId}/comment/purchase-requests/purchase-company`, {
    method: 'GET',
    query,
  });
}

// 根据采购组织获取业务员默认值
export async function getDefaultFromPurOrg(query) {
  return request(`${SRM_SSTA}/v1/${organizationId}/comment/purchase-requests/agent`, {
    method: 'GET',
    query,
  });
}
