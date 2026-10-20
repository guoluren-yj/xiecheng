import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getMigrateGroupsTableDSProps({ mgGrObjId }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.migrate-groups-table.model.tableName').d('表名'),
        required: true,
        valueField: `tableName`,
        textField: `tableName`,
        dynamicProps: {
          lookupAxiosConfig: ({ record }) => {
            if (record.get('objectId')) {
              return {
                method: 'GET',
                url: isTenantRoleLevel()
                  ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/tbl-list?objectId=${record.get(
                      'objectId'
                    )}&page=0&size=2000`
                  : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/tbl-list?objectId=${record.get(
                      'objectId'
                    )}&page=0&size=2000`,
              };
            }
          },
        },
      },
      {
        type: 'number',
        name: 'objectTblId',
      },
      {
        type: 'string',
        name: 'objectTblName',
        label: intl.get('hpdm.migrate-groups-table.model.objectTblName').d('表名称'),
        disabled: true,
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('hpdm.migrate-groups-table.model.comments').d('说明'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        required: true,
        label: intl.get('hpdm.migrate-groups-table.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.migrate-groups-table.model.tableName').d('表名'),
      },
      {
        type: 'string',
        name: 'objectTblName',
        label: intl.get('hpdm.migrate-groups-table.model.objectTblName').d('表名称'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        label: intl.get('hpdm.migrate-groups-table.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    autoQuery: true,
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-tbls?mgGrObjId=${mgGrObjId}`
          : `${HZERO_SRDM}/v1/data-migrate-tbls?mgGrObjId=${mgGrObjId}`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/data-migrate-tbls`
            : `${HZERO_SRDM}/v1/data-migrate-tbls`,
          method: 'POST',
        };
      },
    },
    events: {
      update: ({ name, record, value }) => {
        if (name === 'tableName') {
          record.set(
            'objectTblName',
            record.getField('tableName').getLookupData(value).objectTblName
          );
          record.set('objectTblId', record.getField('tableName').getLookupData(value).objectTblId);
        }
      },
    },
  };
}

export default getMigrateGroupsTableDSProps;
