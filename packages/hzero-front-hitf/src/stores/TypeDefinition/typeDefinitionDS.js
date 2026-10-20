import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import {
  APP_MAJOR_CATEGORY,
  APP_MINOR_CATEGORY,
  TENANT,
  COMPOSE_ENTRY_INTERFACE,
  COMPOSE_POLICY,
  APP_SERVICE_TYPE,
  COMPOSE_INST_INTERFACE,
  COMPOSE_INST_INTERFACE_ORG,
} from '@/constants/CodeConstants';
import { CODE_UPPER } from 'hzero-front/lib/utils/regExp';
import QuestionPopover from '@/components/QuestionPopover';
import getLang from '@/langs/typeDefinitionLang';
import getServiceLang from '@/langs/serviceLang';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    primaryKey: 'applicationId',
    autoQuery: true,
    pageSize: 10,
    selection: 'multiple',
    cacheSelection: true,
    queryFields: [
      !isTenantRoleLevel() && {
        label: getLang('BELONG_TENANT'),
        name: 'tenantId',
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        valueField: 'tenantId',
        textField: 'tenantName',
      },
      !isTenantRoleLevel() && {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        label: getLang('APPLICATION_CODE'),
        name: 'applicationCode',
        type: 'string',
      },
      {
        label: getLang('APPLICATION_NAME'),
        name: 'applicationName',
        type: 'string',
      },
      {
        label: getLang('SERVICE_TYPE'),
        align: 'center',
        name: 'serviceType',
        type: 'string',
        lookupCode: APP_SERVICE_TYPE,
      },
      {
        label: getLang('PUBLIC_INTERFACE'),
        name: 'interfaceLov',
        type: 'object',
        lovCode: COMPOSE_ENTRY_INTERFACE,
        ignore: 'always',
        valueField: 'interfaceId',
        textField: 'interfaceName',
      },
      {
        label: getLang('MAJOR_CATEGORY'),
        name: 'majorCategoryLov',
        type: 'object',
        lovCode: APP_MAJOR_CATEGORY,
        ignore: 'always',
        valueField: 'value',
        textField: 'meaning',
      },
      {
        name: 'interfaceId',
        type: 'string',
        bind: 'interfaceLov.interfaceId',
      },
      {
        name: 'majorCategory',
        type: 'string',
        bind: 'majorCategoryLov.value',
      },
      {
        label: getLang('MINOR_CATEGORY'),
        name: 'minorCategory',
        type: 'string',
        lookupCode: APP_MINOR_CATEGORY,
        dynamicProps: ({ record }) => ({
          disabled: !record.get('majorCategory'),
        }),
      },
    ],
    fields: [
      !isTenantRoleLevel() && {
        label: getLang('BELONG_TENANT'),
        name: 'tenantName',
        type: 'string',
      },
      {
        label: getLang('APPLICATION_CODE'),
        name: 'applicationCode',
        type: 'string',
      },
      {
        label: getLang('APPLICATION_NAME'),
        name: 'applicationName',
        type: 'string',
      },
      {
        label: getLang('MAJOR_CATEGORY'),
        name: 'majorCategoryMeaning',
        type: 'string',
      },
      {
        label: getLang('MINOR_CATEGORY'),
        name: 'minorCategoryMeaning',
        type: 'string',
      },
      {
        label: getLang('SERVICE_TYPE'),
        align: 'center',
        name: 'serviceType',
        type: 'string',
        lookupCode: APP_SERVICE_TYPE,
      },
      {
        label: getLang('PUBLIC_INTERFACE'),
        name: 'interfaceName',
        type: 'string',
      },
      {
        label: getLang('COMPOSE_POLICY'),
        align: 'center',
        name: 'composePolicy',
        type: 'string',
        lookupCode: COMPOSE_POLICY,
      },
      {
        label: getLang('STATUS'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: getLang('EXPLAIN'),
        name: 'remark',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/applications`,
          method: 'GET',
          data,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/applications`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

const basicFormDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      !isTenantRoleLevel() && {
        label: getLang('BELONG_TENANT'),
        name: 'tenantLov',
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        required: !isTenantRoleLevel(),
        valueField: 'tenantId',
        textField: 'tenantName',
      },
      !isTenantRoleLevel() && {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      !isTenantRoleLevel() && {
        name: 'tenantName',
        type: 'string',
        bind: 'tenantLov.tenantName',
      },
      {
        label: getLang('APPLICATION_CODE'),
        name: 'applicationCode',
        type: 'string',
        required: true,
        maxLength: 80,
        pattern: CODE_UPPER,
        format: 'uppercase',
        defaultValidationMessages: {
          patternMismatch: getLang('CODE_UPPER'),
        },
      },
      {
        label: getLang('APPLICATION_NAME'),
        name: 'applicationName',
        required: true,
        maxLength: 255,
        type: 'string',
      },
      {
        label: getLang('SERVICE_TYPE'),
        align: 'center',
        name: 'serviceType',
        type: 'string',
        lookupCode: APP_SERVICE_TYPE,
      },
      {
        label: getLang('MAJOR_CATEGORY'),
        name: 'majorCategoryLov',
        required: true,
        type: 'object',
        lovCode: APP_MAJOR_CATEGORY,
        ignore: 'always',
        valueField: 'value',
        textField: 'meaning',
      },
      {
        name: 'majorCategory',
        type: 'string',
        bind: 'majorCategoryLov.value',
      },
      {
        name: 'majorCategoryMeaning',
        type: 'string',
        bind: 'majorCategoryLov.meaning',
      },
      {
        label: getLang('MINOR_CATEGORY'),
        name: 'minorCategory',
        required: true,
        type: 'string',
        lookupCode: APP_MINOR_CATEGORY,
        dynamicProps: ({ record }) => ({
          disabled: !record.get('majorCategory'),
        }),
      },
      {
        label: getLang('PUBLIC_INTERFACE'),
        name: 'interfaceLov',
        required: true,
        type: 'object',
        lovCode: COMPOSE_ENTRY_INTERFACE,
        ignore: 'always',
        valueField: 'interfaceId',
        textField: 'interfaceName',
      },
      {
        name: 'interfaceServerId',
        type: 'string',
        bind: 'interfaceLov.interfaceServerId',
      },
      {
        label: getLang('PUBLIC_INTERFACE'),
        name: 'interfaceServerName',
        type: 'string',
      },
      {
        label: (
          <QuestionPopover
            text={getLang('COMPOSE_POLICY')}
            message={getLang('COMPOSE_POLICY_TIP')}
          />
        ),
        name: 'composePolicy',
        type: 'string',
        lookupCode: COMPOSE_POLICY,
      },
      {
        label: getLang('STATUS'),
        name: 'enabledFlag',
        defaultValue: 1,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: getLang('EXPLAIN'),
        name: 'remark',
        type: 'string',
      },
      {
        label: getLang('FAST_FAIL'),
        name: 'fastFailFlag',
        type: 'number',
        defaultValue: 1,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { applicationId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/applications/${applicationId}`,
          method: 'GET',
          data: null,
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/applications`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/applications`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

const instTableDS = () => {
  return {
    primaryKey: 'applicationInstId',
    autoQuery: false,
    pageSize: 10,
    selection: 'multiple',
    cacheSelection: true,
    fields: [
      !isTenantRoleLevel() && {
        label: getLang('BELONG_TENANT'),
        name: 'tenantName',
        type: 'string',
      },
      {
        label: getLang('INSTANCE_CODE'),
        name: 'interfaceCode',
        type: 'string',
      },
      {
        label: getLang('INSTANCE_NAME'),
        name: 'interfaceName',
        type: 'string',
      },
      {
        label: getLang('SERVER_CODE'),
        name: 'serverCode',
        type: 'string',
      },
      {
        label: getLang('SERVER_NAME'),
        name: 'serverName',
        type: 'string',
      },
      {
        label: getLang('WEIGHT'),
        name: 'weight',
        type: 'number',
      },
      {
        label: getLang('PRIORITY'),
        name: 'orderSeq',
        type: 'number',
      },
      {
        label: getLang('EXPLAIN'),
        name: 'remark',
        type: 'string',
      },
      {
        label: getLang('STATUS'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { applicationId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/application-insts/${applicationId}/page`,
          method: 'GET',
          data,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/application-insts`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

const instFormDS = () => {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        label: getLang('INSTANCE_CODE'),
        name: 'instInterfaceLov',
        type: 'object',
        required: true,
        ignore: true,
        lovCode: isTenantRoleLevel() ? COMPOSE_INST_INTERFACE_ORG : COMPOSE_INST_INTERFACE,
      },
      {
        name: 'instInterfaceId',
        type: 'string',
        bind: 'instInterfaceLov.instInterfaceId',
      },
      {
        name: 'interfaceCode',
        type: 'string',
        bind: 'instInterfaceLov.interfaceCode',
      },
      {
        label: getLang('INSTANCE_NAME'),
        name: 'interfaceName',
        required: true,
        type: 'string',
        bind: 'instInterfaceLov.interfaceName',
      },
      {
        label: getLang('WEIGHT'),
        name: 'weight',
        type: 'number',
      },
      {
        label: getLang('PRIORITY'),
        name: 'orderSeq',
        type: 'number',
      },
      {
        label: getLang('EXPLAIN'),
        name: 'remark',
        type: 'string',
        lookupCode: COMPOSE_POLICY,
      },
      {
        label: getLang('STATUS'),
        name: 'enabledFlag',
        type: 'boolean',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: getLang('INSTANCE_CLASS'),
        name: 'instanceClass',
        type: 'string',
        ignore: true,
        defaultValue: getLang('MAPPING_CLASS_DETAIL'),
      },
      {
        label: getServiceLang('MAINTAIN_REQUEST_MAPPING'),
        name: 'requestMapping',
        type: 'string',
        ignore: true,
        defaultValue: getServiceLang('MAINTAIN_REQUEST_MAPPING'),
      },
      {
        label: getServiceLang('MAINTAIN_RESPONSE_MAPPING'),
        name: 'responseMapping',
        type: 'string',
        ignore: true,
        defaultValue: getServiceLang('MAINTAIN_RESPONSE_MAPPING'),
      },
      {
        label: getServiceLang('MAINTAIN_REQUEST_DATA_MAPPING'),
        name: 'requestDataMapping',
        type: 'string',
        ignore: true,
        defaultValue: getServiceLang('MAINTAIN_REQUEST_DATA_MAPPING'),
      },
      {
        label: getServiceLang('MAINTAIN_RESPONSE_DATA_MAPPING'),
        name: 'responseDataMapping',
        type: 'string',
        ignore: true,
        defaultValue: getServiceLang('MAINTAIN_RESPONSE_DATA_MAPPING'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { applicationInstId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/application-insts/${applicationInstId}`,
          method: 'GET',
          data,
        };
      },
      create: ({ data }) => {
        const { applicationId } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/application-insts/${applicationId}`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        const { applicationId } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/application-insts/${applicationId}`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

export { tableDS, basicFormDS, instTableDS, instFormDS };
