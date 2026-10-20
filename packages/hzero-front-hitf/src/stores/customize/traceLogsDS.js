import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/cardLang';
import moment from 'moment';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const FormDS = (props) => {
  const { onFieldUpdate } = props;
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'tenantLov',
        lovCode: 'HPFM.TENANT',
        type: 'object',
        label: getLang('TENANT'),
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'number',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'timeRange',
        type: 'dateTime',
        label: getLang('TIME'),
        range: ['startDate', 'endDate'],
        defaultValue: {
          startDate: moment().startOf('month'),
          endDate: moment(),
        },
      },
    ],
    events: {
      update: onFieldUpdate,
    },
  };
};

const BusinessFailRankingDS = (props) => {
  const { onLoad } = props;
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'interfaceCode',
        type: 'string',
      },
      {
        name: 'interfaceName',
        type: 'string',
      },
      {
        name: 'errorCount',
        type: 'number',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/trace-logs/business/fail/ranking`,
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

const ResponseFailRankingDS = (props) => {
  const { onLoad } = props;
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'interfaceCode',
        type: 'string',
      },
      {
        name: 'interfaceName',
        type: 'string',
      },
      {
        name: 'errorCount',
        type: 'number',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/trace-logs/response/fail/ranking`,
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

export { FormDS, BusinessFailRankingDS, ResponseFailRankingDS };
