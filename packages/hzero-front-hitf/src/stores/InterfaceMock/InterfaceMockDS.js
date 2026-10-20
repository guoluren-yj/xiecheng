import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/interfaceMockLang';
import {
  EXECUTIVE_STRATEGY,
  TENANT,
  MOCK_TEMPLATE_TYPE,
  PARAM_VALUE_TYPE,
  HTTP_STATUS_CODE,
  MOCK_PARAM_PARENT,
} from '@/constants/CodeConstants';
import {
  EXECUTIVE_STRATEGY_CONSTANT,
  PARAM_TYPE_CONSTANT,
  TEMPLATE_TYPE_CONSTANT,
} from '@/constants/constants';
import QuestionPopover from '@/components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => ({
  autoQuery: true,
  pageSize: 10,
  selection: false,
  queryFields: [
    !isTenantRoleLevel() && {
      name: 'tenantLov',
      label: getLang('TENANT'),
      type: 'object',
      lovCode: TENANT,
      ignore: 'always',
    },
    !isTenantRoleLevel() && {
      name: 'tenantId',
      type: 'string',
      bind: 'tenantLov.tenantId',
    },
    {
      name: 'mockGroupCode',
      label: getLang('MOCK_GROUP_CODE'),
      type: 'string',
    },
    {
      name: 'mockGroupName',
      label: getLang('MOCK_GROUP_NAME'),
      type: 'string',
    },
    {
      name: 'mockStrategy',
      label: getLang('MOCK_STRATEGY'),
      type: 'string',
      lookupCode: EXECUTIVE_STRATEGY,
    },
  ],
  fields: [
    {
      name: 'tenantName',
      label: getLang('TENANT'),
      type: 'string',
    },
    {
      name: 'mockGroupCode',
      label: getLang('MOCK_GROUP_CODE'),
      type: 'string',
    },
    {
      name: 'mockGroupName',
      label: getLang('MOCK_GROUP_NAME'),
      type: 'string',
    },
    {
      name: 'mockStrategy',
      label: getLang('MOCK_STRATEGY'),
      type: 'string',
      lookupCode: EXECUTIVE_STRATEGY,
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
        url: `${HZERO_HITF}/v1${level}/mock-groups`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${HZERO_HITF}/v1${level}/mock-groups`,
        method: 'DELETE',
        data: data[0],
      };
    },
  },
});

const basicFormDS = (props) => {
  const { onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('TENANT'),
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
        name: 'mockGroupCode',
        label: getLang('MOCK_GROUP_CODE'),
        type: 'string',
        required: true,
      },
      {
        name: 'mockGroupName',
        label: getLang('MOCK_GROUP_NAME'),
        type: 'string',
        required: true,
      },
      {
        name: 'mockStrategy',
        label: getLang('MOCK_STRATEGY'),
        type: 'string',
        required: true,
        defaultValue: EXECUTIVE_STRATEGY_CONSTANT.ROUND_ROBIN,
        lookupCode: EXECUTIVE_STRATEGY,
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { mockGroupId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/mock-groups/${mockGroupId}`,
          data: null,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/mock-groups`,
          data: data[0],
          method: 'POST',
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/mock-groups`,
          data: data[0],
          method: 'PUT',
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

const mockTableDS = () => ({
  autoQuery: false,
  pageSize: 10,
  selection: false,
  queryFields: [
    {
      name: 'mockName',
      label: getLang('MOCK_NAME'),
      type: 'string',
    },
    {
      name: 'httpStatusCode',
      label: getLang('HTTP_STATUS_CODE'),
      type: 'string',
      lookupCode: HTTP_STATUS_CODE,
    },
    {
      name: 'templateType',
      label: getLang('TEMPLATE_TYPE'),
      type: 'string',
      lookupCode: MOCK_TEMPLATE_TYPE,
    },
  ],
  fields: [
    {
      name: 'mockName',
      label: getLang('MOCK_NAME'),
      type: 'string',
    },
    {
      name: 'httpStatusCode',
      label: getLang('HTTP_STATUS_CODE'),
      type: 'string',
      lookupCode: HTTP_STATUS_CODE,
    },
    {
      name: 'mockWeight',
      label: getLang('MOCK_WEIGHT'),
      type: 'string',
    },
    {
      name: 'templateType',
      label: getLang('TEMPLATE_TYPE'),
      type: 'string',
      lookupCode: MOCK_TEMPLATE_TYPE,
    },
    {
      name: 'defaultExecuteFlag',
      label: getLang('DEFAULT_EXECUTE_FLAG'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
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
      const { mockGroupId } = data;
      return {
        url: `${HZERO_HITF}/v1${level}/mocks/page/${mockGroupId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    update: ({ data }) => {
      const { testData } = data[0];
      const { mockId } = testData;
      return {
        url: `${HZERO_HITF}/v1${level}/mocks/test/${mockId}`,
        data: testData,
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${HZERO_HITF}/v1${level}/mocks`,
        method: 'DELETE',
        data: data[0],
      };
    },
  },
});

const mockFormDS = (props) => {
  const { mockStrategy, onFieldUpdate } = props;
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'mockCode',
        label: getLang('MOCK_CODE'),
        type: 'string',
      },
      {
        name: 'mockName',
        label: getLang('MOCK_NAME'),
        type: 'string',
        required: true,
      },
      {
        name: 'httpStatusCode',
        label: getLang('HTTP_STATUS_CODE'),
        type: 'string',
        defaultValue: '200',
        required: true,
        lookupCode: HTTP_STATUS_CODE,
      },
      {
        name: 'mockWeight',
        label: getLang('MOCK_WEIGHT'),
        type: 'number',
        defaultValue: 1,
        required: mockStrategy === EXECUTIVE_STRATEGY_CONSTANT.WEIGHT,
      },
      {
        name: 'templateType',
        label: getLang('TEMPLATE_TYPE'),
        type: 'string',
        lookupCode: MOCK_TEMPLATE_TYPE,
        required: true,
        defaultValue: TEMPLATE_TYPE_CONSTANT.JSON,
      },
      {
        name: 'defaultExecuteFlag',
        label: getLang('DEFAULT_EXECUTE_FLAG'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        required: mockStrategy === EXECUTIVE_STRATEGY_CONSTANT.SPECIFIED_INSTANCE,
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
      {
        name: 'mockTemplateResp',
        type: 'string',
        label: getLang('PAYLOAD'),
        dynamicProps: {
          required({ record }) {
            return record.get('templateType') === TEMPLATE_TYPE_CONSTANT.TXT;
          },
        },
      },
      {
        name: 'file',
        type: 'string',
        label: getLang('PAYLOAD_FILE'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { mockId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/mocks/${mockId}`,
          data: null,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/mocks`,
          data: data[0],
          method: 'POST',
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/mocks`,
          data: data[0],
          method: 'PUT',
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

const paramTableDS = (props = {}) => {
  const { defaultExpand = false } = props;
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    parentField: 'parentCode',
    idField: 'mockParamCode',
    checkField: 'check',
    fields: [
      {
        name: 'check',
        label: getLang('DELETE'),
        type: 'boolean',
      },
      {
        name: 'paramName',
        label: getLang('PARAM_NAME'),
        type: 'string',
      },
      {
        name: 'paramType',
        label: getLang('PARAM_TYPE'),
        type: 'string',
        lookupCode: PARAM_VALUE_TYPE,
      },
      {
        name: 'paramRule',
        label: getLang('PARAM_RULE'),
        type: 'string',
        help: (
          <>
            {getLang('PARAM_RULE_TIP')}(
            <a
              href="http://mockjs.com/0.1/#%E6%95%B0%E6%8D%AE%E6%A8%A1%E6%9D%BF%E5%AE%9A%E4%B9%89%20DTD"
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
            >
              {getLang('OFFICIAL_DOCUMENT')}
            </a>
            )
          </>
        ),
      },
      {
        name: 'paramValue',
        label: getLang('PARAM_VALUE'),
        type: 'string',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      destroy: ({ data }) => {
        const { mockId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/${mockId}/mock-params/batch-delete`,
          data,
          method: 'DELETE',
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (defaultExpand) {
          dataSet.forEach((record) => {
            const tempRecord = record;
            tempRecord.isExpanded = true;
          });
        }
      },
    },
  };
};

const paramFormDS = (props) => {
  const { mockId, httpParamType, actionType, onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'paramLov',
        label: getLang('PAREANT_PARAM'),
        type: 'object',
        lovCode: MOCK_PARAM_PARENT,
        ignore: 'always',
        lovPara: {
          httpParamType,
          actionType,
          mockId,
        },
      },
      {
        name: 'parentCode',
        type: 'string',
        bind: 'paramLov.mockParamCode',
      },
      {
        name: 'parentName',
        type: 'string',
        bind: 'paramLov.paramName',
      },
      {
        name: 'paramName',
        label: getLang('PARAM_NAME'),
        type: 'string',
        required: true,
      },
      {
        name: 'paramType',
        label: getLang('PARAM_TYPE'),
        type: 'string',
        lookupCode: PARAM_VALUE_TYPE,
        required: true,
      },
      {
        name: 'paramRule',
        label: (
          <QuestionPopover
            text={getLang('PARAM_RULE')}
            message={
              <>
                {getLang('PARAM_RULE_TIP')}(
                <a
                  href="http://mockjs.com/0.1/#%E6%95%B0%E6%8D%AE%E6%A8%A1%E6%9D%BF%E5%AE%9A%E4%B9%89%20DTD"
                  // eslint-disable-next-line react/jsx-no-target-blank
                  target="_blank"
                >
                  {getLang('OFFICIAL_DOCUMENT')}
                </a>
                )
              </>
            }
          />
        ),
        type: 'string',
      },
      {
        name: 'paramValue',
        label: getLang('PARAM_VALUE'),
        type: 'string',
        dynamicProps: {
          type({ record }) {
            const { STRING, NUMBER, BOOLEAN, DATE_TIME } = PARAM_TYPE_CONSTANT;
            switch (record.get('paramType')) {
              case BOOLEAN:
                return 'boolean';
              case NUMBER:
                return 'number';
              case DATE_TIME:
                return 'dateTime';
              case STRING:
              default:
                return 'string';
            }
          },
        },
        trueValue: 'true',
        falseValue: 'false',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { mockParamId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/${mockId}/mock-params/${mockParamId}`,
          data: null,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/${mockId}/mock-params`,
          data: data[0],
          method: 'POST',
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/${mockId}/mock-params`,
          data: data[0],
          method: 'PUT',
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

const importFormDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'dataStr',
        type: 'string',
        required: true,
      },
    ],
    transport: {
      create: ({ data }) => {
        const { mockId, ...otherData } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/${mockId}/mock-params/param-parse`,
          data: otherData,
          method: 'POST',
        };
      },
    },
  };
};

const mockDataDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    selection: false,
    paging: false,
    transport: {
      read: ({ data }) => {
        const { mockData } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/mocks/mock-data`,
          data: mockData,
          method: 'POST',
        };
      },
    },
  };
};

export {
  tableDS,
  basicFormDS,
  mockTableDS,
  mockFormDS,
  paramTableDS,
  paramFormDS,
  importFormDS,
  mockDataDS,
};
