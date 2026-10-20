import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getSchemaDS() {
  return {
    autoCreate: true,
    autoQuery: true,
    selection: 'single',
    paging: false,
    fields: [
      {
        type: 'string',
        name: 'schemaName',
        label: intl.get('hpdm.config-object-tbl.model.schemaName').d('数据库'),
      },
      {
        type: 'string',
        name: 'schemaDesc',
        label: intl.get('hpdm.config-object-tbl.model.schemaDesc').d('数据库描述'),
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/app-databases/db-list`
          : `${HZERO_SRDM}/v1/app-databases/db-list`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
    },
  };
}

export default getSchemaDS;
