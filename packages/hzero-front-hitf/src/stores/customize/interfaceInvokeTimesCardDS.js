import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/cardLang';
import {
  INVOKE_STATISTICS_FREQUENCY,
  INVOKE_STATISTICS_LEVEL,
  TENANT,
  INVOKE_ABLE_INTERFACE,
  INVOKE_STATISTICS_INDICATOR,
  INVOKE_STATISTICS_TIME_GAP,
} from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const basicInfoDS = () => {
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'statisticsLevel',
        type: 'string',
        label: getLang('STATISTICS_LEVEL'),
        lookupCode: INVOKE_STATISTICS_LEVEL,
      },
      {
        name: 'statisticsType',
        type: 'string',
        label: getLang('STATISTICS_TYPE'),
        lookupCode: INVOKE_STATISTICS_FREQUENCY,
      },
      {
        name: 'timeGap',
        type: 'string',
        lookupCode: INVOKE_STATISTICS_TIME_GAP,
      },
      {
        name: 'statisticsIndicator',
        type: 'string',
        label: getLang('STATISTICS_INDICATOR'),
        lookupCode: INVOKE_STATISTICS_INDICATOR,
      },
    ],
  };
};

const queryFormDS = (props) => {
  const { onFieldUpdate } = props;
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'serviceInterfaceLov',
        type: 'object',
        label: getLang('SERVICE_INTERFACE'),
        ignore: 'always',
        noCache: true,
        lovCode: INVOKE_ABLE_INTERFACE,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: isTenantRoleLevel() ? organizationId : record.get('tenantId'),
            };
          },
        },
      },
      {
        name: 'interfaceCode',
        bind: 'invokeInterfaceLov.interfaceCode',
        type: 'string',
      },
      {
        name: 'tenantLov',
        type: 'object',
        label: getLang('TENANT'),
        lovCode: TENANT,
        ignore: 'always',
        noCache: true,
        valueField: 'tenantId',
        textField: 'tenantName',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'timeRange',
        type: 'dateTime',
        range: ['startTime', 'endTime'],
      },
    ],
    events: {
      update: onFieldUpdate,
    },
  };
};

const formDS = (props) => {
  const { onLoad } = props;
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/invoke-statistics`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
    },
    events: {
      load: onLoad,
    },
  };
};

export { basicInfoDS, queryFormDS, formDS };
