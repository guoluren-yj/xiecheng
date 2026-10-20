import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const MESSAGE_CHANNEL_API = `/smbl/v1/${getCurrentOrganizationId()}/message-channel`;

export default () => ({
  transport: {
    read: (config) => {
      const url = `${MESSAGE_CHANNEL_API}/manage`;
      return {
        ...config,
        url,
        method: 'GET',
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${MESSAGE_CHANNEL_API}`,
        data,
        params,
        method: 'DELETE',
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${MESSAGE_CHANNEL_API}/save`,
        data,
        params,
        method: 'PUT',
      };
    },
  },
  pageSize: 10,
  selection: 'multiple',
  primaryKey: 'channelId',
  fields: [
    {
      name: 'messageChannel',
      label: intl.get('smbl.messageChannel.model.messageChannel.name').d('消息频道'),
      type: 'object',
      ignore: 'always',
    },
    {
      name: 'channelId',
      label: intl.get('smbl.messageChannel.model.messageChannel.id').d('消息频道ID'),
      type: 'string',
    },
    {
      name: 'tenantId',
      label: intl.get('smbl.messageChannel.model.messageChannel.tenantId').d('租户id'),
      type: 'string',
    },
    {
      name: 'channelCode',
      label: intl.get('smbl.messageChannel.model.messageChannel.code').d('频道代码'),
      type: 'string',
      lookupCode: 'SMBL.MESSAGE_CHANNEL.CODE',
      required: true,
    },
    {
      name: 'channelName',
      label: intl.get('smbl.messageChannel.model.messageChannel.channelName').d('频道名称'),
      type: 'intl',
      required: true,
      bind: 'messageChannel.channelName',
    },
    {
      name: 'channelDesc',
      label: intl.get('smbl.messageChannel.model.messageChannel.channelDesc').d('频道描述'),
      type: 'string',
    },
    {
      name: 'channelIcon',
      label: intl.get('smbl.messageChannel.model.messageChannel.channelIcon').d('频道图标'),
      type: 'string',
      required: true,
    },
    // {
    //  name: 'sequence',
    //  label: intl.get('smbl.subApplicationGp.sequence').d('排序号'),
    //  type: 'string',
    //  required: true,
    // },
    {
      name: 'mustSubscribeFlag',
      label: intl
        .get('smbl.messageChannel.model.messageChannel.mustSubscribeFlag')
        .d('是否强制订阅'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '1',
      required: true,
    },
    {
      name: 'enabledFlag',
      label: intl.get('smbl.messageChannel.model.messageChannel.enabledFlag').d('是否启用'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '1',
      required: true,
    },
  ],
  queryFields: [
    {
      name: 'channelName',
      label: intl.get('smbl.messageChannel.model.messageChannel.name').d('频道名称'),
      type: 'string',
    },
    {
      name: 'channelCode',
      label: intl.get('smbl.messageChannel.model.messageChannel.code').d('频道编码'),
      type: 'string',
    },
  ],
});
