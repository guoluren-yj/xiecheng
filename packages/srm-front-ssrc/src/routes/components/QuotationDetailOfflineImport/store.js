import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const queryFormDS = () => ({
  fields: [
    {
      name: 'status',
      label: intl.get('ssrc.quoDeImport.model.import.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
  ],
});

const listLineDS = () => ({
  primaryKey: 'configCode',
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: '_dataStatus',
      label: intl.get('ssrc.quoDeImport.model.import.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
    {
      name: '_info',
      label: intl.get('ssrc.quoDeImport.model.import.message').d('错误信息'),
    },
    {
      name: 'configCode',
      label: intl.get('ssrc.quoDeImport.model.import.configCode').d('报价明细项编码'),
    },
    {
      name: 'configName',
      label: intl.get('ssrc.quoDeImport.model.import.configName').d('报价明细项名称'),
    },
  ],

  transport: {
    read: ({ data, params: dsParams = {} }) => {
      const { params, ...others } = data;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/share/import/data`,
        method: 'GET',
        data: { ...params, ...others, ...(dsParams || {}) },
        transformResponse: (res) => {
          if (res) {
            const dealData = JSON.parse(res);
            const { content = [], ...pages } = dealData[0]?.importDataPage || {};
            const newData = content?.map((n) => JSON.parse(n._data));
            return { content: newData, ...pages };
          }
        },
      };
    },
  },
});

export { queryFormDS, listLineDS };
