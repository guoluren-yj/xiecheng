import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getAppEnvDSProps({ appEnvId }) {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'environmentCode',
        label: intl.get('hpdm.app-env.model.environmentCode').d('环境编码'),
        disabled: true,
        required: true,
      },
      {
        type: 'string',
        name: 'environmentName',
        label: intl.get('hpdm.app-env.model.environmentName').d('环境名称'),
        disabled: true,
        required: true,
      },
      {
        type: 'string',
        name: 'environmentDesc',
        label: intl.get('hpdm.app-env.model.environmentDesc').d('环境描述'),
        disabled: true,
      },
      {
        type: 'string',
        name: 'prodFlag',
        label: intl.get('hpdm.app-env.model.prodFlag').d('是否生产'),
        disabled: true,
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'verifyFlag',
        label: intl.get('hpdm.app-env.model.verifyFlag').d('是否验证'),
        disabled: true,
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'string',
        name: 'verifyPassword',
        label: intl.get('hpdm.app-env.model.verifyPassword').d('验证密码'),
      },
      {
        type: 'string',
        name: 'decryptVerifyPassword',
        label: intl.get('hpdm.app-env.model.decryptVerifyPassword').d('验证密码'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.app-env.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        disabled: true,
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'environmentCode',
        label: intl.get('hpdm.app-env.model.environmentCode').d('环境编码'),
      },
      {
        type: 'string',
        name: 'environmentName',
        label: intl.get('hpdm.app-env.model.environmentName').d('环境名称'),
      },
      {
        type: 'string',
        name: 'environmentDesc',
        label: intl.get('hpdm.app-env.model.environmentDesc').d('环境描述'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.app-env.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/application-envs?appEnvId=${appEnvId}`
          : `${HZERO_SRDM}/v1/application-envs?appEnvId=${appEnvId}`;
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

export default getAppEnvDSProps;
