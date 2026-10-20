import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const listDS = () => ({
  pageSize: 10,
  autoLocateFirst: false,
  cacheSelection: true,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'skillAction',
      label: intl.get('smbl.purchaseRobotConfig.model.operator').d('操作'),
    },
    {
      name: 'skillStatus', // NEW ONLINE OFFLINE
      label: intl.get('smbl.purchaseRobotConfig.model.status').d('状态'),
    },
    {
      name: 'skillName',
      type: 'string',
      label: intl.get('smbl.purchaseRobotConfig.model.skillName').d('技能名称'),
    },
    {
      name: 'skill',
      label: intl.get('smbl.purchaseRobotConfig.model.skill').d('技能'),
    },
    {
      name: 'skillCode',
      label: intl.get('smbl.purchaseRobotConfig.model.skillCode').d('技能编码'),
      type: 'string',
    },
    {
      name: 'skillObjectMeaning',
      label: intl.get('smbl.purchaseRobotConfig.model.skillObject').d('技能对象'),
    },
    {
      name: 'skillTypeMeaning',
      label: intl.get('smbl.purchaseRobotConfig.model.skillType').d('技能类型'),
    },
    {
      name: 'remark',
      label: intl.get('smbl.purchaseRobotConfig.model.skillRemark').d('技能说明'),
    },
    {
      name: 'tenantId',
      label: intl.get('smbl.purchaseRobotConfig.model.skillSource').d('数据来源'),
    },
    {
      name: 'lastUpdatedName',
      label: intl.get('smbl.purchaseRobotConfig.model.lastUpdateName').d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      label: intl.get('smbl.purchaseRobotConfig.model.skillLastUpdateDate').d('更新时间'),
    },
    {
      name: 'lastUpdate',
      type: 'object',
      label: intl.get('smbl.purchaseRobotConfig.model.lastUpdatedBy').d('最后更新'),
    },
  ],
  transport: {
    read: ({ data }) => {
      let fromDate;
      let toDate;
      if (data.lastUpdateTime_range) {
        const dateAry = data.lastUpdateTime_range.split(',');
        if (dateAry.length === 2) {
          fromDate = dateAry[0].length ? dateAry[0] : undefined;
          toDate = dateAry[1].length ? dateAry[1] : undefined;
        }
      }
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/skill/list`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          lastUpdateTime_range: undefined,
          fromDate,
          toDate,
        }),
      };
    },
  },
});

export default listDS;
