import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 启用禁用分类映射目录
export async function setEnable(params) {
  const { mappingType, mappingId, enabledFlag } = params;
  const type = enabledFlag === 1 ? 'disable' : 'enable';
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}/${type}/${mappingId}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
