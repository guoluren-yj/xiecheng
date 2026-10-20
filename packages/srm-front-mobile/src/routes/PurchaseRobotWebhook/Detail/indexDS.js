import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const detailDS = (webhookRobotId) => ({
  pageSize: 10,
  autoLocateFirst: true,
  cacheSelection: false,
  selection: false,
  primaryKey: 'webhookList',
  autoQuery: !!webhookRobotId,
  fields: [
    {
      name: 'groupsName',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.groupsName').d('群名称'),
      required: true,
      type: 'intl',
    },
    {
      name: 'robotName',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.robotName').d('机器人名称'),
      required: true,
      type: 'intl',
    },
    {
      name: 'platform',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.platformCode').d('三方平台'),
      type: 'object',
      lovCode: 'SMBL.THIRD_PARTY.VIEW',
      required: true,
    },
    {
      name: 'platformCode',
      bind: 'platform.thirdPartyCode',
    },
    {
      name: 'platformCodeDesc',
      bind: 'platform.thirdPartyDesc',
    },
    {
      name: 'webhookUrl',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.webhookUrl').d('推送地址'),
      required: true,
    },
    {
      name: 'camp',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.camp').d('推送租户类型'),
      lookupCode: 'SMBL.WEBHOOK_CAMP',
      type: 'string',
      required: true,
    },
    // {
    //   name: 'camp',
    //   bind: 'campObject.value',
    // },
    // {
    //   name: 'campName',
    //   bind: 'campObject.meaning',
    // },
    {
      name: 'unitsMean',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.unitsIds').d('部门'),
      lovCode: 'HPFM.UNIT.DEPARTMENT_TENANT',
      multiple: true,
      // valueField: 'unitId',
      // textField: 'unitName',
      type: 'object',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('camp') === 'PURCHASER';
        },
        disabled: ({ record }) => {
          return record.get('camp') !== 'PURCHASER';
        },
      },
    },
    // {
    //   name: 'unitsIds',
    //   bind: 'units.unitCode',
    // },
    // {
    //   name: 'unitsNames',
    //   bind: 'units.unitName',
    // },
    {
      name: 'supplierTenant',
      type: 'object',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.supplierTenantId').d('供应商'),
      lovCode: 'SSLM.SUPPLIERS',
      textField: 'supplierCompanyName',
      lovPara: { tenantId: organizationId },
      visible: true,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('camp') === 'SUPPLIER';
        },
        disabled: ({ record }) => {
          return record.get('camp') !== 'SUPPLIER';
        },
      },
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierTenant.supplierTenantId',
    },
    {
      name: 'supplierTenantName',
      bind: 'supplierTenant.supplierCompanyName',
    },
    {
      name: 'requestType',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.requestType').d('推送方式'),
      disabled: true,
    },
    {
      name: 'robotType',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.robotType').d('机器人消息类型'),
      disabled: true,
    },
    {
      name: 'requestMethod',
      type: 'string',
      label: intl
        .get('smbl.purchaseRobotWebhook.model.groupRobot.requestMethod')
        .d('机器人消息类型'),
      lookupCode: 'SMBL.HTTP_METHOD',
      required: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.enabledFlag').d('启用'),
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: {
      url: `${SRM_SMBL}/v1/webhook/robot/${organizationId}/detail/${webhookRobotId}`,
      method: 'GET',
    },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/webhook/robot/${organizationId}/save`,
        method: 'POST',
        data: data[0],
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/webhook/robot/${organizationId}/update`,
        method: 'POST',
        data: data[0],
      };
    },
  },
});

const messageTemplateLineDS = (webhookRobotId) => ({
  pageSize: 10,
  autoLocateFirst: true,
  cacheSelection: true,
  selection: 'multiple',
  autoQuery: true,
  fields: [
    {
      name: 'template',
      label: intl.get('smbl.purchaseRobotWebhook.model.template.templateCode').d('模板编码'),
      type: 'object',
      lovCode: 'HMSG.MESSAGE_TEMPLATE.WITH_TENANT',
      required: true,
    },
    {
      name: 'templateCode',
      bind: 'template.templateCode',
    },
    {
      name: 'templateId',
      bind: 'template.templateId',
    },
    {
      name: 'templateName',
      bind: 'template.templateName',
      label: intl.get('smbl.purchaseRobotWebhook.model.template.templateName').d('模板名称'),
    },
    {
      name: 'templateTitle',
      label: intl.get('smbl.purchaseRobotWebhook.model.template.templateTitle').d('模板标题'),
    },
    {
      name: 'templateContent',
      label: intl.get('smbl.purchaseRobotWebhook.model.template.templateContent').d('模板内容'),
    },
    {
      name: 'templateSourceId',
      label: intl.get('smbl.purchaseRobotWebhook.model.template.templateSource').d('来源'),
    },
    {
      name: 'action',
      label: intl.get('smbl.purchaseRobotWebhook.model.template.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SMBL}/v1/${organizationId}/webhook/robot/message-template/list/${webhookRobotId}`,
      method: 'GET',
    },
    create: {
      url: `${SRM_SMBL}/v1/${organizationId}/webhook/robot/message-template/save`,
      method: 'POST',
    },
    update: {
      url: `${SRM_SMBL}/v1/${organizationId}/webhook/robot/message-template/update`,
      method: 'POST',
    },
    destroy: {
      url: `${SRM_SMBL}/v1/${organizationId}/webhook/robot/message-template/delete`,
      method: 'POST',
    },
  },
});

const batchSelectTemplate = () => ({
  autoCreate: true,
  autoLocateFirst: true,
  data: [{ s: 'new' }],
  fields: [
    {
      name: 'template',
      // label: intl.get('smbl.purchaseRobotWebhook.model.template.templateCode').d('模板编码'),
      type: 'object',
      lovCode: 'HMSG.MESSAGE_TEMPLATE.WITH_TENANT',
      // required: true,
      multiple: true,
    },
  ],
});

export { detailDS, messageTemplateLineDS, batchSelectTemplate };
