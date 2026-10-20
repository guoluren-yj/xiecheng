import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDataSourceDSProps() {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'datasourceName',
        label: intl.get('hpdm.data-source.model.datasourceName').d('数据源名称'),
        required: true,
      },
      {
        type: 'string',
        name: 'driverClassName',
        label: intl.get('hpdm.data-source.model.driverClassName').d('驱动类名称'),
        required: true,
      },
      {
        type: 'string',
        name: 'url',
        label: intl.get('hpdm.data-source.model.url').d('数据库URL'),
        required: true,
      },
      {
        type: 'string',
        name: 'username',
        label: intl.get('hpdm.data-source.model.username').d('用户名'),
        required: true,
      },
      {
        type: 'string',
        name: 'passwords',
        label: intl.get('hpdm.data-source.model.passwords').d('用户密码'),
      },
      {
        type: 'string',
        name: 'decryptPassword',
        label: intl.get('hpdm.data-source.model.decryptPassword').d('用户密码'),
        required: true,
        dynamicProps: {
          required: ({ record }) => {
            return !record.get('routeDsId');
          },
        },
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('hpdm.data-source.model.comments').d('说明'),
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
    queryFields: [
      {
        type: 'string',
        name: 'datasourceName',
        label: intl.get('hpdm.data-source.model.datasourceName').d('数据源名称'),
      },
      {
        type: 'string',
        name: 'driverClassName',
        label: intl.get('hpdm.data-source.model.driverClassName').d('驱动类名称'),
      },
      {
        type: 'string',
        name: 'url',
        label: intl.get('hpdm.data-source.model.url').d('数据库URL'),
      },
      {
        type: 'string',
        name: 'username',
        label: intl.get('hpdm.data-source.model.username').d('用户名'),
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('hpdm.data-source.model.comments').d('说明'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.data-source.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-routing-dss`
          : `${HZERO_SRDM}/v1/dynamic-routing-dss`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-routing-dss`
            : `${HZERO_SRDM}/v1/dynamic-routing-dss`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data: data[0],
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/dynamic-routing-dss`
            : `${HZERO_SRDM}/v1/dynamic-routing-dss`,
          method: 'DELETE',
        };
      },
    },
    events: {},
  };
}

export default getDataSourceDSProps;
