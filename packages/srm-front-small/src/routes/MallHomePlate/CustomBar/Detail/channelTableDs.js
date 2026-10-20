import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const channelTableDs = {
  primaryKey: 'channelId',
  autoQuery: false,
  // table表单显示的字段
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.lineNum').d('行号'),
    },
    {
      name: 'channelName',
      type: 'string',
      label: intl.get(`small.mallHomePlate.model.channelBarName`).d('栏目名称'),
    },
    {
      name: 'channelTypeName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.channelTypeName').d('对象'),
    },
    {
      name: 'customChannelRangeList',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.customChannelRange').d('商品范围'),
    },
    {
      name: 'quantity',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.quantity').d('商品数量'),
    },
    {
      name: 'shelfFlag',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'option',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'channelName',
      type: 'string',
      label: intl.get(`small.mallHomePlate.model.channelBarName`).d('栏目名称'),
    },
    {
      name: 'channelType',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.channelTypeName').d('对象'),
      lookupCode: 'SMAL.CUSTOM_CHANNEL_TYPE',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.shelfFlag === '1') {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/custom-channels`,
        method: 'GET',
        data,
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/custom-channels`,
        data,
        method: 'DELETE',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
  },
};

export { channelTableDs };
