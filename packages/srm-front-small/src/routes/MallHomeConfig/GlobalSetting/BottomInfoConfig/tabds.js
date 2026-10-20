import intl from 'utils/intl';

import { STRICT_URL } from 'utils/regExp';

export const tabds = () => {
  return {
    fields: [
      {
        name: 'tabTitle',
        label: intl.get('small.mallHomeConfig.tab.title').d('信息栏标题'),
        required: true,
      },
    ],
  };
};

export const tableds = () => {
  return {
    selection: false,
    fields: [
      {
        name: 'fieldsName',
        label: intl.get('small.mallHomeConfig.fields.name').d('字段名称'),
        type: 'intl',
      },
      {
        name: 'linkAddress',
        label: intl.get('small.mallHomeConfig.link.address').d('链接地址'),
        pattern: STRICT_URL,
      },
      { name: 'edit', label: intl.get('small.mallHomeConfig.edit.delete').d('操作') },
    ],
  };
};
