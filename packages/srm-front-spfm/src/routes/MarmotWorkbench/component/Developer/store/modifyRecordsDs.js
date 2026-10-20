import intl from 'utils/intl';

export function getModifyRecordsTableDs() {
  return {
    selection: false,
    autoQuery: true,
    queryFields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.modifyRecords.model.modifyRecords.code').d('唯一标识编码'),
      },
      {
        name: 'applyTenant',
        type: 'object',
        lovCode: 'SADA_TENANT_PAGE',
        ignore: 'always',
        label: intl.get('hzero.common.tenant').d('租户'),
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
    ],
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.modifyRecords.model.modifyRecords.code').d('唯一标识编码'),
      },
      {
        name: 'lastUpdateDate',
        type: 'string',
        label: intl.get('spfm.modifyRecords.model.modifyRecords.lastUpdateDate').d('修改时间'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hzero.common.tenant').d('租户'),
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('spfm.modifyRecords.model.modifyRecords.type').d('修改项'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.modifyRecords.model.modifyRecords.description').d('描述'),
      },
    ],
    transport: {
      read: {
        url: `/sada/v1/marmot-data/script/current-user-updated`,
        method: 'GET',
      },
    },
  };
}
