/**
 * tenantDS.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';

export default function postWhereDS() {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'tableNameObj',
        type: 'object',
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.conditionTable').d('数据过滤表'),
        lovCode: 'HPFM.TO_DEFINE.IN_TABLE',
      },
      {
        name: 'tableName',
        type: 'string',
        required: true,
        bind: 'tableNameObj.tableName',
      },
      {
        name: 'condition',
        label: intl.get('spfm.docTransferDefin.model.view.limitCondition').d('限制逻辑'),
        type: 'string',
        required: true,
      },
    ],
    cacheSelection: true,
  };
}
