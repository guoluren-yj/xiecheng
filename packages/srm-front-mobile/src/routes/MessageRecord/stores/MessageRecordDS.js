import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

const MESSAGE_RECORD_API = `/smbl/v1/${getCurrentOrganizationId()}/message-record`;

export default intl => ({
  transport: {
    read: config => {
      const url = `${MESSAGE_RECORD_API}`;
      return {
        ...config,
        url,
        method: 'GET',
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${MESSAGE_RECORD_API}`,
        data,
        params,
        method: 'DELETE',
      };
    },
  },
  pageSize: 10,
  selection: false,
  primaryKey: 'messageRecordId',
  fields: [
    {
      name: 'messageRecord',
      label: intl.get('smbl.messageRecord.model.messageRecord.name').d('消息发送记录'),
      type: 'object',
      ignore: 'always',
      required: true,
    },
    {
      name: 'messageRecordId',
      label: intl.get('smbl.messageRecord.model.messageRecord.id').d('发送记录ID'),
      type: 'string',
    },
    {
      name: 'tenantId',
      label: intl.get('smbl.messageRecord.model.messageRecord.tenantId').d('租户id'),
      type: 'string',
    },
    {
      name: 'messageId',
      label: intl.get('smbl.messageRecord.model.messageRecord.messageId').d('消息id'),
      type: 'string',
    },
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
      name: 'receiver',
      label: intl.get('smbl.messageRecord.model.messageRecord.receiver').d('接收人'),
      type: 'string',
      readOnly: true,
    },
    {
      name: 'messageTitle',
      label: intl.get('smbl.messageRecord.model.messageRecord.messageTitle').d('消息标题'),
      type: 'string',
      readOnly: true,
    },
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
    {
      name: 'messageContent',
      label: intl.get('smbl.messageRecord.model.messageRecord.messageContent').d('消息内容'),
      type: 'string',
      readOnly: true,
    },
    {
      name: 'responseBody',
      label: intl.get('smbl.messageRecord.model.messageRecord.responseBody').d('响应body'),
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
      name: 'requestDate',
      label: intl.get('smbl.messageRecord.model.messageRecord.requestDate').d('请求时间'),
      ignore: 'always',
      required: true,
      type: 'dateTime',
      range: ['requestDateFrom', 'requestDateTo'],
    },
    {
      name: 'messageTitle',
      label: intl.get('smbl.messageRecord.model.messageRecord.messageTitle').d('消息标题'),
      type: 'string',
    },
    {
      name: 'receiver',
      label: intl.get('smbl.messageRecord.model.messageRecord.receiver').d('接收人'),
      type: 'string',
    },
    {
      name: 'thirdParty',
      type: 'object',
      label: intl.get('smbl.messageRecord.model.messageRecord.thirdPartyName').d('三方平台名称'),
      lovCode: 'SMBL.THIRD_PARTY.VIEW',
      ignore: 'always',
    },
    {
      name: 'thirdPartyId',
      bind: 'thirdParty.thirdPartyId',
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
      name: 'thirdPartyAccId',
      bind: 'thirdPartyAc.thirdPartyAccountId',
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
      name: 'successFlag',
      label: intl.get('smbl.messageRecord.model.messageRecord.successFlag').d('是否成功'),
      type: 'string',
      lookupCode: 'SMBL.TODO_RESEND_FLAG',
    },
  ],
});
