import intl from 'utils/intl';

const portTypeDS = () => ({
  dataToJSON: 'all',
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    // {
    //   name: 'responseModule',
    //   type: 'string',
    //   label: intl.get('smnd.monitorDashboard.view.inputApi.label').d('接口名称'),
    // },
    {
      name: 'settingCodeObj',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.settingCodeObjName`).d('接口'),
      lovCode: 'SMND_QUERY_SETTING',
      type: 'object',
      ignore: 'always',
      textField: 'interfaceName',
      multiple: true,
    },
    {
      name: 'configKey',
      bind: 'settingCodeObj.configKey',
      multiple: ',',
    },
    {
      name: 'interfaceName',
      bind: 'settingCodeObj.interfaceName',
      multiple: ',',
      ignore: 'always',
    },
    {
      name: 'requestDateStart',
      type: 'date',
      label: intl.get('smnd.monitorDashboard.view.inputApi.requestDateStart').d('请求时间从'),
    },
    {
      name: 'requestDateEnd',
      type: 'date',
      label: intl.get('smnd.monitorDashboard.view.inputApi.requestDateEnd').d('请求时间止'),
    },
  ],
});

const tenantDS = () => ({
  dataToJSON: 'dirty-field',
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'name',
      type: 'string',
      label: intl.get('smnd.monitorDashboard.view.input.label').d('租户查询'),
    },
  ],
});

export { portTypeDS, tenantDS };
