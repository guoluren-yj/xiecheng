import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getConfigObjectDSProps({ objectId }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'objectCode',
        label: intl.get('hpdm.config-object-tbl.model.objectCode').d('配置对象编码'),
      },
      {
        type: 'string',
        name: 'objectName',
        label: intl.get('hpdm.config-object-tbl.model.objectName').d('配置对象名称'),
      },
      {
        type: 'string',
        name: 'objectDesc',
        label: intl.get('hpdm.config-object-tbl.model.objectDesc').d('配置对象说明'),
      },
      {
        type: 'number',
        name: 'objectPriority',
        label: intl.get('hpdm.config-object-tbl.model.objectPriority').d('迁移优先级'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.config-object-tbl.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    autoQuery: true,
    queryFields: [],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/${objectId}`
          : `${HZERO_SRDM}/v1/hpdm-config-objects/${objectId}`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-objects/createAndUpdate`
            : `${HZERO_SRDM}/v1/hpdm-config-objects/createAndUpdate`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export default getConfigObjectDSProps;
