import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import {
  DYNAMIC_MQ_BINDER_TYPE,
  YES_OR_NO_FLAG,
  DYNAMIC_MQ_BINDING_TYPE,
  CHARSET,
  CONTENT_TYPE,
} from '@/constants/CodeConstants';
import getLang from '@/langs/dynamicMqConfigLang';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    autoQuery: true,
    pageSize: 10,
    primaryKey: 'binderId',
    queryFields: [
      {
        name: 'binderName',
        label: getLang('BINDER_NAME'),
        type: 'string',
      },
      {
        name: 'binderType',
        label: getLang('BINDER_TYPE'),
        type: 'string',
        lookupCode: DYNAMIC_MQ_BINDER_TYPE,
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLED_FLAG'),
        type: 'string',
        lookupCode: YES_OR_NO_FLAG,
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    fields: [
      {
        name: 'binderName',
        label: getLang('BINDER_NAME'),
        type: 'string',
      },
      {
        name: 'binderType',
        label: getLang('BINDER_TYPE'),
        type: 'string',
        lookupCode: DYNAMIC_MQ_BINDER_TYPE,
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLED_FLAG'),
        type: 'boolean',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-binders`,
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
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-binders/${_requestType}`,
          method: ['activation', 'deactivation'].includes(_requestType) ? 'PATCH' : 'PUT',
          data: ['activation', 'deactivation'].includes(_requestType) ? data : data[0],
        };
      },
    },
  };
};

const formDS = () => {
  return {
    autoQuery: false,
    paging: false,
    primaryKey: 'binderId',
    fields: [
      {
        name: 'binderName',
        label: getLang('BINDER_NAME'),
        type: 'string',
        required: true,
      },
      {
        name: 'binderType',
        label: getLang('BINDER_TYPE'),
        type: 'string',
        required: true,
        lookupCode: DYNAMIC_MQ_BINDER_TYPE,
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLED_FLAG'),
        type: 'boolean',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: (config) => {
        const { data } = config;
        const { binderId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-binders/${binderId}`,
          params: null,
          data: null,
          method: 'GET',
        };
      },
      update: ({ data }) => {
        const { dynamicBindings, ...other } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-binders`,
          method: 'PUT',
          data: other,
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-binders`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

const mqBinderTableDS = () => {
  return {
    autoQuery: false,
    pageSize: 10,
    selection: false,
    primaryKey: 'bindingId',
    queryFields: [
      {
        name: 'bindingName',
        label: getLang('BINDING_NAME'),
        type: 'string',
      },
      {
        name: 'destination',
        label: getLang('DESTINATION'),
        type: 'string',
      },
      {
        name: 'bindingGroup',
        label: getLang('BINDING_GROUP'),
        type: 'string',
      },
      {
        name: 'contentType',
        label: getLang('CONTENT_TYPE'),
        type: 'string',
        lookupCode: CONTENT_TYPE,
      },
      {
        name: 'charset',
        label: getLang('CHARSET'),
        type: 'string',
        lookupCode: CHARSET,
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    fields: [
      {
        name: 'bindingName',
        label: getLang('BINDING_NAME'),
        type: 'string',
        required: true,
      },
      {
        name: 'bindingType',
        label: getLang('BINDING_TYPE'),
        type: 'string',
        lookupCode: DYNAMIC_MQ_BINDING_TYPE,
        required: true,
      },
      {
        name: 'destination',
        label: getLang('DESTINATION'),
        type: 'string',
        required: true,
      },
      {
        name: 'bindingGroup',
        label: getLang('BINDING_GROUP'),
        type: 'string',
        required: true,
      },
      {
        name: 'contentType',
        label: getLang('CONTENT_TYPE'),
        type: 'string',
        lookupCode: CONTENT_TYPE,
      },
      {
        name: 'charset',
        label: getLang('CHARSET'),
        type: 'string',
        lookupCode: CHARSET,
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLED_FLAG'),
        type: 'boolean',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-bindings`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-bindings`,
          method: 'POST',
          data,
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-bindings`,
          method: 'PUT',
          data,
        };
      },
    },
  };
};

const paramOptionTableDS = () => {
  return {
    autoQuery: false,
    pageSize: 10,
    selection: false,
    primaryKey: 'optionId',
    queryFields: [
      {
        name: 'propertyKey',
        label: getLang('PROPERTY_KEY'),
        type: 'string',
      },
      {
        name: 'propertyValue',
        label: getLang('PROPERTY_VALUE'),
        type: 'string',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    fields: [
      {
        name: 'propertyKey',
        label: getLang('PROPERTY_KEY'),
        type: 'string',
        required: true,
      },
      {
        name: 'propertyValue',
        label: getLang('PROPERTY_VALUE'),
        type: 'string',
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLED_FLAG'),
        type: 'boolean',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-options`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-options`,
          method: 'POST',
          data,
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-options`,
          method: 'PUT',
          data,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-options`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

const sendMessageFormDS = () => {
  return {
    autoCreate: true,
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'message',
        label: getLang('MESSAGE'),
        type: 'string',
        required: true,
      },
    ],
    transport: {
      create: ({ data }) => {
        const { channelName, message } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/dynamic-mq-bindings/message-sending`,
          method: 'POST',
          params: { channelName, message },
          data: null,
        };
      },
    },
  };
};

export { tableDS, formDS, mqBinderTableDS, paramOptionTableDS, sendMessageFormDS };
