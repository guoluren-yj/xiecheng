import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { CODE, CODE_UPPER } from 'hzero-front/lib/utils/regExp';
import {
  TENANT,
  ROUTE_INFORMATION,
  CERTIFICATE,
  CERTIFICATE_ORG,
  SOAP_WSS_PASSWORD_TYPE,
  SERVICE_TYPE,
  SERVICE_CATEGORY,
  PROTOCOL,
  SERVICE_STATUS,
  MODELER_APP_LIST,
  MODELER_DARASOURCE,
} from '@/constants/CodeConstants';
import { SERVICE_CONSTANT } from '@/constants/constants';
import getLang from '@/langs/serviceLang';
import React from 'react';
import QuestionPopover from '../../components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

// const HZERO_HITF = '/hitf-15032';

const historyDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    primaryKey: 'interfaceServerHisId',
    fields: [
      {
        name: 'version',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { interfaceServerId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interface-server-hiss/${interfaceServerId}/history`,
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

const basicFormDS = (props) => {
  const { domainDS, onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: true,
    fields: [
      {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        noCache: true,
        valueField: 'tenantId',
        textField: 'tenantName',
        required: !isTenantRoleLevel(),
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'tenantLov.tenantName',
      },
      {
        name: 'serverCode',
        label: (
          <QuestionPopover text={getLang('SERVICE_CODE')} message={getLang('SERVICE_CODE_TIP')} />
        ),
        type: 'string',
        required: true,
        maxLength: 128,
        pattern: CODE_UPPER,
        defaultValidationMessages: {
          patternMismatch: getLang('CODE_UPPER'),
        },
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
        required: true,
        maxLength: 250,
      },
      {
        name: 'namespace',
        label: <QuestionPopover text={getLang('NAMESPACE')} message={getLang('NAMESPACE_TIP')} />,
        type: 'string',
      },
      {
        name: 'serviceType',
        label: (
          <QuestionPopover text={getLang('SERVICE_TYPE')} message={getLang('SERVICE_TYPE_TIP')} />
        ),
        type: 'string',
        required: true,
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'serviceCategory',
        label: (
          <QuestionPopover
            text={getLang('SERVICE_CATEGORY')}
            code="HITF.SERVICES.SERVICE_CATEGORY"
          />
        ),
        type: 'string',
        required: true,
        lookupCode: SERVICE_CATEGORY,
      },
      {
        name: 'protocolGroup',
        label: getLang('ADDRESS'),
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'appCodeLov',
        label: getLang('APP_CODE'),
        type: 'object',
        required: true,
        ignore: 'always',
        lovCode: MODELER_APP_LIST,
        valueField: 'appCode',
        textField: 'appName',
        dynamicProps: {
          required: ({ record }) => record.get('serviceCategory') === SERVICE_CONSTANT.MODELER,
        },
        lovPara: {
          organizationId: isTenantRoleLevel() ? organizationId : undefined,
        },
        cascadeMap: !isTenantRoleLevel() && {
          organizationId: 'tenantId',
        },
      },
      {
        name: 'appCode',
        type: 'string',
        bind: 'appCodeLov.appCode',
      },
      {
        name: 'appName',
        type: 'string',
        bind: 'appCodeLov.appName',
      },
      {
        name: 'sourceCodeLov',
        label: getLang('SOURCE_CODE'),
        type: 'object',
        required: true,
        ignore: 'always',
        lovCode: MODELER_DARASOURCE,
        valueField: 'sourceCode',
        textField: 'sourceName',
        cascadeMap: { appCode: 'appCode' },
        dynamicProps: {
          required: ({ record }) => record.get('serviceCategory') === SERVICE_CONSTANT.MODELER,
        },
      },
      {
        name: 'sourceCode',
        type: 'string',
        bind: 'sourceCodeLov.sourceCode',
      },
      {
        name: 'sourceName',
        type: 'string',
        bind: 'sourceCodeLov.sourceName',
      },
      {
        name: 'publicFlag',
        label: <QuestionPopover text={getLang('PUBLIC_FLAG')} code="HITF.SERVICES.PUBLIC_FLAG" />,
        type: 'boolean',
        defaultValue: false,
        trueValue: true,
        falseValue: false,
      },
      {
        name: 'domainUrl',
        type: 'string',
        dynamicProps: {
          required: ({ record }) =>
            [
              SERVICE_CONSTANT.INTERNAL,
              SERVICE_CONSTANT.EXTERNAL,
              SERVICE_CONSTANT.EXTERNAL_FRONTAL,
            ].includes(record.get('serviceCategory')),
          bind: ({ record }) =>
            record.get('serviceCategory') === SERVICE_CONSTANT.INTERNAL
              ? 'addressLov.serviceCode'
              : null,
        },
      },
      {
        name: 'protocol',
        type: 'string',
        lookupCode: PROTOCOL,
        dynamicProps: {
          required: ({ record }) =>
            [SERVICE_CONSTANT.EXTERNAL, SERVICE_CONSTANT.EXTERNAL_FRONTAL].includes(
              record.get('serviceCategory')
            ),
        },
      },
      {
        name: 'addressLov',
        // label: intl.get(`${prefix}.address`).d('服务地址'),
        label: <QuestionPopover text={getLang('ADDRESS')} message={getLang('ADDRESS_TIP')} />,
        type: 'object',
        lovCode: ROUTE_INFORMATION,
        ignore: 'always',
        dynamicProps: {
          required: ({ record }) => record.get('serviceCategory') === SERVICE_CONSTANT.INTERNAL,
        },
      },
      {
        name: 'enabledCertificateFlag',
        label: getLang('ENABLE_CERTIFICATE'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'certificateLov',
        label: getLang('CERTIFICATE'),
        type: 'object',
        required: true,
        ignore: 'always',
        noCache: true,
        lovCode: isTenantRoleLevel() ? CERTIFICATE_ORG : CERTIFICATE,
        textField: 'domainName',
        valueField: 'certificateId',
        dynamicProps: {
          lovPara: ({ record }) => ({
            serverUrl: `${record.get('protocol')}${record.get('domainUrl')}`,
            tenantId: organizationId,
          }),
          required: ({ record }) => record.get('enabledCertificateFlag') === 1,
        },
      },
      {
        name: 'certificateId',
        type: 'string',
        bind: 'certificateLov.certificateId',
      },
      {
        name: 'domainName',
        type: 'string',
        bind: 'certificateLov.domainName',
      },
      {
        name: 'swaggerUrl',
        label: (
          <QuestionPopover text={getLang('SWAGGER_URL')} message={getLang('SWAGGER_URL_TIP')} />
        ),
        type: 'string',
      },
      {
        name: 'soapNamespace',
        // label: intl.get(`${prefix}.soapNamespace`).d('命名空间'),
        label: (
          <QuestionPopover
            text={getLang('SOAP_NAMESPACE')}
            message={getLang('SOAP_NAMESPACE_TIP')}
          />
        ),
        type: 'string',
        dynamicProps: {
          required: ({ record }) => record.get('serviceType') === SERVICE_CONSTANT.SOAP,
        },
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLE_FLAG'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'soapElementPrefix',
        // label: intl.get(`${prefix}.soapElementPrefix`).d('参数前缀'),
        label: (
          <QuestionPopover text={getLang('SOAP_ELEMENT_PREFIX')} code="HITF.SERVICES.SOAP_PREFIX" />
        ),
        type: 'string',
        maxLength: 30,
      },
      {
        name: 'soapWssPasswordType',
        // label: intl.get(`${prefix}.soapWssPasswordType`).d('加密类型'),
        label: (
          <QuestionPopover
            text={getLang('SOAP_WSS_PASSWORD_TYPE')}
            message={getLang('SOAP_WSS_PASSWORD_TYPE_TIP')}
          />
        ),
        type: 'string',
        lookupCode: SOAP_WSS_PASSWORD_TYPE,
      },
      {
        name: 'soapUsername',
        label: getLang('SOAP_USER_NAME'),
        type: 'string',
      },
      {
        name: 'soapPassword',
        label: getLang('SOAP_PASSWORD'),
        type: 'string',
      },
      {
        name: 'requestContentType',
        // label: intl.get(`${prefix}.requestContentType`).d('请求ContentType'),
        label: (
          <QuestionPopover
            text={getLang('REQUEST_CONTENT_TYPE')}
            code="HITF.SERVICES.REQ_CONTENT_TYPE"
          />
        ),
        type: 'string',
      },
      {
        name: 'responseContentType',
        // label: intl.get(`${prefix}.responseContentType`).d('响应ContentType'),
        label: (
          <QuestionPopover
            text={getLang('RESPONSE_CONTENT_TYPE')}
            code="HITF.SERVICES.RESPONSE_CONTENT"
          />
        ),
        type: 'string',
      },
      {
        name: 'soapDataNode',
        // label: intl.get(`${prefix}.soapDataNode`).d('SoapBody报文标签'),
        label: (
          <QuestionPopover text={getLang('SOAP_DATA_NODE')} code="HITF.SERVICES.SOAP_DATA_NODE" />
        ),
        type: 'string',
        defaultValue: 'soap:Body',
      },
      {
        name: 'invokeVerifySignFlag',
        type: 'boolean',
        // label: intl.get(`${prefix}.invokeVerifySignFlag`).d('校验签名'),
        defaultValue: false,
        label: (
          <QuestionPopover
            text={getLang('INVOKE_VERIFY_SIGN_FLAG')}
            message={getLang('INVOKE_VERIFY_SIGN_FLAG_TIP')}
          />
        ),
      },
      {
        name: 'pageInterfaces',
        type: 'object',
        ignore: 'always',
      },
      {
        name: 'historyVersion',
        type: 'string',
        label: getLang('HISTORY_VERSION'),
      },
      {
        name: 'formatVersion',
        type: 'string',
        label: getLang('CURRENT_VERSION'),
      },
      {
        name: 'serverDomain',
        // label: intl.get(`${prefix}.domain`).d('服务领域'),
        label: <QuestionPopover text={getLang('DOMAIN')} message={getLang('DOMAIN_TIP')} />,
        type: 'string',
        required: true,
        ignore: 'always',
        valueField: 'domainId',
        textField: 'domainName',
        options: domainDS,
      },
      {
        name: 'serverDomainId',
        type: 'string',
      },
      {
        name: 'serverDomainCode',
        type: 'string',
      },
      {
        name: 'status',
        type: 'string',
        label: getLang('STATUS'),
        lookupCode: SERVICE_STATUS,
      },
    ],
    transport: {
      read: ({ data, params, dataSet }) => {
        const { interfaceServerId, version, history } = data;
        if (history) {
          dataSet.setQueryParameter('history', false);
          return {
            url: `${HZERO_HITF}/v1${level}/interface-servers/${interfaceServerId}/view/${version}`,
            method: 'GET',
            transformResponse: (response) => {
              try {
                const res = JSON.parse(response);
                const { domainUrl = '', serviceCategory } = res;
                const urlArr = domainUrl.split('//');
                const [pre, ...others] = urlArr;
                let tempUrl = others[0];
                const { length } = others;
                for (let i = 1; i < others.length; i++) {
                  const count = i;
                  if (count + 1 > length) {
                    return;
                  }
                  tempUrl = `${tempUrl}//${others[i]}`;
                }
                const protocol = `${pre}//`;
                return {
                  ...res,
                  protocol: [SERVICE_CONSTANT.EXTERNAL, SERVICE_CONSTANT.EXTERNAL_FRONTAL].includes(
                    serviceCategory
                  )
                    ? protocol
                    : '',
                  domainUrl: [
                    SERVICE_CONSTANT.EXTERNAL,
                    SERVICE_CONSTANT.EXTERNAL_FRONTAL,
                  ].includes(serviceCategory)
                    ? tempUrl
                    : domainUrl,
                };
              } catch (error) {
                return null;
              }
            },
          };
        }
        return {
          url: `${HZERO_HITF}/v1${level}/interface-servers/${interfaceServerId}`,
          method: 'GET',
          params: { ...data, ...params },
          transformResponse: (response) => {
            try {
              const res = JSON.parse(response);
              const { domainUrl = '', serviceCategory } = res;
              const urlArr = domainUrl.split('//');
              const [pre, ...others] = urlArr;
              let tempUrl = others[0];
              const { length } = others;
              for (let i = 1; i < others.length; i++) {
                const count = i;
                if (count + 1 > length) {
                  return;
                }
                tempUrl = `${tempUrl}//${others[i]}`;
              }
              const protocol = `${pre}//`;
              return {
                ...res,
                protocol: [SERVICE_CONSTANT.EXTERNAL, SERVICE_CONSTANT.EXTERNAL_FRONTAL].includes(
                  serviceCategory
                )
                  ? protocol
                  : '',
                domainUrl: [SERVICE_CONSTANT.EXTERNAL, SERVICE_CONSTANT.EXTERNAL_FRONTAL].includes(
                  serviceCategory
                )
                  ? tempUrl
                  : domainUrl,
              };
            } catch (error) {
              return null;
            }
          },
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

const copyFormDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: false,
    fields: [
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
        required: true,
        pattern: CODE,
        defaultValidationMessages: {
          patternMismatch: getLang('CODE'),
        },
      },
    ],
    transport: {
      create: ({ data }) => {
        const { interfaceId, interfaceCode } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/clone/${interfaceId}`,
          method: 'POST',
          params: { interfaceCode },
          data: null,
        };
      },
    },
  };
};

const internalInterfaceTableDS = (props) => {
  const { interfaceServerId, tenantId, onFieldUpdate = () => {} } = props;
  return {
    primaryKey: 'id',
    autoQuery: true,
    autoCreate: false,
    pageSize: 10,
    cacheSelection: true,
    modifiedCheck: false,
    queryFields: [
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
    ],
    fields: [
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
        required: true,
        pattern: CODE,
        defaultValidationMessages: {
          patternMismatch: getLang('CODE'),
        },
      },
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
      {
        name: 'requestMethod',
        label: getLang('REQUEST_METHOD'),
        type: 'string',
      },
      {
        name: 'path',
        label: getLang('INTERFACE_ADDRESS'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ params, data }) => {
        return {
          url: `${HZERO_HITF}/v1/permission/${interfaceServerId}/api-list`,
          method: 'GET',
          params: {
            ...params,
            ...data,
            organizationLevel: tenantId.toString() !== '0' ? true : undefined,
          },
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

export { basicFormDS, historyDS, copyFormDS, internalInterfaceTableDS };
