/**
 * tableDefinitionDs
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_ADAPTOR } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const currentOrganizationId = getCurrentOrganizationId();

function getRelTableDefinitionDs() {
  return {
    autoQuery: true,
    cacheSelection: true,
    primaryKey: 'id',
    selection: 'multiple',
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
        name: 'description',
        type: 'string',
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.description').d('描述'),
      },
      {
        name: 'mappingJson',
        type: 'string',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.mappingJson')
          .d('表定义JSON数据'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    queryFields: [
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
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/${currentOrganizationId}/rel-table-definitions`,
        method: 'GET',
      },
    },
  };
}

export default getRelTableDefinitionDs;
