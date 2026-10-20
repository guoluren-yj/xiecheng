import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function cardMappingDS() {
  return {
    primaryKey: 'cardId',
    autoQuery: true,
    selection: false,
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'tenantId',
        type: 'string',
        required: true,
        label: intl.get('smbl.wechatTweet.model.mapping.tenantId').d('租户id'),
        defaultValue: organizationId,
      },
      {
        name: 'tenantName',
        type: 'string',
        disabled: true,
        label: intl.get('smbl.wechatTweet.model.mapping.tenantName').d('租户'),
      },

      {
        label: intl.get('smbl.wechatTweet.model.templateCode').d('模板编码'),
        type: 'string',
        name: 'templateCode',
      },
      {
        label: intl.get('smbl.wechatTweet.model.mapping.title').d('模版标题'),
        type: 'string',
        name: 'templateName',
      },
      {
        label: intl.get('smbl.wechatTweet.model.mapping.wechatNum').d('关联公众号'),
        type: 'string',
        name: 'thirdPartyAccountDesc',
      },

      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用标识'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'templateCode',
        type: 'string',
        label: intl.get('smbl.wechatTweet.model.templateCode').d('模板编码'),
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get('smbl.wechatTweet.model.mapping.title').d('模版标题'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${organizationId}/wechat-templates/list`,
        method: 'get',
      },
      destroy: ({ data }) => {
        return {
          data: data[0],
          url: `${SRM_SMBL}/v1/${organizationId}/wechat-templates/delete`,
          method: 'post',
          autoQuery: true,
        };
      },
    },
  };
}

const formDs = (templateId) => ({
  autoQuery: !['create', 'copy'].includes(templateId),
  paging: false,
  fields: [
    {
      name: 'mediaUrl',
      type: 'string',
      label: intl.get('smbl.wechatTweet.model.mapping.cardLogo').d('卡片logo'),
    },
    {
      name: 'mediaId',
      type: 'string',
    },
    // {
    //   label: intl.get('small.common.view.tenant').d('租户'),
    //   name: 'orgatization',
    //   type: 'object',
    //   lovCode: 'HPFM.TENANT',
    //   ignore: 'always',
    // },
    {
      label: intl.get('smbl.wechatTweet.model.templateCode').d('模板编码'),
      type: 'string',
      required: true,
      name: 'templateCode',
      validator: (value, name, record) => {
        if (value && /^[\u4e00-\u9fa5]+$/.test(value)) {
          record.set(name, '');
          return undefined;
        }
      },
    },
    {
      label: intl.get('smbl.wechatTweet.model.mapping.title').d('模版标题'),
      type: 'string',
      name: 'templateName',
      required: true,
    },
    {
      label: intl.get('smbl.wechatTweet.model.mapping.remark').d('备注'),
      type: 'string',
      name: 'remark',
      required: true,
    },
    {
      label: intl.get('smbl.wechatTweet.model.mapping.enabledFlag').d('启动标识'),
      type: 'boolean',
      name: 'enabledFlag',
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('smbl.wechatTweet.model.mapping.wechatNum').d('关联公众号'),
      type: 'object',
      name: 'thirdPartyAccount',
      lovCode: 'SMBL.WECHAT_PLATFORM_ACCOUNT',
      lovPara: { tenantId: 0 },
      textField: 'thirdPartyAccountDesc',
      valueField: 'thirdPartyAccountId',
    },
    {
      name: 'thirdPartyAccountDesc',
      bind: 'thirdPartyAccount.thirdPartyAccountDesc',
    },
    {
      name: 'thirdPartyAccountId',
      bind: 'thirdPartyAccount.thirdPartyAccountId',
    },
    {
      type: 'string',
      name: 'content',
      required: true,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/wechat-templates/${templateId}`,
        method: 'get',
        transformResponse: (data) => {
          return [JSON.parse(data)];
        },
      };
    },
    create: ({ data }) => {
      return {
        data: data[0],
        url: `${SRM_SMBL}/v1/${organizationId}/wechat-templates/create`,
        method: 'post',
        autoQuery: true,
      };
    },
    update: ({ data }) => {
      return {
        data: data[0],
        url: `${SRM_SMBL}/v1/${organizationId}/card/mappings/update`,
        method: 'post',
        autoQuery: true,
      };
    },
  },
});
export { cardMappingDS, formDs };
