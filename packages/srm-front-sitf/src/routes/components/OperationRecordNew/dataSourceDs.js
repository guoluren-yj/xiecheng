import intl from 'utils/intl';

const tableData = () => ({
  selection: false,
  fields: [
    {
      name: 'processUserIdMeaning',
      label: intl.get('scux.operationRecordNew.model.operationRecordNew.processUserIdMeaning').d('操作人'),
      type: 'string',
    },
    {
      name: 'processDate',
      label: intl.get('scux.operationRecordNew.model.operationRecordNew.processDate').d('操作时间'),
      type: 'string',
    },
    {
      name: 'processStatusMeaning',
      label: intl.get('scux.operationRecordNew.model.operationRecordNew.processStatusMeaning').d('操作动作'),
      type: 'string',
    },
    {
      name: 'remark',
      label: intl.get('scux.operationRecordNew.model.operationRecordNew.remark').d('操作内容'),
      type: 'string',
    },
  ],
  transport: {
    read: (values) => {
      const {data: {url, parmasOther}, params} = values;
      return {
        url,
        method: 'GET',
        data: {...params, ... parmasOther, url: undefined},
      };
    },
  },
});

export { tableData };