import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getMigrateGroupsObjDSProps({ mgGroupId }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'objectCode',
        required: true,
        label: intl.get('hpdm.migrate-groups-obj.model.objectCode').d('配置对象编码'),
      },
      {
        type: 'string',
        name: 'objectName',
        required: true,
        label: intl.get('hpdm.migrate-groups-obj.model.objectName').d('配置对象名称'),
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('hpdm.migrate-groups-obj.model.comments').d('说明'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        required: true,
        label: intl.get('hpdm.migrate-groups-obj.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
    ],
    autoQuery: true,
    queryFields: [
      {
        type: 'string',
        name: 'objectCode',
        label: intl.get('hpdm.migrate-groups-obj.model.objectCode').d('配置对象编码'),
      },
      {
        type: 'string',
        name: 'objectName',
        label: intl.get('hpdm.migrate-groups-obj.model.objectName').d('配置对象名称'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        label: intl.get('hpdm.migrate-groups-obj.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-objs?mgGroupId=${mgGroupId}`
          : `${HZERO_SRDM}/v1/data-migrate-objs?mgGroupId=${mgGroupId}`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-objs`
            : `${HZERO_SRDM}/v1/data-migrate-objs`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-objs`
            : `${HZERO_SRDM}/v1/data-migrate-objs`,
          method: 'DELETE',
        };
      },
    },
    events: {},
  };
}

export default getMigrateGroupsObjDSProps;
