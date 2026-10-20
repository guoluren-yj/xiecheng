import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_INTERFACE_CONFIG } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const prefix = 'sitf.bindClient';

const tableLine = (externalSystemId) => ({
  fields: [
    {
      name: 'oauthClientIdLov',
      type: 'object',
      label: intl.get(`${prefix}.model.bindClient.oauthClientId`).d('客户端'),
      lovCode: 'SITF.ES_ASSIGN_OAUTH_CLIENT',
      required: true,
      lovPara: { tenantId: organizationId, externalSystemId },
      ignore: 'always',
    },
    {
      name: 'oauthClientId',
      bind: 'oauthClientIdLov.oauthClientId',
    },
    {
      name: 'oauthClientName',
      bind: 'oauthClientIdLov.oauthClientName',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.bindClient.enabledFlag`).d('是否启用'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get(`${prefix}.model.bindClient.description`).d('备注'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_INTERFACE_CONFIG}/v1/es-assign-clients`,
        method: 'GET',
      };
    },
  },
});

const formData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'externalSystemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.bindClient.externalSystemCode`).d('系统代码'),
    },
    {
      name: 'externalSystemName',
      type: 'string',
      label: intl.get(`${prefix}.model.bindClient.externalSystemName`).d('系统名称'),
    },
  ],
});

export { tableLine, formData };
