import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const importModalDs = (poHeaderId) => ({
  dataToJSON: 'all',
  primaryKey: 'syncRecordId',
  selection: false,
  fields: [
    {
      name: 'syncTypeMeaning',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.reSyncType`).d('同步类型'),
    },
    {
      name: 'syncStatusMeaning',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.reSyncStatus`).d('同步状态'),
    },
    {
      name: 'syncResponseMsg',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.reSyncMsg`).d('同步消息'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get(`sodr.workspace.model.common.lastUpdateDates`).d('操作时间'),
    },
    {
      name: 'lastUpdatedName',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.lastUpdatedName`).d('操作人'),
    },
    {
      name: 'button',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.button`).d('按钮'),
    },
    {
      name: 'externalSystemCode',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.externalSystem`).d('外部系统'),
    },
    {
      name: 'syncType',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.syncType`).d('接口代码'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-sync/exp-record/${poHeaderId}`,
        method: 'GET',
      };
    },
  },
});

export { importModalDs };
