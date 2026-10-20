import intl from 'utils/intl';

const customSpecs = () => ({
  paging: false,
  fields: [
    {
      name: 'componentName',
      label: intl.get(`sodr.common.model.common.componentName`).d('属性名称'),
    },
    {
      name: 'cpValue',
      label: intl.get(`sodr.common.model.common.cpValue`).d('属性值'),
    },
  ],
});

const productSpecs = () => ({
  paging: false,
  fields: [
    {
      name: 'pName',
      label: intl.get(`sodr.common.model.common.componentName`).d('属性名称'),
    },
    {
      name: 'pValue',
      label: intl.get(`sodr.common.model.common.cpValue`).d('属性值'),
    },
  ],
});

export { customSpecs, productSpecs };
