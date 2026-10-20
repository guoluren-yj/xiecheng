import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getExtraParamDSProps({ routeDsId }) {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'configCategory',
        type: 'string',
        required: true,
        label: intl.get('hpdm.extra-param.model.configCategory').d('参数类型'),
        lookupCode: 'HPDM.CONFIG_CATEGORY',
      },
      {
        name: 'configName',
        type: 'string',
        required: true,
        label: intl.get('hpdm.extra-param.model.configName').d('参数名'),
      },
      {
        name: 'configValue',
        type: 'string',
        label: intl.get('hpdm.extra-param.model.configValue').d('参数值'),
      },
      {
        name: 'configType',
        type: 'string',
        required: true,
        label: intl.get('hpdm.extra-param.model.configType').d('参数类型'),
        lookupCode: 'HPDM.CONFIG_TYPE',
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.data-source.model.enabledFlag').d('是否启用'),
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
            ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-configs?routeDsId=${routeDsId}`
            : `${HZERO_SRDM}/v1/dynamic-configs?routeDsId=${routeDsId}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-configs`
            : `${HZERO_SRDM}/v1/dynamic-configs`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-configs`
            : `${HZERO_SRDM}/v1/dynamic-configs`,
          method: 'DELETE',
        };
      },
    },
    events: {},
  };
}

export default getExtraParamDSProps;
