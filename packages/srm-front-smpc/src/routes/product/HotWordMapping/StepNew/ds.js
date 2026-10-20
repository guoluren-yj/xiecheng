import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { commonField } from '../ds';

const organizationId = getCurrentOrganizationId();

const hotWordChooseDS = () => {
  return {
    paging: false,
    autoQuery: true,
    fields: [
      {
        label: intl.get('smpc.hotWordMapping.model.hotWord').d('搜索热词'),
        name: 'hotWord',
      },
      {
        label: intl.get('smpc.hotWordMapping.model.hotWordNum').d('搜索次数'),
        name: 'count',
        type: 'number',
      },
    ],
    transport: {
      read: {
        url: `/sads/v1/${organizationId}/hot-word-filter`,
        method: 'GET',
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((r) => {
          r.set('customId', r.index);
        });
      },
    },
  };
};

const hotWordSetDS = (tabKey) => {
  return {
    paging: false,
    fields: [
      {
        label: intl.get('smpc.hotWordMapping.model.hotWord').d('搜索热词'),
        name: 'hotWord',
        required: true,
        maxLength: 200,
      },
      ...commonField[tabKey](),
    ],
  };
};

export { hotWordChooseDS, hotWordSetDS };
