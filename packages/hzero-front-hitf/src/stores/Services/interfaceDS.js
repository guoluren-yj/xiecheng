import { HZERO_HITF, HZERO_HFLE } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getResponse,
} from 'hzero-front/lib/utils/utils';
import { isUndefined } from 'lodash';
import { CODE } from 'hzero-front/lib/utils/regExp';
import {
  REQUEST_METHOD,
  REQUEST_HEADER,
  SERVICE_TYPE,
  INTERFACE_STATUS,
  SOAP_VERSION,
  DATABASE_TYPE,
  DATA_SOURCE,
  EXPRESSION_TYPE,
  SVC_COL_TYPE,
  SVC_MODEL_OPERATOR,
  SVC_PARAM_TYPE,
  ALERT_CODE,
  TIME_ZONE,
  DATE_FORMAT,
  MOCK_GROUP_LIST,
  SVC_MODEL_EXECUTION_TYPE,
  SOAP_REQUEST_TEMPLATE,
} from '@/constants/CodeConstants';
import { SERVICE_CONSTANT, EXPR_TYPE_CONSTANTS, SOAP11_REQUEST } from '@/constants/constants';
import getLang from '@/langs/serviceLang';
import QuestionPopover from '@/components/QuestionPopover';
import React from 'react';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const historyDS = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    primaryKey: 'interfaceHisId',
    fields: [
      {
        name: 'interfaceHisId',
        type: 'string',
      },
      {
        name: 'version',
        type: 'number',
        label: getLang('HISTORY_VERSION'),
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const { interfaceId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interface-hiss/${interfaceId}/history`,
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

function basicFormDS(props) {
  const {
    currentInterfaceType,
    tenantId,
    soapVersion,
    requestHeader,
    onFieldUpdate = () => {},
  } = props;
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: false,
    fields: [
      {
        name: 'interfaceCode',
        label: (
          <QuestionPopover
            text={getLang('INTERFACE_CODE')}
            message={getLang('INTERFACE_CODE_TIP')}
          />
        ),
        type: 'string',
        required: true,
        pattern: CODE,
        defaultValidationMessages: {
          patternMismatch: getLang('CODE'),
        },
      },
      {
        name: 'interfaceName',
        label: (
          <QuestionPopover
            text={getLang('INTERFACE_NAME')}
            message={getLang('INTERFACE_NAME_TIP')}
          />
        ),
        type: 'string',
        required: true,
      },
      {
        name: 'interfaceUrl',
        label: (
          <QuestionPopover text={getLang('INTERFACE_URL')} message={getLang('INTERFACE_URL_TIP')} />
        ),
        type: 'string',
        dynamicProps: () => ({
          required:
            currentInterfaceType !== SERVICE_CONSTANT.DS &&
            currentInterfaceType !== SERVICE_CONSTANT.COMPOSITE &&
            currentInterfaceType !== SERVICE_CONSTANT.FILE,
        }),
      },
      {
        name: 'soapVersion',
        label: (
          <QuestionPopover
            text={getLang('SOAP_VERSION')}
            message={getLang('SOAP_VERSION_TOOLTIP')}
          />
        ),
        type: 'string',
        lookupCode: SOAP_VERSION,
        defaultValue: soapVersion,
      },
      {
        name: 'soapRequestTemplate',
        label: (
          <QuestionPopover
            text={getLang('SOAP_REQUEST_TEMPLATE')}
            message={getLang('SOAP_REQUEST_TEMPLATE_TIP')}
          />
        ),
        type: 'string',
        lookupCode: SOAP_REQUEST_TEMPLATE,
      },
      {
        name: 'requestMethod',
        label: (
          <QuestionPopover
            text={getLang('REQUEST_METHOD')}
            message={getLang('REQUEST_METHOD_TIP')}
          />
        ),
        type: 'string',
        lookupCode: REQUEST_METHOD,
      },
      {
        name: 'requestHeader',
        label: (
          <QuestionPopover
            text={getLang('REQUEST_HEADER')}
            message={getLang('REQUEST_HEADER_TIP')}
          />
        ),
        type: 'string',
        lookupCode: REQUEST_HEADER,
        defaultValue: requestHeader,
      },
      {
        name: 'publishType',
        label: (
          <QuestionPopover text={getLang('PUBLISH_TYPE')} message={getLang('PUBLISH_TYPE_TIP')} />
        ),
        type: 'string',
        required: true,
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'soapAction',
        label: (
          <QuestionPopover text={getLang('SOAP_ACTION')} message={getLang('SOAP_ACTION_TIP')} />
        ),
        type: 'string',
        dynamicProps: {
          required: ({ record }) => SOAP11_REQUEST.VERSION === record.get('soapVersion'),
        },
      },
      {
        name: 'bodyNamespaceFlag',
        label: (
          <QuestionPopover
            text={getLang('BODY_NAMESPACE_FLAG')}
            message={getLang('BODY_NAMESPACE_FLAG_TIP')}
          />
        ),
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
        type: 'boolean',
      },
      {
        name: 'asyncFlag',
        label: <QuestionPopover text={getLang('ASYNC_FLAG')} message={getLang('ASYNC_FLAG_TIP')} />,
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        type: 'boolean',
      },
      {
        name: 'transmissionFileFlag',
        label: (
          <QuestionPopover
            text={getLang('TRANSMISSION_FILE_FLAG')}
            message={getLang('TRANSMISSION_FILE_FLAG_TIP')}
          />
        ),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        type: 'boolean',
      },
      {
        name: 'mappingClass',
        label: (
          <QuestionPopover text={getLang('MAPPING_CLASS')} message={getLang('MAPPING_CLASS_TIP')} />
        ),
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'status',
        label: getLang('STATUS'),
        type: 'string',
        required: true,
        lookupCode: INTERFACE_STATUS,
      },
      {
        name: 'httpConfig',
        label: (
          <QuestionPopover text={getLang('HTTP_CONFIG')} message={getLang('HTTP_CONFIG_TIP')} />
        ),
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'encrypt',
        label: getLang('ENCRYPT_CONFIG'),
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'customAttr',
        label: getLang('CUSTOM_ATTR'),
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'customLog',
        label: <QuestionPopover text={getLang('CUSTOM_LOG')} code="HITF.SERVICES.CUSTOM_LOG" />,
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'requestTransformId',
        type: 'string',
        label: (
          <QuestionPopover
            text={getLang('REQUEST_TRANSFORM')}
            code="HITF.SERVICES.REQUEST_MAPPING"
          />
        ),
      },
      {
        name: 'responseTransformId',
        type: 'string',
        label: (
          <QuestionPopover
            text={getLang('RESPONSE_TRANSFORM')}
            code="HITF.SERVICES.RESPONSE_MAPPING"
          />
        ),
      },
      {
        name: 'requestCastId',
        type: 'string',
        label: <QuestionPopover text={getLang('REQUEST_CAST')} code="HITF.SERVICES.REQUEST_CAST" />,
      },
      {
        name: 'responseCastId',
        type: 'string',
        label: (
          <QuestionPopover text={getLang('RESPONSE_CAST')} code="HITF.SERVICES.RESPONSE_CAST" />
        ),
      },
      {
        name: 'errorResponseCast',
        type: 'string',
        label: (
          <QuestionPopover
            text={getLang('ERRPR_RESPONSE_MAPPING')}
            code="HITF.SERVICES.ERR_RESP_MAPPING"
          />
        ),
      },
      {
        name: 'publishUrl',
        label: getLang('PUBLISH_URL'),
        type: 'string',
      },
      {
        name: 'formatVersion',
        type: 'string',
        label: getLang('CURRENT_VERSION'),
      },
      {
        name: 'historyVersion',
        type: 'number',
        label: getLang('HISTORY_VERSION'),
      },
      {
        name: 'timeZoneLov',
        label: <QuestionPopover text={getLang('TIME_ZONE')} code="HITF.SERVICES.TIME_ZONE" />,
        type: 'object',
        ignore: 'always',
        lovCode: TIME_ZONE,
      },
      {
        name: 'timeZone',
        type: 'string',
        bind: 'timeZoneLov.value',
      },
      {
        name: 'timeZoneMeaning',
        type: 'string',
        bind: 'timeZoneLov.meaning',
      },
      {
        name: 'dateTimeFormat',
        label: (
          <QuestionPopover
            text={getLang('DATE_TIME_FORMAT')}
            message={getLang('DATE_TIME_FORMAT_TIP')}
          />
        ),
        type: 'string',
        lookupCode: DATE_FORMAT,
      },
      {
        name: 'mockFlag',
        label: getLang('MOCK_FLAG'),
        type: 'boolean',
      },
      {
        name: 'mockGroupLov',
        label: getLang('MOCK_GROUP'),
        type: 'object',
        ignore: 'always',
        lovCode: MOCK_GROUP_LIST,
        lovPara: { tenantId },
        dynamicProps: {
          required: ({ record }) => record.get('mockFlag'),
        },
      },
      {
        name: 'mockGroupId',
        bind: 'mockGroupLov.mockGroupId',
      },
      {
        name: 'mockGroupName',
        bind: 'mockGroupLov.mockGroupName',
      },
    ],
    transport: {
      read: (config) => {
        const { dataSet, data } = config;
        const { interfaceId, version, history } = data;
        if (history) {
          dataSet.setQueryParameter('history', false);
          return {
            url: `${HZERO_HITF}/v1${level}/interfaces/${interfaceId}/view/${version}`,
            method: 'GET',
            params: {
              ...data,
            },
          };
        }
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/${interfaceId}`,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        const { interfaceServerId } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/${interfaceServerId}`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        const { interfaceServerId } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/${interfaceServerId}`,
          method: 'POST',
          data: data[0],
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
}

const mainConfigFormDS = (props = {}) => {
  const { onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: true,
    fields: [
      {
        name: 'dataSourceLov',
        label: getLang('DATASOURCE_LOV'),
        type: 'object',
        required: true,
        lovCode: DATA_SOURCE,
        ignore: 'always',
        noCache: true,
        valueField: 'datasourceId',
        textField: 'datasourceCode',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'dsType',
        label: getLang('DS_TYPE'),
        type: 'string',
        required: true,
        lookupCode: DATABASE_TYPE,
        bind: 'dataSourceLov.dbType',
      },
      {
        name: 'datasourceId',
        type: 'string',
        bind: 'dataSourceLov.datasourceId',
      },
      {
        name: 'datasourceCode',
        type: 'string',
        bind: 'dataSourceLov.datasourceCode',
      },
      {
        name: 'dsPurposeCode',
        type: 'string',
        bind: 'dataSourceLov.dsPurposeCode',
      },
      {
        name: 'exprType',
        label: getLang('EXPR_TYPE'),
        type: 'string',
        required: true,
        lookupCode: EXPRESSION_TYPE,
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
      {
        name: 'exprContent',
        label: getLang('VIEW'),
        type: 'string',
        required: true,
        valueField: 'value',
        textField: 'meaning',
        noCache: true,
        dynamicProps: {
          lovPara: ({ record }) => ({
            datasourceId: record.get('datasourceId'),
            datasourceCode: record.get('datasourceCode'),
            dsPurposeCode: record.get('dsPurposeCode'),
          }),
        },
        lookupAxiosConfig: ({ params }) => {
          return {
            url: params.datasourceId
              ? `${HZERO_HITF}/v1${level}/model-configs/show-table/${params.datasourceId}`
              : undefined,
            method: 'GET',
            transformResponse: (data) => {
              try {
                const jsonData = JSON.parse(data);
                if (jsonData && !jsonData.failed) {
                  const formatData = jsonData.map((item) => ({ value: item, meaning: item }));
                  return formatData;
                } else {
                  getResponse(jsonData);
                }
                // eslint-disable-next-line no-empty
              } catch (error) {}
              return data;
            },
          };
        },
      },
      {
        name: 'executionType',
        label: (
          <QuestionPopover text={getLang('EXECUTION_TYPE')} code="HITF.SERVICES.EXECUTION_TYPE" />
        ),
        type: 'string',
        required: true,
        multiple: true,
        lookupCode: SVC_MODEL_EXECUTION_TYPE,
        dynamicProps: {
          disabled: ({ record }) => record.get('exprType') === EXPR_TYPE_CONSTANTS.SQL,
        },
      },
    ],
    transport: {
      read: ({ data }) => {
        const { interfaceId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/model-configs/${interfaceId}`,
          method: 'GET',
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

function attrListDS(props) {
  const { onAttrLoad = () => {}, onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    primaryKey: 'fieldId',
    paging: false,
    selection: false,
    fields: [
      {
        name: 'resultFlag',
        type: 'boolean',
        defaultValue: false,
        help: getLang('RESULT_FLAG_TIP'),
      },
      {
        name: 'queryFlag',
        type: 'boolean',
        defaultValue: false,
        help: getLang('QUERY_FLAG_TIP'),
      },
      {
        name: 'updateFlag',
        type: 'boolean',
        defaultValue: false,
        help: getLang('UPDATE_FLAG_TIP'),
      },
      {
        name: 'deleteFlag',
        type: 'boolean',
        defaultValue: false,
        help: getLang('DELETE_FLAG_TIP'),
      },
      {
        name: 'key',
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: getLang('FIELD_NAME'),
      },
      {
        name: 'fieldType',
        type: 'string',
        defaultValue: 'VARCHAR',
        label: getLang('FIELD_TYPE'),
        lookupCode: SVC_COL_TYPE,
        required: true,
      },
      {
        name: 'fieldExpr',
        type: 'string',
        label: getLang('FIELD_EXPR'),
        required: true,
      },
      {
        name: 'seqNum',
        type: 'number',
        label: getLang('SEQ_NUM'),
        min: 0,
        step: 1,
      },
      {
        name: 'fieldDesc',
        type: 'string',
        label: getLang('FIELD_DESC'),
      },
      {
        name: 'privacyLevel',
        type: 'string',
        defaultValue: 0,
      },
    ],
    events: {
      load: onAttrLoad,
      update: onFieldUpdate,
    },
    transport: {
      read: ({ data, params }) => ({
        url: `${HZERO_HITF}/v1${level}/model-fields`,
        method: 'GET',
        params: { ...data, ...params, page: -1 },
      }),
      create: ({ data }) => ({
        url: `${HZERO_HITF}/v1${level}/model-fields/batch-save`,
        method: 'POST',
        data,
      }),
      update: ({ data }) => ({
        url: `${HZERO_HITF}/v1${level}/model-fields/batch-save`,
        method: 'POST',
        data,
      }),
      destroy: ({ data }) => ({
        url: `${HZERO_HITF}/v1${level}/model-fields/batch-delete`,
        method: 'DELETE',
        data,
      }),
    },
  };
}

function paramListDS(props = {}) {
  const { onFieldUpdate = () => {} } = props;
  return {
    selection: false,
    autoQuery: false,
    primaryKey: 'paramId',
    autoQueryAfterSubmit: false,
    paging: false,
    fields: [
      {
        name: 'key',
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'paramName',
        type: 'string',
        label: getLang('PARAM_NAME'),
        unique: true,
        required: true,
      },
      {
        name: 'paramType',
        type: 'string',
        label: getLang('PARAM_TYPE'),
        lookupCode: SVC_PARAM_TYPE,
        required: true,
      },
      {
        name: 'fieldObj',
        type: 'object',
        label: getLang('BIND_FIELD_NAME'),
        ignore: 'always',
        valueField: 'fieldId',
        textField: 'fieldName',
        required: true,
      },
      {
        name: 'fieldId',
        type: 'string',
        bind: 'fieldObj.fieldId',
      },
      {
        name: 'fieldName',
        type: 'string',
        bind: 'fieldObj.fieldName',
        label: getLang('BIND_FIELD_NAME'),
      },
      {
        name: 'seqNum',
        type: 'number',
        label: getLang('SEQ_NUM'),
        bind: 'fieldObj.seqNum',
        min: 0,
        step: 1,
      },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: getLang('REQUIRED_FLAG'),
        required: false,
        defaultValue: false,
      },
      {
        name: 'operatorCode',
        type: 'string',
        label: getLang('OPERATOR_CODE'),
        lookupCode: SVC_MODEL_OPERATOR,
        defaultValue: 'E',
      },
      {
        name: 'defaultValue',
        type: 'string',
        label: getLang('DEFAULT_VALUE'),
      },
      {
        name: 'paramDesc',
        type: 'string',
        bind: 'fieldObj.fieldDesc',
        label: getLang('PARAM_DESC'),
      },
    ],
    events: {
      update: onFieldUpdate,
    },
    transport: {
      read: ({ params, data }) => ({
        url: `${HZERO_HITF}/v1${level}/model-request-params`,
        method: 'GET',
        params: { ...params, ...data },
      }),
    },
  };
}

const assertionDS = (props) => {
  const {
    onAddAssertionFormItem,
    onRemoveAssertionFormItem,
    onFiledUpdate,
    onLoadAssertionForm,
  } = props;
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'subject',
        label: getLang('KEY'),
        type: 'string',
        required: true,
      },
      {
        name: 'field',
        label: getLang('VALUE'),
        type: 'string',
      },
      {
        name: 'condition',
        label: getLang('TYPE'),
        type: 'string',
        required: true,
      },
      {
        name: 'expectation',
        label: getLang('EXPECTATION'),
        type: 'string',
        required: true,
      },
    ],
    events: {
      create: ({ dataSet }) => onAddAssertionFormItem(dataSet),
      remove: ({ dataSet }) => onRemoveAssertionFormItem(dataSet),
      update: ({ dataSet, record, name, value }) => onFiledUpdate(dataSet, record, name, value),
      load: ({ dataSet }) => onLoadAssertionForm(dataSet),
    },
  };
};

const retryFormDS = () => {
  return {
    fields: [
      {
        name: 'retryTimes',
        label: getLang('RETRY_TIMES'),
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'retryInterval',
        label: getLang('RETRY_INTERVAL'),
        type: 'number',
        defaultValue: 1,
      },
    ],
  };
};

const businessAssertionFormDS = () => {
  return {
    fields: [
      {
        name: 'alertCodeLov',
        label: getLang('ALERT_LOV'),
        type: 'object',
        lovCode: ALERT_CODE,
        ignore: 'always',
        valueField: 'alertCode',
        textField: 'alertCode',
      },
      {
        name: 'alertCode',
        type: 'string',
        defaultValue: 'HORC_ORCH_TIMEOUT',
        bind: 'alertCodeLov.alertCode',
      },
    ],
  };
};

const fileConfigDS = (props = {}) => {
  const { onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    autoCreate: true,
    primaryKey: 'fileConfigId',
    fields: [
      {
        name: 'fileConfigId',
        type: 'string',
      },
      {
        name: 'protocol',
        type: 'string',
        label: getLang('FILE_PROTOCOL'),
        lookupCode: 'HITF.FILE_PROTOCOL',
        required: true,
        defaultValue: 'FTP',
      },
      {
        name: 'path',
        type: 'string',
        required: true,
        label: getLang('FILE_PATH'),
        dynamicProps: {
          required: ({ record }) => ['SFTP', 'FTP', 'LOCAL_FILE'].includes(record.get('protocol')),
        },
      },
      {
        name: 'fileName',
        type: 'string',
        label: (
          <QuestionPopover
            text={getLang('FILE_FILE_NAME')}
            message={getLang('FILE_FILE_NAME_TIP')}
          />
        ),
      },
      {
        name: 'archivePath',
        type: 'string',
        label: getLang('FILE_ARCHIVE_PATH'),
        dynamicProps: {
          required: ({ record }) =>
            record.get('enableArchive') && record.get('protocol') !== 'FILE_SERVER',
        },
        defaultValue: './archive',
      },
      {
        name: 'enableArchive',
        type: 'boolean',
        label: (
          <QuestionPopover
            text={getLang('FILE_ENABLE_ARCHIVE')}
            message={getLang('FILE_ENABLE_ARCHIVE_TIP')}
          />
        ),
        defaultValue: false,
      },
      {
        name: 'enableRepeatColumn',
        type: 'boolean',
        label: (
          <QuestionPopover
            text={getLang('FILE_ENABLE_REPEAT_COLUMN')}
            message={getLang('FILE_ENABLE_REPEAT_COLUMN_TIP')}
          />
        ),
        defaultValue: false,
      },
      {
        name: 'authType',
        type: 'string',
        label: getLang('FILE_PROTOCOL_AUTH'),
        lookupCode: 'HITF.FILE_PROTOCOL_AUTH',
        defaultValue: 'PASSWORD',
        dynamicProps: {
          required: ({ record }) => record.get('protocol') === 'SFTP',
        },
      },
      {
        name: 'host',
        type: 'string',
        label: (
          <QuestionPopover
            text={getLang('FILE_PROTOCOL_HOSTNAME')}
            message={getLang('FILE_PROTOCOL_HOSTNAME_TIP')}
          />
        ),
        dynamicProps: {
          required: ({ record }) => ['FTP', 'SFTP'].includes(record.get('protocol')),
        },
      },
      {
        name: 'port',
        type: 'number',
        label: (
          <QuestionPopover
            text={getLang('FILE_PROTOCOL_PORT')}
            message={getLang('FILE_PROTOCOL_PORT_TIP')}
          />
        ),
        dynamicProps: {
          required: ({ record }) => ['FTP', 'SFTP'].includes(record.get('protocol')),
        },
        defaultValue: 21,
      },
      {
        name: 'username',
        type: 'string',
        label: getLang('FILE_PROTOCOL_USERNAME'),
        dynamicProps: {
          required: ({ record }) => ['FTP', 'SFTP'].includes(record.get('protocol')),
        },
      },
      {
        name: 'password',
        type: 'string',
        label: getLang('FILE_PROTOCOL_PASSWORD'),
        dynamicProps: {
          required: ({ record }) =>
            isUndefined(record.get('fileConfigId')) &&
            ((record.get('protocol') === 'SFTP' && record.get('authType') === 'PASSWORD') ||
              record.get('protocol') === 'FTP'),
        },
      },
      {
        name: 'privateKey',
        type: 'string',
        label: getLang('FILE_PROTOCOL_PRIVATE_KEY'),
        dynamicProps: {
          required: ({ record }) =>
            record.get('protocol') === 'SFTP' && record.get('authType') === 'PRIVATE_KEY',
        },
      },
      {
        name: 'passphrase',
        type: 'string',
        label: (
          <QuestionPopover
            text={getLang('FILE_PROTOCOL_PASSPHRASE')}
            message={getLang('FILE_PROTOCOL_PASSPHRASE_TIP')}
          />
        ),
      },
      {
        name: 'file',
        type: 'object',
        label: (
          <QuestionPopover
            text={getLang('FILE_PROTOCOL_PRIVATE_KEY')}
            message={getLang('FILE_PROTOCOL_PRIVATE_KEY_TIP')}
          />
        ),
      },
      {
        name: 'batchId',
        label: (
          <QuestionPopover text={getLang('FILE_BATCH_ID')} message={getLang('FILE_BATCH_ID_TIP')} />
        ),
        type: 'string',
      },
      {
        name: 'bucketName',
        label: (
          <QuestionPopover
            text={getLang('FILE_BUCKET_NAME')}
            message={getLang('FILE_BUCKET_NAME_TIP')}
          />
        ),
        type: 'string',
        dynamicProps: {
          required({ record }) {
            return record.get('protocol') === 'FILE_SERVER';
          },
        },
      },
      {
        name: 'storeType',
        label: getLang('FILE_STORE_TYPE'),
        type: 'string',
        lookupCode: 'HFLE.SERVER_PROVIDER',
        dynamicProps: {
          required({ record }) {
            return record.get('protocol') === 'FILE_SERVER';
          },
        },
      },
      {
        name: 'storeCodeLov',
        label: (
          <QuestionPopover
            text={getLang('FILE_STORE_CODE')}
            message={getLang('FILE_STORE_CODE_TIP')}
          />
        ),
        type: 'object',
        ignore: 'always',
        lovCode: 'HITF.SITE.STORE_CODE',
        noCache: true,
        valueField: 'storageCode',
        textField: 'storageCode',
        lovQueryAxiosConfig: (_code, _config, { params }) => ({
          method: 'GET',
          params: {
            ...params,
            tenantId: getCurrentOrganizationId(),
          },
        }),
        dynamicProps: {
          required({ record }) {
            return record.get('protocol') === 'FILE_SERVER';
          },
          lovQueryUrl({ record }) {
            return `${HZERO_HFLE}/v2/storage-configs/${record.get('storeType')}`;
          },
        },
      },
      {
        name: 'storeCode',
        type: 'string',
        bind: 'storeCodeLov.storageCode',
      },
    ],
    events: {
      update: onFieldUpdate,
    },
  };
};

export {
  basicFormDS,
  mainConfigFormDS,
  attrListDS,
  paramListDS,
  assertionDS,
  retryFormDS,
  businessAssertionFormDS,
  historyDS,
  fileConfigDS,
};
