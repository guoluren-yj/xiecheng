import intl from 'utils/intl';

const tableds = () => ({
  autoQuery: true,
  selection: false,
  pageSize: 20,
  queryFields: [],
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smep.skuTask.model.statusMeaning').d('任务状态'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get('smep.skuTask.model.tenantName').d('租户'),
    },
    {
      name: 'ecTypeMeaning',
      type: 'string',
      label: intl.get('smep.skuTask.model.supplierCodeMeaning').d('电商'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smep.skuTask.model.status').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smep/v1/ec-init-tasks`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMEP.SKUINITTASK.TASK.SEARCH_BAR',
        },
      };
    },
  },
});

export { tableds };
