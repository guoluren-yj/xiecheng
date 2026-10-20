import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/traceLogsLang';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const formDS = () => ({
  primaryKey: 'traceLogId',
  autoQuery: false,
  autoCreate: false,
  selection: false,
  paging: false,
  fields: [
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
      name: 'invokeKey',
      label: getLang('INVOKE_KEY'),
      type: 'string',
    },
    {
      name: 'clientName',
      label: getLang('CLIENT_NAME'),
      type: 'string',
    },
    {
      name: 'requestTime',
      label: getLang('REQUEST_TIME'),
      type: 'string',
    },
    {
      name: 'ip',
      label: getLang('IP'),
      type: 'string',
    },
    {
      name: 'requestMethodMeaning',
      label: getLang('REQUEST_METHOD'),
      type: 'string',
    },
    {
      name: 'requestUrl',
      label: getLang('REQUEST_URL'),
      type: 'string',
    },
    {
      name: 'responseTime',
      label: getLang('RESPONSE_TIME'),
      type: 'string',
    },
    {
      name: 'responseStatusMeaning',
      label: getLang('RESPONSE_STATUS'),
      type: 'string',
    },
    {
      name: 'sourceTypeMeaning',
      label: getLang('SOURCE_TYPE'),
      type: 'string',
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
      name: 'sourceDocumentIdStr',
      label: getLang('SOURCE_DOCUMENT_ID'),
      type: 'string',
    },
    {
      name: 'batchNum',
      label: getLang('BATCH_NUM'),
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
      name: '_download',
      label: getLang('MORE_LOG'),
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { traceLogId, invokeKey } = data;
      return {
        url: invokeKey
          ? `${HZERO_HITF}/v1${level}/trace-logs/invokeKey/detail`
          : `${HZERO_HITF}/v1${level}/trace-logs/${traceLogId}`,
        data: invokeKey ? { invokeKey } : null,
        method: 'GET',
      };
    },
  },
});

export { formDS };
