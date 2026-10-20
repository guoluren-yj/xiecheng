import request from 'utils/request';
import { SRM_SAGM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 商品介绍模板
export async function fetchAgreementHistory({ agreementId, ...others }) {
  return request(`${SRM_SAGM}/v1/${organizationId}/agreements/agreement-his-list/${agreementId}`, {
    method: 'GET',
    query: others,
  });
}
