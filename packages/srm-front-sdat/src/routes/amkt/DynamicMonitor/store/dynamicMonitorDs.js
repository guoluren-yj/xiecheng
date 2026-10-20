/**
 * 动态监控管理 租户级
 * @date: 2022-09-17
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 风险等级 DS
 * @returns
 */
const stuffRiskLevelDS = () => ({
  transport: {
    read: ({ data, params }) => {
      if (data?.reset) {
        return {
          url: `${SRM_DATA_SDAT}/v1/${tenantId}/event-level-define/default-level`,
          params: {
            ...data,
            ...params,
            ...passParams,
          },
          method: 'GET',
        };
      }
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/event-level-define/level-info`,
        params: {
          ...data,
          ...params,
          ...passParams,
        },
        method: 'GET',
      };
    },
    submit: ({ data, params }) => {
      const postData = data?.map((item) => {
        return { ...item, ...passParams };
      });
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/event-level-define/save-level`,
        data: {
          defineList: postData,
          ...params,
          ...passParams,
        },
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'stuffRiskLevel',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.dynamicMonitor.model.ruleDesc').d('条件规则'),
      name: 'ruleDesc',
      type: 'string',
    },
    {
      name: 'arrow',
      type: 'string',
    },
    {
      label: intl.get('sdat.dynamicMonitor.model.eventLevel').d('事件风险等级'),
      name: 'eventLevel',
      type: 'string',
      lookupCode: 'SDAT.RISK_EVENT_LEVEL',
    },
  ],
  queryFields: [],
  events: {},
});

export { stuffRiskLevelDS };
