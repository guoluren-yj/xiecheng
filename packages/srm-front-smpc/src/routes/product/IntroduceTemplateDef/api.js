import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

/**
 * 模板保存
 */
export async function saveTemplate(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-detail-templates`, {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}
