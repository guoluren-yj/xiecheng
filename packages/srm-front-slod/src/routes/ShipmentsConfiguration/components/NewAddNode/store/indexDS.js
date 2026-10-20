import intl from 'utils/intl';
import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const addNodeDataSet = () => ({
  paging: 10,
  autoCreate: true,
  autoQuery: false,
  selection: 'single',
  fields: [
    {
      name: 'nodeConfigCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigCode').d('节点编码'),
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigName').d('节点名称'),
    },
  ],
  queryFields: [
    {
      name: 'nodeConfigCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigCode').d('节点编码'),
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigName').d('节点名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/node-config/list`,
        method: 'GET',
        data: data || {},
      };
    },
  },
});

export { addNodeDataSet };
