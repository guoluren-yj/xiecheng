import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';

import { SRM_SMBL } from '@/utils/config.js';

export default () => {
  const { tenantId, tenantName } = getCurrentTenant();
  return {
    transport: {
      read: config => {
        const url = `${SRM_SMBL}/v1/todo-record`;
        return {
          ...config,
          url,
          method: 'GET',
        };
      },
    },
    pageSize: 10,
    selection: 'multiple',
    primaryKey: 'todoRecordId',
    fields: [
      // {
      //   name: 'messageRecord',
      //   label: intl.get('smbl.messageRecord.model.messageRecord.name').d('消息发送记录'),
      //   type: 'object',
      //   ignore: 'always',
      //   required: true,
      // },
      // {
      //   name: 'messageRecordId',
      //   label: intl.get('smbl.messageRecord.model.messageRecord.id').d('发送记录ID'),
      //   type: 'string',
      // },
      {
        name: 'tenantId',
        label: intl.get('smbl.messageRecord.model.messageRecord.tenantId').d('租户id'),
        type: 'string',
      },
      {
        name: 'tenantName',
        label: intl.get('smbl.messageRecord.model.messageRecord.tenantName').d('租户'),
        type: 'string',
      },
      // {
      //   name: 'messageId',
      //   label: intl.get('smbl.messageRecord.model.messageRecord.messageId').d('消息id'),
      //   type: 'string',
      // },
      {
        name: 'thirdPartyId',
        label: intl.get('smbl.messageRecord.model.messageRecord.thirdPartyId').d('三方平台id'),
        type: 'string',
      },
      {
        name: 'thirdPartyAccId',
        label: intl.get('smbl.messageRecord.model.messageRecord.thirdPartyAccId').d('三方账户id'),
        type: 'string',
      },
      {
        name: 'processInstanceId',
        label: intl.get('smbl.messageRecord.model.messageRecord.processInstanceId').d('流程实例'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'sourceId',
        label: intl.get('smbl.messageRecord.model.messageRecord.sourceId').d('待办唯一标识'),
        type: 'string',
        readOnly: true,
      },

      {
        name: 'receiver',
        label: intl.get('smbl.messageRecord.model.messageRecord.receiver').d('接收人'),
        type: 'string',
        readOnly: true,
      },
      // {
      //   name: 'messageTitle',
      //   label: intl.get('smbl.messageRecord.model.messageRecord.messageTitle').d('消息标题'),
      //   type: 'string',
      //   readOnly: true,
      // },
      {
        name: 'thirdPartyAccount',
        label: intl.get('smbl.messageRecord.model.messageRecord.thirdPartyAccount').d('三方账户'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'thirdPartyName',
        label: intl.get('smbl.messageRecord.model.messageRecord.thirdPartyName').d('三方平台'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'requestDate',
        label: intl.get('smbl.messageRecord.model.messageRecord.requestDate').d('请求时间'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'requestDateFrom',
        label: intl.get('smbl.messageRecord.model.messageRecord.requestDateFrom').d('请求时间从'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'requestDateTo',
        label: intl.get('smbl.messageRecord.model.messageRecord.requestDateTo').d('请求时间至'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'responseDate',
        label: intl.get('smbl.messageRecord.model.messageRecord.responseDate').d('返回时间'),
        type: 'string',
        readOnly: true,
      },
      // {
      //   name: 'messageContent',
      //   label: intl.get('smbl.messageRecord.model.messageRecord.messageContent').d('消息内容'),
      //   type: 'string',
      //   readOnly: true,
      // },
      {
        name: 'responseBody',
        label: intl.get('smbl.messageRecord.model.messageRecord.responseBody').d('响应报文'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'requestBody',
        label: intl.get('smbl.messageRecord.model.messageRecord.requestBody').d('请求报文'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'errorMessage',
        label: intl.get('smbl.messageRecord.model.messageRecord.errorMessage').d('错误消息'),
        type: 'string',
        readOnly: true,
      },
      {
        name: 'successFlag',
        label: intl.get('smbl.messageRecord.model.messageRecord.successFlag').d('是否成功'),
        type: 'string',
        lookupCode: 'SMBL.TODO_RESEND_FLAG',
        readOnly: true,
      },
    ],
    queryFields: [
      {
        name: 'tenant',
        type: 'object',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
        lovCode: 'HPFM.TENANT',
        ignore: 'always',
        required: true,
        defaultValue: { tenantId, tenantName },
      },
      {
        name: 'tenantId',
        bind: 'tenant.tenantId',
      },
      {
        name: 'requestDate',
        label: intl.get('smbl.messageRecord.model.messageRecord.requestDate').d('请求时间'),
        ignore: 'always',
        type: 'dateTime',
        required: true,
        range: ['requestDateFrom', 'requestDateTo'],
      },
      {
        name: 'requestDateFrom',
        type: 'dateTime',
        bind: 'requestDate.requestDateFrom',
        defaultValue: moment()
          .subtract(7, 'days')
          .format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        name: 'requestDateTo',
        type: 'dateTime',
        bind: 'requestDate.requestDateTo',
        defaultValue: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        name: 'processInstanceId',
        label: intl.get('smbl.messageRecord.model.messageRecord.processInstanceId').d('流程实例'),
      },
      {
        name: 'sourceId',
        label: intl.get('smbl.messageRecord.model.messageRecord.sourceId').d('待办唯一标识'),
      },
      {
        name: 'receiver',
        label: intl.get('smbl.messageRecord.model.messageRecord.receiver').d('接收人'),
        type: 'string',
      },
      // {
      //   name: 'messageTitle',
      //   label: intl.get('smbl.messageRecord.model.messageRecord.messageTitle').d('消息标题'),
      //   type: 'string',
      // },
      {
        name: 'thirdParty',
        type: 'object',
        label: intl.get('smbl.messageRecord.model.messageRecord.thirdPartyName').d('三方平台名称'),
        lovCode: 'SMBL.THIRD_PARTY.VIEW',
        ignore: 'always',
      },
      {
        name: 'thirdPartyName',
        bind: 'thirdParty.thirdPartyDesc',
      },

      {
        name: 'thirdPartyAc',
        type: 'object',
        label: intl.get('smbl.messageRecord.model.messageRecord.thirdPartyAccount').d('三方账户'),
        lovCode: 'SMBL.THIRD_PARTY_ACCOUNT',
        lovPara: { tenantId: getCurrentOrganizationId() },
        ignore: 'always',
      },
      {
        name: 'thirdPartyAccount',
        bind: 'thirdPartyAc.thirdPartyAccount',
      },
      {
        name: 'successFlag',
        label: intl.get('smbl.messageRecord.model.messageRecord.successFlag').d('是否成功'),
        type: 'string',
        lookupCode: 'SMBL.TODO_RESEND_FLAG',
      },
    ],
  };
};
