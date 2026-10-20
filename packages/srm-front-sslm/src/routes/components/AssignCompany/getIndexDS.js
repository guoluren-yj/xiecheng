/*
 * @Date: 2023-01-10 10:37:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'assignMenuScope',
      multiple: true,
      lookupCode: 'SSLM.INVESTG_TMPL_ASSIGN_SCOPE',
      label: intl.get('sslm.common.view.company.applicableFunction').d('适用功能'),
    },
  ],
});

const getTableDS = () => ({
  primaryKey: 'companyId',
  pageSize: 20,
  fields: [
    {
      name: 'assignCompany',
      type: 'object',
      multiple: true,
      ignore: 'always',
      lovCode: 'HPFM.USER_AUTHORITY.COMPANY',
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.common.view.company.code').d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.companyName').d('公司名称'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/investigate-assigns/assignedCompanies`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${organizationId}/investigate-assigns/unassign`,
      method: 'POST',
    },
  },
});

const getColumns = () => [
  {
    name: 'companyNum',
  },
  {
    name: 'companyName',
  },
];

export { getFormDS, getTableDS, getColumns };
