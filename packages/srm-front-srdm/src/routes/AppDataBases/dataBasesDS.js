import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDataBasesDSProps({ appEnvId }) {
  return {
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'schemaName',
        type: 'string',
        lookupCode: 'HPDM.SCHEMA_NAME',
        required: true,
        label: intl.get('hpdm.app-databases.model.schemaName').d('Schema/Database名称'),
      },
      {
        name: 'schemaDesc',
        type: 'string',
        disabled: true,
        label: intl.get('hpdm.app-databases.model.schemaDesc').d('Schema/Database描述'),
      },
      {
        name: 'routeDsId',
        type: 'number',
        required: true,
        label: intl.get('hpdm.app-databases.model.routeDsObject').d('数据源'),
        valueField: `routeDsId`,
        textField: `datasourceName`,
        lookupAxiosConfig: () => ({
          method: 'GET',
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-routing-dss?page=0&size=2000&enabledFlag=1`
            : `${HZERO_SRDM}/v1/dynamic-routing-dss?page=0&size=2000&enabledFlag=1`,
        }),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.app-databases.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
        required: true,
      },
    ],
    queryFields: [],
    transport: {
      read: () => {
        return {
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/app-databases?appEnvId=${appEnvId}`
            : `${HZERO_SRDM}/v1/app-databases?appEnvId=${appEnvId}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/app-databases`
            : `${HZERO_SRDM}/v1/app-databases`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/app-databases`
            : `${HZERO_SRDM}/v1/app-databases`,
          method: 'DELETE',
        };
      },
    },
    events: {
      update: ({ name, record, value }) => {
        if (name === 'schemaName') {
          record.set('schemaDesc', record.getField('schemaName').getLookupData(value).meaning);
        }
      },
    },
  };
}

export default getDataBasesDSProps;
