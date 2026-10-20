import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import moment from 'moment';
import QuestionPopover from '@/components/QuestionPopover';
import getLang from '@/langs/interfaceLogLang';
import { INVOKE_TYPE, TENANT, INTERFACE_LOG_CLEAR_TYPE, SOURCE } from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    autoQuery: true,
    pageSize: 10,
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
        name: 'requestTimeStart',
        label: getLang('REQUEST_TIME_START'),
        type: 'dateTime',
        required: true,
        max: 'requestTimeEnd',
        defaultValue: moment({ hour: 0, minute: 0, seconds: 0 }).subtract(1, 'months'),
      },
      {
        name: 'requestTimeEnd',
        label: getLang('REQUEST_TIME_END'),
        type: 'dateTime',
        required: true,
        min: 'requestTimeStart',
        defaultValue: moment({ hour: 23, minute: 59, seconds: 59 }),
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
      {
        name: 'responseStatus',
        label: getLang('RESPONSE_STATUS'),
        type: 'string',
      },
      {
        name: 'clientId',
        label: getLang('CLIENT_ID'),
        type: 'string',
      },
      {
        name: 'invokeType',
        label: getLang('INVOKE_TYPE'),
        type: 'string',
        lovCode: INVOKE_TYPE,
      },
      {
        name: 'invokeKey',
        label: getLang('INVOKE_KEY'),
        type: 'string',
      },
      !isTenantRoleLevel() && {
        name: 'sourceTenantLov',
        label: (
          <QuestionPopover
            text={getLang('INTERFACE_TENANT')}
            message={getLang('INTERFACE_TENANT_TIP')}
          />
        ),
        type: 'object',
        ignore: 'always',
        lovCode: TENANT,
      },
      !isTenantRoleLevel() && {
        name: 'sourceTenantId',
        bind: 'sourceTenantLov.tenantId',
      },
      isTenantRoleLevel() && {
        name: 'interfaceSource',
        label: getLang('INTERFACE_SOURCE'),
        type: 'string',
        lookupCode: SOURCE,
      },
    ],
    fields: [
      {
        name: 'tenantName',
        type: 'string',
        label: getLang('BELONG_TENANT'),
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
      {
        name: 'formatInterfaceServerVersion',
        label: getLang('INTERFACE_SERVER_VERSION'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
      {
        name: 'formatInterfaceVersion',
        label: getLang('INTERFACE_VERSION'),
        type: 'string',
      },
      {
        name: 'clientId',
        label: getLang('CLIENT_ID'),
        type: 'string',
      },
      {
        name: 'interfaceUrl',
        label: getLang('INTERFACE_URL'),
        type: 'string',
      },
      {
        name: 'invokeType',
        label: getLang('INVOKE_TYPE'),
        type: 'string',
      },
      {
        name: 'invokeKey',
        label: getLang('INVOKE_KEY'),
        type: 'string',
      },
      {
        name: 'requestTime',
        label: getLang('REQUEST_TIME'),
        type: 'dateTime',
      },
      {
        name: 'asyncFlag',
        label: getLang('ASYNC_FLAG'),
        type: 'number',
      },
      {
        name: 'responseStatus',
        label: getLang('RESPONSE_STATUS'),
        type: 'string',
      },
      {
        name: 'sourceTenantName',
        label: getLang('INTERFACE_TENANT'),
        type: 'string',
        help: getLang('INTERFACE_TENANT_TIP'),
      },
      {
        name: 'interfaceSource',
        label: getLang('INTERFACE_SOURCE'),
        type: 'string',
        lookupCode: SOURCE,
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-logs`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
    },
  };
};

const clearLogFormDS = (props) => {
  const { onFieldUpdate } = props;
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    selection: false,
    fields: [
      {
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
        defaultValue: isTenantRoleLevel() ? organizationId : undefined,
      },
      {
        name: 'clearType',
        label: getLang('CLEAR_TYPE'),
        type: 'string',
        lookupCode: INTERFACE_LOG_CLEAR_TYPE,
        required: true,
      },
      {
        name: 'requestTimeStart',
        label: getLang('REQUEST_TIME_START'),
        type: 'dateTime',
        max: 'requestTimeEnd',
        dynamicProps: {
          required: ({ record }) => record.get('clearType') === 'SPECIFIED_TIME_RANGE',
        },
      },
      {
        name: 'requestTimeEnd',
        label: getLang('REQUEST_TIME_END'),
        type: 'dateTime',
        min: 'requestTimeStart',
        dynamicProps: {
          required: ({ record }) => record.get('clearType') === 'SPECIFIED_TIME_RANGE',
        },
      },
    ],
    transport: {
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-logs/clear-logs`,
          data: data[0],
          method: 'DELETE',
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
    feedback: {
      submitSuccess: () => {
        notification.success({
          message: getLang('CLEAR_LOG_SUCCESS'),
        });
      },
    },
  };
};

const retryFormDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    selection: false,
    transport: {
      create: ({ data }) => {
        const { interfaceLogId } = data[0];
        const suffixUrl = isTenantRoleLevel() ? `/${interfaceLogId}` : '';
        return {
          url: `${HZERO_HITF}/v1${level}/interface-logs/retry${suffixUrl}`,
          data: isTenantRoleLevel() ? null : data[0],
          method: 'GET',
        };
      },
    },
  };
};

const interfaceLogFormDS = (props) => {
  const { onLoad = () => {} } = props;
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'invokeKey',
        label: getLang('INVOKE_KEY'),
        type: 'string',
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
      {
        name: 'clientId',
        label: getLang('CLIENT_ID'),
        type: 'string',
      },
      {
        name: 'interfaceRequestTime',
        label: getLang('REQ_TIME'),
        type: 'dateTime',
      },
      {
        name: 'ip',
        label: getLang('IP'),
        type: 'string',
      },
      {
        name: 'requestMethod',
        label: getLang('REQUEST_METHOD'),
        type: 'string',
      },
      {
        name: 'responseTime',
        label: getLang('RESPONSE_TIME'),
        type: 'number',
      },
      {
        name: 'interfaceResponseTime',
        label: getLang('RESP_TIME'),
        type: 'number',
      },
      {
        name: 'interfaceType',
        label: getLang('INTERFACE_TYPE'),
        type: 'string',
      },
      {
        name: 'interfaceUrl',
        label: getLang('INTERFACE_URL'),
        type: 'string',
      },
      {
        name: 'responseStatus',
        label: getLang('RESPONSE_STATUS'),
        type: 'string',
        transformResponse: (value) => {
          if (value === 'success') {
            return getLang('SUCCESS');
          }
          if (value === 'failure') {
            return getLang('FAILURE');
          }
          return undefined;
        },
      },
      {
        name: 'asyncFlag',
        label: getLang('ASYNC_FLAG'),
        type: 'string',
        transformResponse: (value) => {
          if (value === 0) {
            return getLang('SYNC');
          }
          if (value === 1) {
            return getLang('ASYNC');
          }
          return undefined;
        },
      },
      {
        name: 'formatInterfaceServerVersion',
        label: getLang('INTERFACE_SERVER_VERSION'),
        type: 'string',
      },
      {
        name: 'formatInterfaceVersion',
        label: getLang('INTERFACE_VERSION'),
        type: 'string',
      },
      {
        name: 'userAgent',
        label: getLang('USER_AGENT'),
        type: 'string',
      },
      {
        name: 'referer',
        label: getLang('REFERER'),
        type: 'string',
      },
      {
        name: '_download',
        label: getLang('MORE_LOG'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { interfaceLogId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interface-logs/${interfaceLogId}`,
          data: null,
          method: 'GET',
        };
      },
    },
    events: {
      load: onLoad,
    },
  };
};

export { tableDS, clearLogFormDS, retryFormDS, interfaceLogFormDS };
