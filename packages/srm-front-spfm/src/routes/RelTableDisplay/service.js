/**
 * 配置表生成的菜单相关的service
 */
import request from 'utils/request';
import { SRM_ADAPTOR } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 获取菜单配置
 */
export async function getRelTableMenuConfigApi(tableCode) {
  const body = {
    tableCode,
  };

  return request(
    `${SRM_ADAPTOR}/v1/${organizationId}/rel-table-records/marmot_rel_table_page_control/list-from-site`,
    {
      method: 'POST',
      body,
    }
  );
}
