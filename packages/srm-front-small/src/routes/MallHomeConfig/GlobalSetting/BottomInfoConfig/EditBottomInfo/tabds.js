import intl from 'utils/intl';

export const tabds = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'bottomTitle',
        required: true,
        type: 'intl',
      },
    ],
  };
};

export const tableds = () => {
  return {
    selection: 'multiple',
    fields: [
      {
        name: 'description',
        required: true,
        label: intl.get('small.mallHomeConfig.fields.name').d('字段名称'),
        type: 'intl',
      },
      {
        name: 'linkUrl',
        label: intl.get('small.mallHomeConfig.link.address').d('链接地址'),
      },
      { name: 'edit', label: intl.get('small.mallHomeConfig.edit.delete').d('操作') },
    ],
  };
};
