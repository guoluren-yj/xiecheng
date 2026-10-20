import request from 'utils/request';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { SMALL_ORDER } from '_utils/config';

const SMOP = '/sop';

// const organizationId = getCurrentOrganizationId(); // 租户ID

export async function updateDoc(param) {
  return request(`${SMOP}/v1/menu-deploy/update`, {
    method: 'POST',
    body: param,
  });
}
