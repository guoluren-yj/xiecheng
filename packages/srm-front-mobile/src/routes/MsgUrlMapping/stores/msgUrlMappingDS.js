import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 模板类型
export const TemplateType = {
  MESSAGE: '0', // 消息
  TODO: '1', // 待办
};

function msgUrlMappingDS(type) {
  return {
    primaryKey: 'urlMappingId',
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
        label: intl.get('smbl.msgUrlMapping.model.mapping.tenantId').d('租户id'),
        defaultValue: organizationId,
      },
      {
        name: 'tenantName',
        type: 'string',
        disabled: true,
        label: intl.get('smbl.msgUrlMapping.model.mapping.tenantName').d('租户'),
      },
      {
        name: 'templateCode',
        type: 'intl',
        required: true,
        label: intl.get('smbl.msgUrlMapping.model.mapping.templateCode').d('模板编码'),
        bind: 'messageTemplate.templateCode',
      },
      {
        name: 'channel',
        label: intl.get('smbl.msgUrlMapping.model.mapping.channelId').d('推送频道'),
        type: 'object',
        required: type === 'TODO' ? 0 : 1, // 待办类型时，频道为非必输
        lovCode: 'SMBL.MESSAGE_CHANNEL.VIEW',
        ignore: 'always',
      },
      {
        name: 'channelId',
        type: 'string',
        required: type === 'TODO' ? 0 : 1, // 待办类型时，频道为非必输
        label: intl.get('smbl.msgUrlMapping.model.mapping.channelId').d('推送频道id'),
        bind: 'channel.channelId',
        defaultValue: type === 'TODO' ? '-1' : '', // 待办类型时，频道为非必输，默认频道id为 -1
      },
      {
        name: 'channelName',
        type: 'string',
        required: type === 'TODO' ? 0 : 1, // 待办类型时，频道为非必输
        label: intl.get('smbl.msgUrlMapping.model.mapping.channelName').d('推送频道'),
        bind: 'channel.channelName',
      },
      {
        name: 'urlTemplate',
        type: 'string',
        required: true,
        label: intl.get('smbl.msgUrlMapping.model.mapping.urlTemplate').d('跳转地址模板'),
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
        label: intl.get('smbl.msgUrlMapping.model.mapping.templateCode').d('模板编码'),
      },
      {
        name: 'urlTemplate',
        type: 'string',
        label: intl.get('smbl.msgUrlMapping.model.mapping.urlTemplate').d('跳转地址模板'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${organizationId}/msg-url-mapping?templateType=${TemplateType[type]}`,
        method: 'get',
      },
      create: {
        url: `${SRM_SMBL}/v1/${organizationId}/msg-url-mapping`,
        method: 'post',
        autoQuery: true,
      },
      update: {
        url: `${SRM_SMBL}/v1/${organizationId}/msg-url-mapping`,
        method: 'put',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/${organizationId}/msg-url-mapping`,
        method: 'delete',
      },
    },
  };
}
export { msgUrlMappingDS };
