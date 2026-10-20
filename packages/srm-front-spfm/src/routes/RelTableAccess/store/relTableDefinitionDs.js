/**
 * 配置表定义ds
 * relTableDefinitionDs.js
 * @date: 2020-07-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const roleLevel = isTenantRoleLevel();

function getRelTableDefinitionDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'tableCode',
        type: 'string',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.tableCode')
          .d('配置表编码'),
      },
      {
        name: 'tableName',
        type: 'string',
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.tableName').d('配置表名'),
      },
      {
        name: 'permission',
        type: 'string',
        lookupCode: 'SPFM.REL_TABLE_DEFINITION.PERMISSION',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.permission')
          .d('配置表类型'),
      },
    ],
    selection: false,
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_ADAPTOR}/v1${
            roleLevel ? `/${organizationId}` : ''
          }/rel-table-records/null/query-allow-tables`,
          method: 'GET',
          params: {
            ...params,
            organizationId,
            platformOnly: !roleLevel,
          },
        };
      },
    },
  };
}

function getQueryDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'tableCodeOrName',
        type: 'string',
      },
    ],
  };
}

export { getRelTableDefinitionDs, getQueryDs };
