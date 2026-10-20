import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export function fetchEcApproveSkuInfo(skuId) {
  return request(`/smec/v1/${organizationId}/pur-skus/preview-info/${skuId}`, {
    method: 'POST',
  });
}
