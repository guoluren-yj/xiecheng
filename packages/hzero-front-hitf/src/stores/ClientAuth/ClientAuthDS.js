import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/clientAuthLang';
import { TENANT, APPLICATION_CLIENT, STATISTICS_LEVEL, SOURCE } from '@/constants/CodeConstants';
import QuestionPopover from '@/components/QuestionPopover';

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
        name: 'name',
        label: getLang('CLIENT'),
        type: 'string',
      },
    ],
    fields: [
      {
        name: 'clientTenantName',
        label: getLang('BELONG_TENANT'),
        type: 'string',
      },
      {
        name: 'name',
        label: getLang('CLIENT'),
        type: 'string',
      },
      {
        name: 'statisticsLevel',
        label: getLang('STATISTICS_LEVEL'),
        type: 'string',
        lookupCode: STATISTICS_LEVEL,
      },
      {
        name: 'remark',
        label: getLang('EXPLAIN'),
        type: 'string',
      },
      {
        name: 'authFlag',
        label: getLang('AUTH_FLAG'),
        type: 'number',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/client-auths`,
          method: 'GET',
        };
      },
    },
  };
};

const roleFormDS = (props) => {
  const { clientOauthId, currentOrganizationId, currentTenantId, onLoad = () => {} } = props;
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    queryParameter: {
      tenantId: !isTenantRoleLevel() ? currentOrganizationId : undefined,
    },
    fields: [
      {
        name: 'clientLov',
        label: getLang('CLIENT'),
        type: 'object',
        required: true,
        ignore: 'always',
        lovCode: APPLICATION_CLIENT,
        lovPara: { tenantId: isTenantRoleLevel() ? organizationId : currentTenantId },
        valueField: 'clientName',
        textField: 'clientName',
      },
      {
        name: 'name',
        type: 'string',
        bind: 'clientLov.clientName',
      },
      {
        name: 'statisticsLevel',
        label: (
          <QuestionPopover
            text={getLang('STATISTICS_LEVEL')}
            message={getLang('STATISTICS_LEVEL_TIP')}
          />
        ),
        type: 'string',
        required: true,
        lookupCode: STATISTICS_LEVEL,
      },
      {
        name: 'remark',
        label: getLang('EXPLAIN'),
        type: 'string',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/client-auths/${clientOauthId}`,
          method: 'GET',
        };
      },
      update: ({ data }) => {
        const suffixPath = !isTenantRoleLevel() ? `?tenantId=${currentOrganizationId}` : '';
        return {
          url: `${HZERO_HITF}/v1${level}/client-auths${suffixPath}`,
          method: 'POST',
          data: data[0],
        };
      },
    },
    events: {
      load: onLoad,
    },
  };
};

const roleTableDS = (props) => {
  const { clientOauthId, onBatchSelect = () => {}, onBatchUnSelect = () => {} } = props;
  return {
    autoQuery: false,
    pageSize: 10,
    fields: [
      {
        name: 'tenantName',
        label: getLang('BELONG_TENANT'),
        type: 'string',
      },
      {
        name: 'name',
        label: getLang('ROLE_NAME'),
        type: 'string',
      },
      {
        name: 'code',
        label: getLang('ROLE_CODE'),
        type: 'string',
      },
      {
        name: 'levelPath',
        label: getLang('LEVEL_PATH'),
        type: 'string',
      },
    ],
    transport: {
      destroy: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/client-auths/${clientOauthId}/role/batch-delete`,
          method: 'DELETE',
        };
      },
    },
    events: {
      batchSelect: onBatchSelect,
      batchUnSelect: onBatchUnSelect,
    },
  };
};

const interfaceTableDS = () => {
  return {
    autoQuery: false,
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
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
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
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
    ],
    fields: [
      {
        name: 'tenantName',
        label: getLang('BELONG_TENANT'),
        type: 'string',
      },
      {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
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
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { clientId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/client-auths/auth-list/${clientId}`,
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

export { tableDS, roleFormDS, roleTableDS, interfaceTableDS };
