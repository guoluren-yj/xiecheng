import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

export const SyncStutusLineDS = sourceHeaderId => {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'syncStatusMeaning',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.syncStatusMeaning`).d('同步状态'),
      },
      {
        name: 'syncStatus',
        lookupCode: 'SSRC.SYNC_EXTERNAL_STATUS',
      },
      {
        name: 'syncTypeNodeMeaning',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.syncTypeNode`).d('同步类型'),
      },
      {
        name: 'syncResponseMessage',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.syncResponseMessage`).d('同步消息'),
      },

      {
        name: 'lastUpdateDate',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.lastUpdateDate`).d('操作时间'),
      },
      {
        name: 'realName',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.lastUpdateBy`).d('操作人'),
      },
      {
        name: 'reSync',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.reSync`).d('重新同步'),
      },
      {
        name: 'externalSystemCode',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.externalSystemCode`).d('外部系统'),
      },
      {
        name: 'interfaceCode',
        label: intl.get(`ssrc.projectSetup.model.projectSetup.interfaceCode`).d('接口代码'),
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${Prefix}/${organizationId}/sync/record/${sourceHeaderId}/pages`,
          method: 'GET',
          params: { ...params, sourceFrom: 'PROJECT' },
        };
      },
      submit: ({ data }) => {
        return {
          url: `${Prefix}/${organizationId}/sync/record/retry`,
          method: 'POST',
          data: { syncExtRecordId: data[0].syncExtRecordId },
        };
      },
    },
  };
};
