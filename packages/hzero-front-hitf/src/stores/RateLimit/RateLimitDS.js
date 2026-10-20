import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentTenant,
} from 'hzero-front/lib/utils/utils';
import { STRICT_URL } from 'hzero-front/lib/utils/regExp';
import getLang from '@/langs/rateLimitLang';
import {
  YES_OR_NO_FLAG,
  ENABLED_FLAG,
  USER,
  USER_ORG,
  ROLE,
  TENANT,
  SERVICE_TYPE,
  RATE_LIMIT_AVALIABLE_INTERFACE,
  RATE_LIMIT_AVALIABLE_INTERFACE_ORG,
  RATE_LIMIT_TYPE,
  SOURCE,
} from '@/constants/CodeConstants';
import { RATE_LIMIT_TYPE_CONSTANTS } from '@/constants/constants';
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
        name: 'rateLimitFlag',
        label: getLang('RATE_LIMIT_FLAG'),
        type: 'string',
        lookupCode: YES_OR_NO_FLAG,
        defaultValue: 1,
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
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
      {
        name: 'publishType',
        label: getLang('SERVICE_TYPE'),
        type: 'string',
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'enabledFlag',
        label: getLang('LIMIT_STATUS'),
        type: 'string',
        lookupCode: ENABLED_FLAG,
      },
    ],
    fields: [
      {
        name: 'tenantName',
        type: 'string',
        label: getLang('BELONG_TENANT'),
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
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        align: 'center',
        lookupCode: SOURCE,
      },
      {
        name: 'publishType',
        label: getLang('SERVICE_TYPE'),
        type: 'string',
      },
      {
        name: 'publicFlag',
        label: getLang('PUBLIC_FLAG'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'enabledFlag',
        label: getLang('LIMIT_STATUS'),
        type: 'boolean',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limits`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
      update: ({ data }) => {
        const {
          interfaceId,
          _requestType,
          enabledFlag,
          objectVersionNumber,
          _token,
          itfRateLimitId,
          rateLimitId,
        } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limits/${interfaceId}/${_requestType}`,
          method: 'PUT',
          data:
            _requestType === 'refresh-url'
              ? null
              : {
                  rateLimitId,
                  itfRateLimitId,
                  objectVersionNumber,
                  _token,
                  enabledFlag: !enabledFlag,
                },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limits`,
          method: 'DELETE',
          data: data[0],
        };
      },
    },
  };
};

const interfaceFormDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    selection: false,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'interfaceLov',
        label: getLang('INTERFACE_CODE'),
        type: 'object',
        lovCode: isTenantRoleLevel()
          ? RATE_LIMIT_AVALIABLE_INTERFACE_ORG
          : RATE_LIMIT_AVALIABLE_INTERFACE,
        ignore: 'always',
        required: true,
        lovPara: {
          tenantId: isTenantRoleLevel() ? organizationId : undefined,
        },
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
        bind: 'interfaceLov.interfaceName',
        disabled: true,
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
        bind: 'interfaceLov.serverCode',
        disabled: true,
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
        bind: 'interfaceLov.serverName',
        disabled: true,
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
        bind: 'interfaceLov.namespace',
        disabled: true,
      },
      {
        name: 'rateLimitType',
        label: getLang('RATE_LIMIT_TYPE'),
        type: 'string',
        required: true,
        lookupCode: RATE_LIMIT_TYPE,
        defaultValue: RATE_LIMIT_TYPE_CONSTANTS.FIXED_RATE,
      },
      {
        name: 'enabledFlag',
        label: getLang('LIMIT_STATUS'),
        type: 'boolean',
        defaultValue: true,
        required: true,
      },
      {
        name: 'replenishRateMax',
        type: 'number',
        disabled: true,
        dynamicProps: {
          label: ({ record }) => {
            if (record.get('rateLimitType') === RATE_LIMIT_TYPE_CONSTANTS.SIGNAL) {
              return (
                <QuestionPopover text={getLang('SIGNAL_MAX')} message={getLang('SIGNAL_MAX_TIP')} />
              );
            } else {
              return (
                <QuestionPopover
                  text={getLang('REPLENISH_RATE_MAX')}
                  message={getLang('REPLENISH_RATE_MAX_TIP')}
                />
              );
            }
          },
        },
      },
    ],
    transport: {
      read: ({ data }) => {
        const { interfaceId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limits/${interfaceId}`,
          method: 'GET',
          data: null,
        };
      },
      create: ({ data }) => {
        const { submitData } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limits/batch-save`,
          method: 'POST',
          data: submitData,
        };
      },
      update: ({ data }) => {
        const { itfRateLimitId, submitData } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limit-lines/${itfRateLimitId}/batch-update`,
          method: 'PUT',
          data: submitData,
        };
      },
    },
  };
};

const ruleTableDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    fields: [
      {
        name: 'replenishRate',
        label: getLang('REPLENISH_RATE'),
        type: 'number',
        help: getLang('REPLENISH_RATE_TIP'),
      },
      {
        name: 'original',
        label: getLang('SOURCE_ADDRESS'),
        type: 'string',
        help: getLang('SOURCE_ADDRESS_TIP'),
      },
      {
        name: 'userName',
        label: getLang('USER'),
        type: 'string',
      },
      {
        name: 'tenantName',
        label: getLang('TENANT'),
        type: 'string',
      },
      {
        name: 'roleName',
        label: getLang('ROLE'),
        type: 'string',
      },
      {
        name: 'header',
        label: getLang('HEADER_FIELD'),
        help: getLang('HEADER_FIELD_TIP'),
        type: 'string',
      },
      {
        name: 'body',
        label: getLang('BODY'),
        help: getLang('BODY_TIP'),
        type: 'string',
      },
      {
        name: 'enabledFlag',
        label: getLang('STATUS'),
        type: 'boolean',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { itfRateLimitId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limit-lines/${itfRateLimitId}`,
          method: 'GET',
          data: null,
        };
      },
      destroy: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/rate-limit-lines/batch-remove`,
          method: 'DELETE',
        };
      },
    },
  };
};

const rateLimitFormDS = (props) => {
  const { replenishRateMax, rateLimitType } = props;
  return {
    autoCreate: true,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'replenishRate',
        label:
          rateLimitType === RATE_LIMIT_TYPE_CONSTANTS.FIXED_RATE ? (
            <QuestionPopover
              text={getLang('REPLENISH_RATE')}
              message={getLang('REPLENISH_RATE_TIP')}
            />
          ) : (
            <QuestionPopover text={getLang('SIGNAL')} message={getLang('SIGNAL_TIP')} />
          ),
        type: 'number',
        required: true,
        min: 1,
        step: 1,
        max: isTenantRoleLevel() ? replenishRateMax : undefined,
        defaultValidationMessages: {
          rangeOverflow: getLang('REPLENISH_RATE_MAX_VALIDATE', {
            maxReplenishRate: replenishRateMax,
          }),
        },
      },
      {
        name: 'original',
        label: (
          <QuestionPopover
            text={getLang('SOURCE_ADDRESS')}
            message={getLang('SOURCE_ADDRESS_TIP')}
          />
        ),
        type: 'string',
        pattern: STRICT_URL,
        defaultValidationMessages: {
          patternMismatch: getLang('STRICT_URL'),
        },
      },
      {
        name: 'userLov',
        label: getLang('USER'),
        type: 'object',
        ignore: 'always',
        lovCode: isTenantRoleLevel() ? USER_ORG : USER,
        valueField: 'loginName',
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
        name: 'user',
        type: 'string',
        bind: 'userLov.loginName',
      },
      {
        name: 'userName',
        type: 'string',
        bind: 'userLov.comboName',
      },
      {
        name: 'tenantLov',
        label: getLang('TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        valueField: 'tenantNum',
        textField: 'tenantName',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'tenantLov.tenantNum',
        defaultValue: isTenantRoleLevel() ? getCurrentTenant().tenantNum : undefined,
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'tenantLov.tenantName',
      },
      {
        name: 'roleLov',
        label: getLang('ROLE'),
        type: 'object',
        ignore: 'always',
        lovCode: ROLE,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: isTenantRoleLevel() ? organizationId : record.get('tenantId'),
          }),
        },
      },
      {
        name: 'roleId',
        type: 'string',
        bind: 'roleLov.id',
      },
      {
        name: 'roleName',
        type: 'string',
        bind: 'roleLov.name',
      },
      {
        name: 'header',
        label: (
          <QuestionPopover text={getLang('HEADER_FIELD')} message={getLang('HEADER_FIELD_TIP')} />
        ),
        type: 'string',
      },
      {
        name: 'body',
        label: <QuestionPopover text={getLang('BODY')} message={getLang('BODY_TIP')} />,
        type: 'string',
      },
      {
        name: 'enabledFlag',
        label: getLang('STATUS'),
        type: 'boolean',
        defaultValue: true,
      },
    ],
  };
};

export { tableDS, interfaceFormDS, ruleTableDS, rateLimitFormDS };
