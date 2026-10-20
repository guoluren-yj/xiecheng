/*
 * @Date: 2023-04-17 11:12:39
 * @date: 2023-08-31
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

// 列表页单据类型
export const documentList = () => [
  {
    key: 'tenantApproval',
    tab: intl.get('sslm.enterpriseInform.view.title.tenantApproval').d('租户级变更审批'),
    searchCode: 'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_APPROVAL_SEARCH_BAR',
    customizeUnitCode: 'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_APPROVAL_TABLE',
  },
  {
    key: 'platformConfirm',
    tab: intl.get('sslm.enterpriseInform.view.title.platformConfirm').d('平台级变更确认'),
    searchCode: 'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_CONFIRM_SEARCH_BAR',
    customizeUnitCode: 'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_CONFIRM_TABLE',
  },
];
