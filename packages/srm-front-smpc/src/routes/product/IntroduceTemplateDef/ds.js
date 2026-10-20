import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

const commonFields = () => [
  {
    label: intl.get('smpc.prdIntroTemplateDef.model.templateCode').d('模板编码'),
    type: 'string',
    name: 'templateCode',
  },
  {
    label: intl.get('smpc.prdIntroTemplateDef.model.templateName').d('模板名称'),
    type: 'string',
    name: 'templateName',
  },
];

const tableDs = () => ({
  autoQuery: true,
  selection: false,
  queryFields: commonFields(),
  fields: [
    ...commonFields(),
    {
      label: intl.get('hzero.common.status').d('状态'),
      type: 'number',
      name: 'enabledFlag',
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/sku-detail-templates`,
        method: 'GET',
        data: { ...data, tenantId: organizationId },
      };
    },
  },
});

const formDs = (templateId) => ({
  autoQuery: templateId !== 'create',
  paging: false,
  fields: [
    {
      label: intl.get('smpc.prdIntroTemplateDef.model.templateCode').d('模板编码'),
      type: 'string',
      name: 'templateCode',
      required: true,
      maxLength: 30,
      validator: (value, name, record) => {
        if (value && /^[\u4e00-\u9fa5]+$/.test(value)) {
          record.set(name, '');
          return undefined;
        }
      },
    },
    {
      label: intl.get('smpc.prdIntroTemplateDef.model.templateName').d('模板名称'),
      type: 'intl',
      name: 'templateName',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'content',
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SMPC}/v1/${organizationId}/sku-detail-templates/${templateId}`,
      method: 'GET',
      data: { ...data, tenantId: organizationId },
      transformResponse: (result) => {
        const res = JSON.parse(result || '{}');
        if (typeof res === 'object' && res.failed === true) {
          notification.error({ message: res.message });
          return [];
        } else return [res];
      },
    }),
  },
});

export { formDs, tableDs };
