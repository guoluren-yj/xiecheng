/*
 * bankService - 企业注册/银行信息
 * @date: 2018/10/13 10:42:57
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel, getCurrentRole } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
const { id } = getCurrentRole();

const prefix = !TenantRoleLevel ? `${HZERO_PLATFORM}/v1` : `${HZERO_PLATFORM}/v1/${organizationId}`;

// 查询组合业务对象-导入模板-模板配置-新建按钮是否显示
export async function queryImportCreatePermission() {
  return request(`${prefix}/profile-value`, {
    method: 'GET',
    query: {
      roleId: id,
      profileName: 'HMDE_COMPOSITE_IMPORT_CREATE',
    },
  });
}

// 查询组合业务对象-导出模板-字段选择-别名是否可编辑
export async function queryTemplateEditPermission() {
  return request(`${prefix}/profile-value`, {
    method: 'GET',
    query: {
      roleId: id,
      profileName: 'HMDE_COMPOSITE_TEMPLATE_EDIT',
    },
  });
}
