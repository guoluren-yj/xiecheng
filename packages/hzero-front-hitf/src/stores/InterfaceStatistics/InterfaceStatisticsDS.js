import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/interfaceStatisticsLang';
import { SOURCE, TENANT } from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    autoQuery: true,
    autoCreate: false,
    selection: false,
    queryFields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
        format: 'uppercase',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
    ],
    fields: [
      {
        name: 'tenantName',
        label: getLang('BELONG_TENANT'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
      {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
      {
        name: 'count',
        label: getLang('COUNT'),
        type: 'number',
      },
      {
        name: 'statisticsDetail',
        label: getLang('LATEST_STATISTIC_DETAIL'),
        type: 'string',
      },
      {
        name: 'latestTime',
        label: getLang('LATEST_TIME'),
        type: 'dateTime',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/statistics/health-check`,
          method: 'GET',
          data: {
            ...data,
            ...params,
          },
        };
      },
    },
  };
};

const historyStatisticTableDS = (props) => {
  const { initialQueryParameter } = props;
  return {
    queryParameter: initialQueryParameter,
    autoQuery: true,
    autoCreate: false,
    selection: false,
    queryFields: [
      {
        name: 'startTime',
        label: getLang('START_TIME'),
        type: 'dateTime',
        max: 'endTime',
      },
      {
        name: 'endTime',
        label: getLang('END_TIME'),
        type: 'dateTime',
        min: 'startTime',
      },
    ],
    fields: [
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'count',
        label: getLang('COUNT'),
        type: 'number',
      },
      {
        name: 'statisticsDetail',
        label: getLang('STATISTIC_DETAIL'),
        type: 'string',
      },
      {
        name: 'statisticsTime',
        label: getLang('STATISTIC_TIME'),
        type: 'dateTime',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/statistics/all-health-check`,
          method: 'GET',
          data: {
            ...data,
            ...params,
          },
        };
      },
    },
  };
};

export { tableDS, historyStatisticTableDS };
