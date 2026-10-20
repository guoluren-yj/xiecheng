import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  pageSize: 20,
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'serialNumber',
      type: 'string',
      label: intl.get('small.ProRecommend.model.serialNumber').d('序号'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      label: intl.get('small.ProRecommend.model.status').d('状态'),
    },
    {
      name: 'groupName',
      type: 'string',
      label: intl.get('small.ProRecommend.model.listName').d('列表名称'),
    },
    {
      name: 'groupAttribute',
      type: 'string',
      label: intl.get('small.ProRecommend.model.listAttribute').d('列表属性'),
    },
    {
      name: 'groupType',
      type: 'string',
      label: intl.get('small.ProRecommend.model.listType').d('列表类型'),
    },
    {
      name: 'validityDate',
      type: 'string',
      label: intl.get('small.ProRecommend.model.validityDate').d('有效期'),
    },
    {
      name: 'startDate',
    },
    {
      name: 'endDate',
    },
    {
      name: 'operation',
      label: intl.get('small.ProRecommend.model.operation').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { filterParams = {}, ...otherParmas } = data;
      const { params = {} } = filterParams;
      return {
        url: `${SRM_MALL}/v1/${organizationId}/product-groups`,
        method: 'GET',
        transformResponse: (res) => {
          try {
            const resp = JSON.parse(res);
            resp.content = resp.content.map((p, i) => ({ ...p, serialNumber: i + 1 }));
            return resp;
          } catch {
            return [];
          }
        },
        data: { ...params, ...otherParmas },
      };
    },
  },
});

export { tableDs };
