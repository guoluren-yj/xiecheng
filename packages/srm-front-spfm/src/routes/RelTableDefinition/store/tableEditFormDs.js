/**
 * tableEditFormDs
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';

function tableEditFormDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'tableCode',
        type: 'string',
        required: true,
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.tableCode')
          .d('配置表编码'),
      },
      {
        name: 'tableName',
        type: 'intl',
        required: true,
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.tableName').d('配置表名'),
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.description').d('描述'),
      },
      {
        name: 'tenant',
        type: 'object',
        label: intl.get('entity.tenant.tag').d('租户'),
        lovCode: 'HPFM.TENANT',
        ignore: 'always',
        computedProps: {
          required: ({ record }) => record.get('permission') === '2',
        },
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenant.tenantId',
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'tenant.tenantName',
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
        computedProps: {
          disabled: ({ record }) =>
            record.get('permission') !== '1' && record.get('permission') !== '2',
        },
      },
      {
        name: 'saveHistory',
        type: 'boolean',
        defaultValue: false,
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.saveHistory')
          .d('历史记录'),
      },
      {
        name: 'supplierIsolation',
        type: 'boolean',
        defaultValue: false,
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.supplierIsolation')
          .d('供应商隔离'),
        computedProps: {
          disabled: ({ record }) => record.get('permission') !== '2',
        },
      },
      {
        name: 'dataSource',
        type: 'string',
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.datasource').d('数据源'),
        lookupCode: 'SPFM.REL_TABLE_DEFINITION.DATASOURCE',
        required: true,
        computedProps: {
          disabled: ({ record }) => record.get('permission') === '2',
        },
      },
      // {
      //   name: 'mappingJson',
      //   type: 'string',
      //   label: intl
      //     .get('spfm.relTableDefinition.model.relTableDefinition.mappingJson')
      //     .d('表定义JSON数据'),
      // },
      {
        name: 'permission',
        type: 'string',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.permission')
          .d('权限控制'),
        lookupCode: 'SPFM.REL_TABLE_DEFINITION.PERMISSION',
        required: true,
      },
      {
        name: 'module',
        type: 'string',
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.module').d('所属模块'),
        lookupCode: 'SADA.MODULE',
        required: true,
      },
      // {
      //   name: 'platformOnly',
      //   type: 'boolean',
      //   label: intl
      //     .get('spfm.relTableDefinition.model.relTableDefinition.platformOnly')
      //     .d('是否仅平台可见'),
      // },
      {
        name: 'syncMultiCloudFlag',
        type: 'boolean',
        defaultValue: false,
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.syncMultiCloudFlag')
          .d('同步表数据至多云环境'),
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'permission') {
          record.set('supplierIsolation', false);
          record.set('noCreation', false);
          if (value === '2') {
            record.set('dataSource', 'tenant');
          } else {
            record.set('dataSource', 'default');
          }
        }
        // if (name === 'tenant' && value && value.tenantId !== 0) {
        //   record.set('platformOnly', false);
        // }
      },
    },
  };
}

export default tableEditFormDs;
