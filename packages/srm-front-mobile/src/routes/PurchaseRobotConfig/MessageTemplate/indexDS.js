import intl from 'utils/intl';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const listDS = () => ({
  pageSize: 10,
  primaryKey: 'messageList',
  autoLocateFirst: false,
  cacheSelection: true,
  selection: false,
  fields: [
    {
      name: 'prStatusCode',
      label: intl.get('smbl.purchaseRobotConfig.model.operator').d('操作'),
    },
    {
      name: 'displayPrNum',
      label: intl.get('smbl.purchaseRobotConfig.model.messageTemplate').d('消息模板'),
    },
    {
      name: 'templateName',
      label: intl.get('smbl.purchaseRobotConfig.model.templateName').d('消息模板名称'),
    },
    {
      name: 'templateCode',
      label: intl.get('smbl.purchaseRobotConfig.model.templateCode').d('消息模板编码'),
    },
    {
      name: 'remark',
      label: intl.get('smbl.purchaseRobotConfig.model.remark').d('消息模板说明'),
    },
    // {
    //   name: 'tenantName',
    //   label: intl.get('smbl.purchaseRobotConfig.model.tenantName').d('所属租户'),
    // },
    {
      name: 'tenantId',
      label: intl.get('smbl.purchaseRobotConfig.model.skillSource').d('数据来源'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('smbl.purchaseRobotConfig.model.enabledFlag').d('是否启用'),
    },
    {
      name: 'lastUpdatedBy',
      label: intl.get('smbl.purchaseRobotConfig.model.lastUpdatedBy').d('最后更新'),
    },
    {
      name: 'realName',
      label: intl.get('smbl.purchaseRobotConfig.model.realName').d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      label: intl.get('smbl.purchaseRobotConfig.model.lastUpdateDate').d('更新时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      let lastUpdateDateStart;
      let lastUpdateDateEnd;
      if (data.lastUpdateDate_range) {
        const dateAry = data.lastUpdateDate_range.split(',');
        if (dateAry.length === 2) {
          lastUpdateDateStart = dateAry[0].length ? dateAry[0] : undefined;
          lastUpdateDateEnd = dateAry[1].length ? dateAry[1] : undefined;
        }
      }
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          lastUpdateDate_range: undefined,
          lastUpdateDateStart,
          lastUpdateDateEnd,
        }),
      };
    },
  },
});

export default listDS;
