import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';
import { labelTooltipRender } from '@/common/utils';

const organizationId = getCurrentOrganizationId();

function getAppEnvDSProps() {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'environmentCode',
        label: intl.get('hpdm.app-env.model.environmentCode').d('环境编码'),
        required: true,
      },
      {
        type: 'string',
        name: 'environmentName',
        label: intl.get('hpdm.app-env.model.environmentName').d('环境名称'),
        required: true,
      },
      {
        type: 'string',
        name: 'environmentDesc',
        label: intl.get('hpdm.app-env.model.environmentDesc').d('环境描述'),
      },
      {
        type: 'string',
        name: 'prodFlag',
        label: intl.get('hpdm.app-env.model.prodFlag').d('是否生产'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'verifyFlag',
        label: labelTooltipRender(
          intl.get('hpdm.app-env.model.verifyFlag').d('是否验证'),
          intl.get('hpdm.app-env.help.verifyFlag').d(`设置进行环境迁移的时需要密码认证`)
        ),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
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
        dynamicProps: {
          required: ({ record }) => {
            if (Number(record.get('verifyFlag')) === 1) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.app-env.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
        required: true,
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
          ? `${HZERO_SRDM}/v1/${organizationId}/application-envs`
          : `${HZERO_SRDM}/v1/application-envs`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/application-envs`
            : `${HZERO_SRDM}/v1/application-envs`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export default getAppEnvDSProps;
