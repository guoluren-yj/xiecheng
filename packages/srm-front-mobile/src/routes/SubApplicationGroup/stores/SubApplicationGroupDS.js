import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMBL } from '@/utils/config.js';

const SUB_APPLICATION_GP_API = `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/sub-application-gp`;

export default (intl) => ({
  transport: {
    read: (config) => {
      const url = `${SUB_APPLICATION_GP_API}/list`;
      return {
        ...config,
        url,
        method: 'GET',
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SUB_APPLICATION_GP_API}`,
        data,
        params,
        method: 'DELETE',
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${SUB_APPLICATION_GP_API}/save`,
        data,
        params,
        method: 'PUT',
      };
    },
  },
  paging: false,
  selection: 'multiple',
  primaryKey: 'subAppGroupId',
  fields: [
    {
      name: 'subApplicationGp',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.name').d('子应用分组'),
      type: 'object',
      ignore: 'always',
      required: true,
    },
    {
      name: 'application',
      label: intl.get('smbl.subApplicationGp.model.applicationName').d('应用'),
      type: 'object',
      lovCode: 'SMBL.APPLICATION.VIEW',
      ignore: 'always',
      required: true,
    },
    {
      name: 'subAppGroupId',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.id').d('子应用分组ID'),
      type: 'string',
    },
    {
      name: 'tenantId',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.tenantId').d('租户id'),
      type: 'string',
    },
    {
      name: 'subAppGroupCode',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.code').d('分组编码'),
      type: 'string',
      format: 'uppercase',
      required: true,
    },
    {
      name: 'subAppGroupName',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.name').d('分组名称'),
      type: 'intl',
      required: true,
      bind: 'subApplicationGp.subAppGroupName',
    },
    {
      name: 'applicationCode',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.applicationCode').d('应用编码'),
      type: 'string',
      required: true,
    },
    {
      name: 'applicationName',
      label: intl.get('smbl.subApplicationGp.model.applicationName').d('应用名称'),
      type: 'string',
    },
    {
      name: 'subAppGroupDesc',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.subAppGroupDesc').d('分组描述'),
      type: 'string',
    },
    {
      name: 'iconUrl',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.iconUrl').d('分组图标'),
      type: 'string',
      required: true,
    },
    {
      name: 'sequence',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.sequence').d('排序号'),
      type: 'string',
      required: true,
    },
    {
      name: 'enabledFlag',
      label: intl.get('smbl.subApplicationGp.model.subApplicationGp.enabledFlag').d('是否启用'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '1',
      required: true,
    },
    {
      name: 'operationAction',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
  ],
});
