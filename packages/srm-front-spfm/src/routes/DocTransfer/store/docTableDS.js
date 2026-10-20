/**
 * docTableDS.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';

export default function () {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'docName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.docName').d('单据'),
      },
      {
        name: 'docCode',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.docCode').d('更改字段'),
      },
      {
        name: 'updateField',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.updateField').d('更改字段'),
      },
      {
        name: 'docCount',
        type: 'number',
        label: intl.get('spfm.docTransfer.model.view.deliverCount').d('单据数量'),
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.action').d('操作'),
      },
      // {
      //   name: 'subObject',
      //   type: 'object',
      //   label: intl.get('spfm.docTransfer.model.view.subObject').d('转交人'),
      //   required: true,
      //   ignore: true,
      //   lovCode: 'HIAM.USER_ACCOUNT',
      //   lovPara: { tenantId: getCurrentOrganizationId() },
      //   noCache: true,
      //   // transformRequest: (value) => value && value.id,
      // },
      // {
      //   name: 'deliverToId',
      //   required: true,
      //   bind: 'subObject.id',
      // },
      // {
      //   name: 'deliverTo',
      //   required: true,
      //   bind: 'subObject.loginName',
      // },
      {
        name: 'deliverFrom',
      },
      {
        name: 'deliverFromId',
      },
      {
        name: 'nowTime',
        label: intl.get('spfm.docTransfer.model.view.nowTime').d('最后更新时间'),
      },
    ],
    queryFields: [
      {
        name: 'docName',
        type: 'string',
        width: 200,
        label: intl.get('spfm.docTransfer.model.view.docName').d('单据'),
      },
    ],
  };
}
