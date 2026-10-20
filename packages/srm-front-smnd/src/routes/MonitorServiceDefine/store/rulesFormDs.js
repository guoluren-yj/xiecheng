import intl from 'utils/intl';

const rulesFormDataSet = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'tenantId',
      label: intl.get('smnd.monitorDashboard.view.message.tenantNum').d('特性'),
      lookupCode: 'HPFM.TENANT',
    },
    {
      name: 'interfaceName',
      label: intl.get(`smnd.monitorDashboard.view.message.interfaceName`).d('常量'),
    },
    {
      name: 'requestModule',
      label: intl.get(`smnd.monitorDashboard.view.message.requestModule`).d('特性条件'),
    },
    {
      name: 'requestModule',
      label: intl.get(`smnd.monitorDashboard.view.message.requestModule`).d('特性值'),
    },
  ],
  transport: {},
});

export default rulesFormDataSet;
