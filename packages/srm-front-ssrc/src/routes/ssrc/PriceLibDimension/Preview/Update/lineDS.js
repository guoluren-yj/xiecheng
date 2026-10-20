import intl from 'utils/intl';

const listLineDS = () => ({
  primaryKey: 'priceLibId',

  // table表单显示的字段
  fields: [
    {
      name: 'edit',
      type: 'string',
      label: intl.get('hzero.common.edit').d('编辑'),
    },
  ],

  queryFields: [],
});

export { listLineDS };
