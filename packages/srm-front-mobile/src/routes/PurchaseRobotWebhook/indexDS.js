import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

export const listDS = () => ({
  pageSize: 10,
  autoLocateFirst: false,
  cacheSelection: true,
  selection: false,
  autoQuery: true,
  fields: [
    {
      name: 'groupsName',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.groupsName').d('群名称'),
      required: true,
    },
    {
      name: 'robotName',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.robotName').d('机器人名称'),
      required: true,
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
    {
      name: 'unitIdsStr',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.unitsIds').d('部门'),
      lovCode: 'HPFM.UNIT.DEPARTMENT_TENANT',
      multiple: true,
      valueField: 'unitId',
      // required: true,
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
      required: true,
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierTenant.supplierCompanyId',
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
    {
      name: 'creationDate',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.creationDate').d('创建时间'),
    },
    {
      name: 'createdByName',
      label: intl.get('smbl.purchaseRobotWebhook.model.groupRobot.createdBy').d('创建人'),
    },
    {
      name: 'actions',
      label: intl.get('smbl.purchaseRobotWebhook.button.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SMBL}/v1/webhook/robot/${organizationId}/list`,
      method: 'GET',
    },
  },
});
