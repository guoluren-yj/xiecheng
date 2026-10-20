import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
/**
 * 保存映射
 */
export async function saveMap(params) {
  const { mappingType, list } = params;
  const url = `${SRM_SMPC}/v1/${organizationId}/attribute-mappings/${mappingType}`;
  return request(url, {
    method: 'POST',
    body: list,
  });
}
