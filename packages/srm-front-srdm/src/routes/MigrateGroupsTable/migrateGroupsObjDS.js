import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getMigrateGroupsObjDSProps({ mgGrObjId }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'groupNum',
        label: intl.get('hpdm.migrate-groups.model.groupNum').d('组别编码'),
      },
      {
        type: 'string',
        name: 'groupName',
        label: intl.get('hpdm.migrate-groups.model.groupName').d('组别名称'),
      },
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
    autoQuery: false,
    queryFields: [],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-objs/${mgGrObjId}`
          : `${HZERO_SRDM}/v1/data-migrate-objs/${mgGrObjId}`;
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

export default getMigrateGroupsObjDSProps;
