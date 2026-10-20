import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';
import { labelTooltipRender } from '@/common/utils';

const organizationId = getCurrentOrganizationId();

function getConfigObjectContactDS({ objectId, objectTblId }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.config-object-tbl.model.tableName').d('表名'),
        required: true,
      },
      {
        type: 'string',
        name: 'fields',
        label: intl.get('hpdm.config-object-field.model.objectFldName').d('字段名称'),
        required: true,
      },
      {
        type: 'object',
        name: 'referenceMainTable',
        label: intl.get('srdm.config-object.model.referenceTblName').d('关联表'),
        lovCode: 'SRDM.CONFIG_OBJECT_TBL',
        textField: 'tableName',
        valueField: 'objectTblId',
        ignore: 'always',
        lovPara: { objectId },
      },
      {
        type: 'string',
        name: 'referenceTblName',
        label: intl.get('srdm.config-object.model.referenceTblName').d('关联表'),
        bind: 'referenceMainTable.tableName',
      },
      {
        type: 'number',
        name: 'referenceTblId',
        bind: 'referenceMainTable.objectTblId',
      },
      {
        type: 'string',
        name: 'referenceFields',
        label: labelTooltipRender(
          intl.get('srdm.config-object.model.referenceFields').d('关联字段'),
          intl.get('srdm.config-object.help.referenceFields').d('多个字段用 , 隔开')
        ),
        required: true,
      },
      {
        type: 'number',
        name: 'enabledFlag',
        label: intl.get('hpdm.config-object-field.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        required: true,
        defaultValue: 1,
      },
      {
        type: 'string',
        name: 'objectTblId',
        // required: true,
      },
      {
        type: 'number',
        name: 'tenantId',
        // required: true,
      },
    ],
    queryFields: [
      {
        type: 'string',
        name: 'fields',
        label: intl.get('hpdm.config-object-field.model.objectFldName').d('字段名称'),
      },
      {
        type: 'string',
        name: 'referenceFields',
        label: intl.get('hpdm.config-object-field.model.referenceFields').d('关联字段'),
      },
      {
        type: 'number',
        name: 'enabledFlag',
        label: intl.get('hpdm.config-object-field.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
    ],
    autoQuery: true,
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/config-object-tbl-refs?objectTblId=${objectTblId}`
          : `${HZERO_SRDM}/v1/config-object-tbl-refs?objectTblId=${objectTblId}`;
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
            ? `${HZERO_SRDM}/v1/${organizationId}/config-object-tbl-refs/createAndUpdate`
            : `${HZERO_SRDM}/v1/config-object-tbl-refs/createAndUpdate`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/config-object-tbl-refs`
            : `${HZERO_SRDM}/v1/config-object-tbl-refs`,
          method: 'DELETE',
        };
      },
    },
    events: {},
  };
}

export default getConfigObjectContactDS;
