import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getMigrateGroupsDSProps({ mgGroupId }) {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'mgGroupNum',
        label: intl.get('hpdm.migrate-groups.model.mgGroupNum').d('组别编码'),
      },
      {
        type: 'string',
        name: 'mgGroupName',
        label: intl.get('hpdm.migrate-groups.model.mgGroupName').d('组别名称'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        required: true,
        label: intl.get('hpdm.migrate-groups.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
      {
        type: 'string',
        name: 'mgGroupDesc',
        label: intl.get('hpdm.migrate-groups.model.mgGroupDesc').d('组别说明'),
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'mgGroupNum',
        label: intl.get('hpdm.migrate-groups.model.mgGroupNum').d('组别编码'),
      },
      {
        type: 'string',
        name: 'mgGroupName',
        label: intl.get('hpdm.migrate-groups.model.mgGroupName').d('组别名称'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        label: intl.get('hpdm.migrate-groups.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-groups/${mgGroupId}`
          : `${HZERO_SRDM}/v1/data-migrate-groups/${mgGroupId}`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
    },
    events: {},
  };
}

export default getMigrateGroupsDSProps;
