import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getTableStructerDSProps({ objectTblId }) {
  return {
    autoCreate: true,
    fields: [
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.config-object-tbl.model.tableName').d('表名'),
      },
      {
        type: 'string',
        name: 'objectTblName',
        label: intl.get('hpdm.config-object-tbl.model.objectTblName').d('表名称'),
      },
      {
        type: 'string',
        name: 'objectTblDesc',
        label: intl.get('hpdm.config-object-tbl.model.objectTblDesc').d('表说明'),
      },
      {
        type: 'number',
        name: 'tblPriority',
        label: intl.get('hpdm.config-object-tbl.model.tblPriority').d('迁移优先级'),
      },
      {
        type: 'string',
        name: 'displayFieldDesc',
        label: intl.get('hpdm.config-object-tbl.model.displayFieldDesc').d('表的来源日期关系(SQL)'),
      },
      {
        type: 'string',
        name: 'relateType',
        label: intl.get('hpdm.config-object-tbl.model.relateType').d('关联类型'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        label: intl.get('hpdm.config-object-tbl.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    queryFields: [],
    autoQuery: true,
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/query?objectTblId=${objectTblId}`
          : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/query?objectTblId=${objectTblId}`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/createAndUpdate`
            : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/createAndUpdate`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export default getTableStructerDSProps;
