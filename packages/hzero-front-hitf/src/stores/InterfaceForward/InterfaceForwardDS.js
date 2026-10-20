import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/interfaceForwardLang';
import {
  ENABLED_FLAG,
  USER,
  TENANT,
  INTERFACE_FORWARD_USER,
  INTERFACE_FORWARD_TENANT,
  FORWARD_MATCH_TYPE,
  SERVICE_ROUTE,
  SERVER_INTERFACE,
} from '@/constants/CodeConstants';
import { FORWARD_MATCH_TYPE_CONSTANT } from '@/constants/constants';
import QuestionPopover from '@/components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    autoQuery: true,
    pageSize: 10,
    selection: false,
    queryFields: [
      {
        name: 'urlRuleCode',
        type: 'string',
        label: getLang('URL_RULE_CODE'),
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
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
      {
        name: 'targetServiceLov',
        label: getLang('TARGET_SERVICE'),
        type: 'object',
        ignore: 'always',
        lovCode: SERVICE_ROUTE,
      },
      {
        name: 'targetServiceCode',
        type: 'string',
        bind: 'targetServiceLov.serverCode',
      },
      {
        name: 'enabledFlag',
        label: getLang('STATUS'),
        type: 'string',
        lookupCode: ENABLED_FLAG,
      },
    ],
    fields: [
      {
        name: 'urlRuleCode',
        type: 'string',
        label: getLang('URL_RULE_CODE'),
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
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
      {
        name: 'targetServiceName',
        label: getLang('TARGET_SERVICE'),
        type: 'string',
      },
      {
        name: 'enabledFlag',
        label: getLang('STATUS'),
        type: 'boolean',
      },
      {
        name: 'description',
        label: getLang('DESCRIPTION'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
      update: ({ data }) => {
        const { enabledFlag, urlRuleId, objectVersionNumber, _token } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards/enable`,
          method: 'PUT',
          data: { urlRuleId, objectVersionNumber, _token, enabledFlag: !enabledFlag },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards`,
          method: 'DELETE',
          data: data[0],
        };
      },
    },
  };
};

const basicFormDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    fields: [
      {
        name: 'urlRuleCode',
        type: 'string',
        required: true,
        label: getLang('URL_RULE_CODE'),
      },
      {
        name: 'interfaceLov',
        label: getLang('INTERFACE_CODE'),
        type: 'object',
        ignore: 'always',
        required: true,
        lovCode: SERVER_INTERFACE,
      },
      {
        name: 'publishType',
        type: 'string',
        bind: 'interfaceLov.publishType',
      },
      {
        name: 'publicFlag',
        type: 'number',
        bind: 'interfaceLov.publicFlag',
        transformRequest: (value) => (value ? 1 : 0),
      },
      {
        name: 'interfaceId',
        type: 'string',
        bind: 'interfaceLov.interfaceId',
      },
      {
        name: 'interfaceCode',
        type: 'string',
        bind: 'interfaceLov.interfaceCode',
      },
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
        disabled: true,
        bind: 'interfaceLov.interfaceName',
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
        disabled: true,
        bind: 'interfaceLov.serverCode',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
        disabled: true,
        bind: 'interfaceLov.serverName',
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
        disabled: true,
        bind: 'interfaceLov.namespace',
      },
      {
        name: 'targetServiceLov',
        label: getLang('TARGET_SERVICE'),
        type: 'object',
        ignore: 'always',
        required: true,
        lovCode: SERVICE_ROUTE,
        valueField: 'serviceCode',
        textField: 'service',
      },
      {
        name: 'targetServiceCode',
        type: 'string',
        bind: 'targetServiceLov.serviceCode',
      },
      {
        name: 'targetServiceName',
        type: 'string',
        bind: 'targetServiceLov.service',
      },
      {
        name: 'targetUrl',
        label: <QuestionPopover text={getLang('TARGET_URL')} message={getLang('TARGET_URL_TIP')} />,
        type: 'string',
      },
      {
        name: 'orderSeq',
        label: <QuestionPopover text={getLang('PRIORITY')} message={getLang('PRIORITY_TIP')} />,
        type: 'number',
        min: 1,
        step: 1,
        defaultValue: 1,
      },
      {
        name: 'enabledFlag',
        label: getLang('STATUS'),
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'description',
        label: getLang('DESCRIPTION'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { forwardId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards/${forwardId}`,
          params: null,
          data: null,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
  };
};

const userTenantTableDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    pageSize: 10,
    queryFields: [
      {
        name: 'type',
        label: getLang('TYPE'),
        type: 'string',
        lookupCode: FORWARD_MATCH_TYPE,
      },
      {
        name: 'userLov',
        label: getLang('USER'),
        type: 'object',
        ignore: 'always',
        lovCode: USER,
        dynamicProps: {
          disabled: ({ record }) => record.get('type') === FORWARD_MATCH_TYPE_CONSTANT.TENANT,
        },
        textField: 'comboName',
        optionsProps: {
          fields: [
            {
              name: 'comboName',
              type: 'string',
              transformResponse: (_, record = {}) => {
                const { realName, loginName } = record;
                return !loginName ? realName : `${realName}(${loginName})`;
              },
            },
          ],
        },
      },
      {
        name: 'sourceUserId',
        type: 'string',
        bind: 'userLov.id',
      },
      {
        name: 'tenantLov',
        label: getLang('TENANT'),
        type: 'object',
        ignore: 'always',
        lovCode: TENANT,
        dynamicProps: {
          disabled: ({ record }) => record.get('type') === FORWARD_MATCH_TYPE_CONSTANT.USER,
        },
      },
      {
        name: 'sourceTenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
    ],
    fields: [
      {
        name: 'type',
        label: getLang('TYPE'),
        type: 'string',
        lookupCode: FORWARD_MATCH_TYPE,
      },
      {
        name: 'userTenantName',
        type: 'string',
        label: getLang('NAME'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { urlRuleId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards/${urlRuleId}/lines`,
          params: {
            ...params,
            ...data,
          },
          method: 'GET',
        };
      },
      destroy: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards/line/batch-remove`,
          method: 'DELETE',
        };
      },
    },
  };
};

const userTenantFormDS = (props) => {
  const { urlRuleId, onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    fields: [
      {
        name: 'type',
        label: getLang('TYPE'),
        type: 'string',
        required: true,
        lookupCode: FORWARD_MATCH_TYPE,
      },
      {
        name: 'userLov',
        label: getLang('USER'),
        type: 'object',
        ignore: 'always',
        lovCode: INTERFACE_FORWARD_USER,
        lovPara: { urlRuleId },
        dynamicProps: {
          required: ({ record }) => record.get('type') === FORWARD_MATCH_TYPE_CONSTANT.USER,
        },
        textField: 'comboName',
        optionsProps: {
          fields: [
            {
              name: 'comboName',
              type: 'string',
              transformResponse: (_, record = {}) => {
                const { realName, loginName } = record;
                return !loginName ? realName : `${realName}(${loginName})`;
              },
            },
          ],
        },
      },
      {
        name: 'sourceUserId',
        type: 'string',
        bind: 'userLov.id',
      },
      {
        name: 'sourceUserName',
        type: 'string',
        bind: 'userLov.comboName',
      },
      {
        name: 'tenantLov',
        label: getLang('TENANT'),
        type: 'object',
        ignore: 'always',
        lovCode: INTERFACE_FORWARD_TENANT,
        lovPara: { urlRuleId },
        dynamicProps: {
          required: ({ record }) => record.get('type') === FORWARD_MATCH_TYPE_CONSTANT.TENANT,
        },
      },
      {
        name: 'sourceTenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'sourceTenantName',
        type: 'string',
        bind: 'tenantLov.tenantName',
      },
    ],
    transport: {
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-forwards/line`,
          method: 'POST',
          data: data[0],
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

export { tableDS, basicFormDS, userTenantTableDS, userTenantFormDS };
