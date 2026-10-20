import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import moment from 'moment';
import notification from 'hzero-front/lib/utils/notification';
import QuestionPopover from '@/components/QuestionPopover';
import getLang from '@/langs/traceLogsLang';
import {
  SOURCE_TYPE,
  RESPONSE_STATUS,
  TENANT,
  CLEAR_TYPE,
  BUSINESS_STATE,
  SOURCE,
} from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const levelUrl = isTenantRoleLevel() ? `/${organizationId}` : '';

const traceLogFields = () => [
  {
    name: 'tenantName',
    label: getLang('TENANT'),
    type: 'string',
  },
  { name: 'traceLogId', type: 'string' },
  { name: 'traceKey', type: 'string' },
  { name: 'parentTraceKey', type: 'string', parentFieldName: 'traceKey' },
  {
    name: 'sourceCode',
    label: getLang('SOURCE_CODE'),
    type: 'string',
  },
  {
    name: 'sourceName',
    label: getLang('SOURCE_NAME'),
    type: 'string',
  },
  {
    name: 'clientName',
    label: getLang('CLIENT_NAME'),
    type: 'string',
  },
  {
    name: 'requestUrl',
    label: getLang('REQUEST_URL'),
    type: 'string',
  },
  {
    name: 'sourceType',
    label: getLang('SOURCE_TYPE'),
    type: 'string',
    lookupCode: SOURCE_TYPE,
  },
  {
    name: 'sourceSystem',
    label: getLang('SOURCE_SYSTEM'),
    type: 'string',
  },
  {
    name: 'batchNum',
    label: getLang('BATCH_NUM'),
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
    type: 'string',
  },
  {
    name: 'responseStatus',
    label: getLang('RESPONSE_STATUS'),
    type: 'string',
    lookupCode: RESPONSE_STATUS,
  },
  {
    name: 'sourceDocumentNum',
    label: getLang('SOURCE_DOCUMENT_NUM'),
    type: 'string',
  },
  {
    name: 'sourceDocumentIdStr',
    label: getLang('SOURCE_DOCUMENT_ID'),
    type: 'string',
  },
  {
    name: 'businessStateMeaning',
    label: getLang('BUSINESS_STATE'),
    type: 'string',
  },
  {
    name: 'asyncFlagMeaning',
    label: getLang('ASYNC_FLAG'),
    type: 'string',
  },
  {
    name: 'reqParamModifyFlagMeaning',
    label: getLang('MODIFY_FLAG'),
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
];

const traceLogQueryFields = (largePacketQuery = false) =>
  [
    {
      name: 'tenantLov',
      label: getLang('TENANT'),
      type: 'object',
      lovCode: TENANT,
      ignore: 'always',
    },
    {
      name: 'tenantId',
      label: getLang('TENANT'),
      type: 'number',
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
      name: 'sourceName',
      label: getLang('SOURCE_NAME'),
      type: 'string',
    },
    {
      name: 'sourceCode',
      label: getLang('SOURCE_CODE'),
      type: 'string',
    },
    {
      name: 'clientName',
      label: getLang('CLIENT_NAME'),
      type: 'string',
    },
    {
      name: 'requestUrl',
      label: getLang('REQUEST_URL'),
      type: 'string',
    },
    {
      name: 'sourceType',
      label: getLang('SOURCE_TYPE'),
      type: 'string',
      lookupCode: SOURCE_TYPE,
    },
    {
      name: 'sourceSystem',
      label: getLang('SOURCE_SYSTEM'),
      type: 'string',
    },
    {
      name: 'sourceDocumentNum',
      label: getLang('SOURCE_DOCUMENT_NUM'),
      type: 'string',
    },
    {
      name: 'sourceDocumentId',
      label: getLang('SOURCE_DOCUMENT_ID'),
      type: 'string',
    },
    {
      name: 'batchNum',
      label: getLang('BATCH_NUM'),
      type: 'string',
    },
    {
      name: 'responseStatus',
      label: getLang('RESPONSE_STATUS'),
      type: 'string',
      lookupCode: RESPONSE_STATUS,
    },
    {
      name: 'businessState',
      label: getLang('BUSINESS_STATE'),
      type: 'string',
      lookupCode: BUSINESS_STATE,
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
    largePacketQuery && {
      name: 'reqBodyParam',
      label: getLang('REQ_PARAM'),
      type: 'string',
    },
    largePacketQuery && {
      name: 'respContent',
      label: getLang('RESP_CONTENT'),
      type: 'string',
    },
  ].filter((item) => {
    if (isTenantRoleLevel()) {
      return item.name !== 'tenantLov' && item.name !== 'tenantId';
    } else {
      return true;
    }
  });

const traceLogDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/trace-logs/tree`,
        params: { ...data, ...params },
        method: 'get',
      };
    },
  },
  primaryKey: 'traceLogId',
  autoQuery: true,
  paging: 'server',
  pageSize: 10,
  parentField: 'parentTraceKey',
  idField: 'traceKey',
  selection: false,
  fields: traceLogFields(),
  queryFields: traceLogQueryFields(),
});

const clearLogDS = (props) => {
  const { onFieldUpdate } = props;
  return {
    autoCreate: true,
    fields: [
      {
        name: 'tenantLov',
        label: getLang('TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        noCache: true,
      },
      { name: 'tenantId', type: 'string', bind: 'tenantLov.tenantId' },
      {
        name: 'clearType',
        type: 'string',
        required: true,
        lookupCode: CLEAR_TYPE,
        label: getLang('CLEAR_TYPE'),
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
      create: ({ data }) => ({
        url: `${HZERO_HITF}/v1${levelUrl}/trace-logs/clear-logs`,
        data: data[0],
        method: 'DELETE',
      }),
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

const traceLogListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/trace-logs`,
        params: { ...data, ...params },
        method: 'get',
      };
    },
  },
  primaryKey: 'traceLogId',
  autoQuery: true,
  paging: 'server',
  pageSize: 10,
  parentField: 'parentTraceKey',
  idField: 'traceKey',
  selection: false,
  fields: traceLogFields(),
  queryFields: traceLogQueryFields(),
});

const retryFormDS = () => ({
  autoCreate: true,
  autoQuery: false,
  fields: [
    {
      name: 'reqBodyParam',
      type: 'string',
      required: true,
    },
  ],
  transport: {
    create: ({ data }) => ({
      url: `${HZERO_HITF}/v1${levelUrl}/trace-logs/retry`,
      data: data[0],
      method: 'POST',
    }),
  },
});

export { traceLogDS, clearLogDS, traceLogListDS, traceLogQueryFields, retryFormDS };
