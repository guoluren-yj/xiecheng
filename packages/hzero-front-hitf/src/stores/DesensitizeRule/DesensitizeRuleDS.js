import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { CODE_UPPER } from 'hzero-front/lib/utils/regExp';
import getLang from '@/langs/desensitizeRuleLang';
import {
  ENABLED_FLAG,
  DESENSITIZE_SOURCE_TYPE,
  DESENSITIZE_WAY,
  DESENSITIZE_TYPE,
  MASK_STR,
} from '@/constants/CodeConstants';
import { DESENSITIZE_WAY_CONSTANTS, DESENSITIZE_TYPE_CONSTANTS } from '@/constants/constants';
import QuestionPopover from '@/components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const { MASK, TRUNCATION, SENSITIVE } = DESENSITIZE_WAY_CONSTANTS;
const { FRONT, BEHIND, MIDDLE } = DESENSITIZE_TYPE_CONSTANTS;

const tableDS = () => {
  return {
    autoQuery: true,
    pageSize: 10,
    selection: false,
    queryFields: [
      {
        name: 'ruleCode',
        label: getLang('RULE_CODE'),
        type: 'string',
      },
      {
        name: 'ruleName',
        label: getLang('RULE_NAME'),
        type: 'string',
      },
      {
        name: 'desensitizeWay',
        label: getLang('DESENSITIZE_WAY'),
        type: 'string',
        lookupCode: DESENSITIZE_WAY,
      },
      {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: DESENSITIZE_SOURCE_TYPE,
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
        name: 'ruleCode',
        label: getLang('RULE_CODE'),
        type: 'string',
      },
      {
        name: 'ruleName',
        label: getLang('RULE_NAME'),
        type: 'string',
      },
      {
        name: 'desensitizeWay',
        label: getLang('DESENSITIZE_WAY'),
        type: 'string',
        lookupCode: DESENSITIZE_WAY,
      },
      {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
      },
      {
        name: 'description',
        label: getLang('DESCRIPTION'),
        type: 'string',
      },
      {
        name: 'enabledFlag',
        label: getLang('STATUS'),
        type: 'boolean',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
      update: ({ data }) => {
        const { _requestType } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules/${_requestType}`,
          method: 'POST',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules`,
          method: 'DELETE',
          data: data[0],
        };
      },
    },
  };
};

const basicFormDS = (props) => {
  const { onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    selection: false,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'ruleCode',
        label: getLang('RULE_CODE'),
        type: 'string',
        required: true,
        pattern: CODE_UPPER,
        defaultValidationMessages: {
          patternMismatch: getLang('CODE_UPPER'),
        },
      },
      {
        name: 'ruleName',
        label: getLang('RULE_NAME'),
        type: 'string',
        required: true,
      },
      {
        name: 'desensitizeWay',
        label: getLang('DESENSITIZE_WAY'),
        type: 'string',
        lookupCode: DESENSITIZE_WAY,
        required: true,
      },
      {
        name: 'desensitizeType',
        label: getLang('DESENSITIZE_TYPE'),
        type: 'string',
        lookupCode: DESENSITIZE_TYPE,
        dynamicProps: {
          required: ({ record }) => [MASK, TRUNCATION].includes(record.get('desensitizeWay')),
          ignore: ({ record }) =>
            ![MASK, TRUNCATION].includes(record.get('desensitizeWay')) ? 'always' : 'never',
        },
      },
      {
        name: 'sensitiveStrs',
        label: getLang('SENSITIZE_STR'),
        type: 'object',
        multiple: true,
        dynamicProps: {
          required: ({ record }) => record.get('desensitizeWay') === SENSITIVE,
          ignore: ({ record }) => (record.get('desensitizeWay') !== SENSITIVE ? 'always' : 'never'),
        },
      },
      {
        name: 'maskStr',
        label: getLang('MASK_STR'),
        type: 'string',
        lookupCode: MASK_STR,
        dynamicProps: {
          required: ({ record }) => [MASK, SENSITIVE].includes(record.get('desensitizeWay')),
          ignore: ({ record }) =>
            ![MASK, SENSITIVE].includes(record.get('desensitizeWay')) ? 'always' : 'never',
        },
      },
      {
        name: 'maskNum',
        label: <QuestionPopover text={getLang('MASK_NUM')} message={getLang('MASK_NUM_TIP')} />,
        type: 'number',
        step: 1,
        min: 1,
        max: 10,
        defaultValue: 6,
        dynamicProps: {
          required: ({ record }) => [MASK, SENSITIVE].includes(record.get('desensitizeWay')),
          ignore: ({ record }) =>
            ![MASK, SENSITIVE].includes(record.get('desensitizeWay')) ? 'always' : 'never',
        },
      },
      {
        name: 'maskStart',
        label: getLang('MASK_START'),
        type: 'number',
        step: 1,
        min: 1,
        dynamicProps: {
          required: ({ record }) =>
            [MASK, TRUNCATION].includes(record.get('desensitizeWay')) &&
            [FRONT, MIDDLE].includes(record.get('desensitizeType')),
          ignore: ({ record }) =>
            ![MASK, TRUNCATION].includes(record.get('desensitizeWay')) ||
            ![FRONT, MIDDLE].includes(record.get('desensitizeType'))
              ? 'always'
              : 'never',
        },
      },
      {
        name: 'maskEnd',
        label: getLang('MASK_END'),
        type: 'number',
        step: 1,
        min: 1,
        dynamicProps: {
          required: ({ record }) =>
            [MASK, TRUNCATION].includes(record.get('desensitizeWay')) &&
            [MIDDLE, BEHIND].includes(record.get('desensitizeType')),
          ignore: ({ record }) =>
            ![MASK, TRUNCATION].includes(record.get('desensitizeWay')) ||
            ![MIDDLE, BEHIND].includes(record.get('desensitizeType'))
              ? 'always'
              : 'never',
        },
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
        const { desensitizeRuleId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules/${desensitizeRuleId}`,
          method: 'GET',
          data: null,
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

const debugFormDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'testStr',
        type: 'string',
        label: getLang('TEST_DATA'),
      },
      {
        name: 'debugResult',
        type: 'string',
        label: getLang('DEBUG_RESULT'),
        readOnly: true,
      },
    ],
  };
};

const debugResultDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    selection: false,
    transport: {
      read: ({ data }) => {
        const { debugData } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules/debug`,
          method: 'POST',
          params: null,
          data: debugData,
        };
      },
    },
  };
};

const referenceTableDS = () => {
  return {
    autoQuery: false,
    pageSize: 10,
    selection: false,
    fields: [
      {
        name: 'tenantName',
        type: 'string',
        label: getLang('BELONG_TENANT'),
      },
      {
        name: 'castCode',
        label: getLang('CAST_CODE'),
        type: 'string',
      },
      {
        name: 'castName',
        label: getLang('CAST_NAME'),
        type: 'string',
      },
      {
        name: 'castRoot',
        label: getLang('CAST_ROOT'),
        type: 'string',
      },
      {
        name: 'castField',
        label: getLang('CAST_FIELD'),
        type: 'string',
      },
      {
        name: 'statusCode',
        label: getLang('STATUS'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { desensitizeRuleId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/desensitize-rules/${desensitizeRuleId}/reference`,
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

export { tableDS, basicFormDS, debugFormDS, debugResultDS, referenceTableDS };
