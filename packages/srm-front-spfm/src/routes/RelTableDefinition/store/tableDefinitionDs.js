/**
 * tableDefinitionDs
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';

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
        name: 'tenantName',
        type: 'string',
        label: intl.get('entity.tenant.tag').d('租户'),
      },
      // {
      //   name: 'platformOnly',
      //   type: 'boolean',
      //   label: intl
      //     .get('spfm.relTableDefinition.model.relTableDefinition.platformOnly')
      //     .d('是否仅平台可用'),
      // },
      {
        name: 'noCreation',
        type: 'boolean',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.noCreation')
          .d('租户无法新建行数据'),
      },
      {
        name: 'mappingJson',
        type: 'string',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.mappingJson')
          .d('表定义JSON数据'),
      },
      {
        name: 'permission',
        type: 'string',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.permission')
          .d('权限控制'),
        lookupCode: 'SPFM.REL_TABLE_DEFINITION.PERMISSION',
      },
      {
        name: 'computedProps',
        type: 'string',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.computedProps')
          .d('回调代码'),
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
      {
        name: 'tenantName',
        type: 'object',
        label: intl.get('entity.tenant.tag').d('租户'),
        lovCode: 'HPFM.TENANT',
        valueField: 'tenantId',
        textField: 'tenantName',
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantName.tenantId',
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/rel-table-definitions`,
        method: 'GET',
      },
    },
  };
}

export default getRelTableDefinitionDs;
