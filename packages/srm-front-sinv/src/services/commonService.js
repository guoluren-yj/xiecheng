import { SRM_PLATFORM } from '_utils/config';
import request from 'utils/request';
import { getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';

// 查询配置表
export async function fetchConfigSheet(params) {
  const organizationId = getCurrentOrganizationId();
  const { configCode } = params;
  const data = {
    tenantNum: getCurrentTenant().tenantNum,
  };
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${configCode}/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
}
