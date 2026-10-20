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
        name: 'supplierIsolation',
        type: 'boolean',
        defaultValue: false,
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.supplierIsolation')
          .d('供应商隔离'),
      },
      {
        name: 'module',
        type: 'string',
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.module').d('所属模块'),
        lookupCode: 'SADA.MODULE',
        required: true,
      },
    ],
  };
}

export default tableEditFormDs;
