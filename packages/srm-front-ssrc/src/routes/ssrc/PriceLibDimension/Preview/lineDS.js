import intl from 'utils/intl';

const listLineDS = () => ({
  primaryKey: 'priceLibId',

  // table表单显示的字段
  fields: [
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssrc.priceLibrary.model.library.operation').d('操作记录'),
    },
  ],

  queryFields: [],
});

export { listLineDS };
