/*
 * @Date: 2025-02-12 14:22:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from "utils/intl";
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 第三方角色表格ds
export const getRolesTableDs = (partnerId) => ({
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: "loginName",
      label: intl.get("spfm.supplier.model.supplier.platform.loginName").d("登录名"),
    },
    {
      name: "realName",
      label: intl.get("spfm.supplier.model.supplier.platform.realName").d("真实姓名"),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/partners/list-third-party-user/${partnerId}`,
      method: 'GET',
    },
  },
});

// 批量分配ds
export const getAssignRolesDs = ({supplierCompanyId, partnerTenantId}) => ({
  autoCreate: true,
  paging: false,
  fields: [
    {
      name: "assignRoles",
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SPFM.QUERY_SALES_PERSON',
      lovPara: { supplierCompanyId, supplierTenantId: partnerTenantId},
    },
  ],
});