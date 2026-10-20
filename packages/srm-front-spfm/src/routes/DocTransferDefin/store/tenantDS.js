/**
 * tenantDS.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';

export default function () {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'tenantObj',
        type: 'object',
        ignore: true,
        required: true,
        textField: 'tenantNum',
        label: intl.get('spfm.docTransferDefin.model.view.tenantNum').d('租户编码'),
        lovCode: 'HPFM.TENANT',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'tenantObj.tenantNum',
        required: true,
      },
      {
        name: 'tenantName',
        type: 'string',
        required: true,
        bind: 'tenantObj.tenantName',
        label: intl.get('spfm.docTransferDefin.model.view.tenantName').d('租户名称'),
      },
      {
        name: 'tenantId',
        type: 'number',
        bind: 'tenantObj.tenantId',
      },
    ],
    selection: 'multiple',
    cacheSelection: true,
  };
}
