import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const addNodeDataSet = () => ({
  pageSize: 20,
  autoCreate: true,
  autoQuery: false,
  selection: 'single',
  fields: [
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigNames').d('节点名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/lovs/sql/data`,
        method: 'GET',
        data: data.params || {},
      };
    },
  },
});

export { addNodeDataSet };
