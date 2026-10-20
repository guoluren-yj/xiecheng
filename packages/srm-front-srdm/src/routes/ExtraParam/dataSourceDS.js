import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDataSourceDSProps({ routeDsId }) {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'datasourceName',
        label: intl.get('hpdm.data-source.model.datasourceName').d('数据源名称'),
        disabled: true,
        required: true,
      },
      {
        type: 'string',
        name: 'driverClassName',
        label: intl.get('hpdm.data-source.model.driverClassName').d('驱动类名称'),
        disabled: true,
        required: true,
      },
      {
        type: 'string',
        name: 'url',
        label: intl.get('hpdm.data-source.model.url').d('数据库URL'),
        disabled: true,
        required: true,
      },
      {
        type: 'string',
        name: 'username',
        label: intl.get('hpdm.data-source.model.username').d('用户名'),
        disabled: true,
        required: true,
      },
      {
        type: 'string',
        name: 'passwords',
        label: intl.get('hpdm.data-source.model.passwords').d('用户密码'),
        disabled: true,
      },
      {
        type: 'string',
        name: 'decryptPassword',
        label: intl.get('hpdm.data-source.model.decryptPassword').d('用户密码'),
        disabled: true,
        required: true,
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('hpdm.data-source.model.comments').d('说明'),
        disabled: true,
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.data-source.model.enabledFlag').d('是否启用'),
        disabled: true,
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
        required: true,
      },
    ],
    queryFields: [],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-routing-dss?routeDsId=${routeDsId}`
          : `${HZERO_SRDM}/v1/dynamic-routing-dss?routeDsId=${routeDsId}`;
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

export default getDataSourceDSProps;
