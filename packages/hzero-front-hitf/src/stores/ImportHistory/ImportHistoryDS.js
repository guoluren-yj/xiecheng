import intl from 'hzero-front/lib/utils/intl';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/importHistoryLang';
import { TENANT, IMPORT_STATUS } from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    autoQuery: true,
    pageSize: 10,
    selection: false,
    queryFields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
      },
      !isTenantRoleLevel() && {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'requestNum',
        label: getLang('REQUEST_NUM'),
        type: 'string',
      },
      {
        name: 'importUser',
        label: getLang('IMPORT_USER'),
        type: 'string',
      },
      {
        name: 'importUrl',
        label: getLang('IMPORT_URL'),
        type: 'string',
      },
      {
        name: 'importStatus',
        label: getLang('IMPORT_STATUS'),
        type: 'string',
        lookupCode: IMPORT_STATUS,
      },
    ],
    fields: [
      {
        name: 'tenantName',
        label: getLang('BELONG_TENANT'),
        type: 'string',
      },
      {
        name: 'requestNum',
        label: getLang('REQUEST_NUM'),
        type: 'string',
      },
      {
        name: 'importUser',
        label: getLang('IMPORT_USER'),
        type: 'string',
      },
      {
        name: 'importUrl',
        label: getLang('IMPORT_URL'),
        type: 'string',
      },
      {
        name: 'importStatus',
        label: getLang('IMPORT_STATUS'),
        type: 'string',
        lookupCode: IMPORT_STATUS,
      },
      {
        name: 'importMessage',
        label: intl.get('hitf.importHistory.model.importHistory.importMessage').d('导入消息'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => ({
        url: `${HZERO_HITF}/v1${level}/import-historys`,
        params: { ...data, ...params },
        method: 'GET',
      }),
    },
  };
};

export { tableDS };
