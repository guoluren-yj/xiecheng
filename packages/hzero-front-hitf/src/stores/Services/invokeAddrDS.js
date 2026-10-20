import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  INVOKE_VERSION,
  INVOKE_URL_VERSION,
  SERVICE_TYPE,
  INTERFACE_STATUS,
  DS_REQUEST_METHOD,
} from '@/constants/CodeConstants';
import getLang from '@/langs/serviceLang';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const invokeAddrTableDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    pageSize: 10,
    selection: false,
    queryFields: [
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'publishType',
        label: getLang('PUBLISH_TYPE'),
        type: 'string',
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'status',
        label: getLang('STATUS'),
        type: 'string',
        lookupCode: INTERFACE_STATUS,
      },
    ],
    fields: [
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'publishType',
        label: getLang('PUBLISH_TYPE'),
        type: 'string',
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'status',
        label: getLang('STATUS'),
        type: 'string',
        lookupCode: INTERFACE_STATUS,
      },
      {
        name: 'publishUrl',
        label: getLang('INVOKE_ADDR'),
        type: 'string',
      },
      {
        name: 'formatVersion',
        label: getLang('CURRENT_VERSION'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { interfaceServerId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/${interfaceServerId}/invoke-addresses`,
          method: 'GET',
          params: {
            ...params,
            ...data,
          },
        };
      },
    },
  };
};

const requestPayloadDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    fields: [
      {
        name: 'invokeVersion',
        type: 'string',
        defaultValue: 'v1',
        lookupCode: INVOKE_VERSION,
      },
      {
        name: 'invokeUrlVersion',
        type: 'string',
        defaultValue: 'v1',
        lookupCode: INVOKE_URL_VERSION,
      },
      {
        name: 'requestPayload',
        type: 'string',
      },
      {
        name: 'requestMethod',
        type: 'string',
        defaultValue: 'GET',
        lookupCode: DS_REQUEST_METHOD,
      },
    ],
  };
};

const readRequestPayloadDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    paging: false,
    transport: {
      read: (config) => {
        const { data } = config;
        const { requestParams } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interface-servers/request-payload`,
          data: requestParams,
          method: 'GET',
        };
      },
    },
  };
};

export { invokeAddrTableDS, requestPayloadDS, readRequestPayloadDS };
