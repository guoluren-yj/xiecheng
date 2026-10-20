import intl from 'utils/intl';

const modelPrompt = 'sinv.receiptExecution.model.title';

const custDS = () => ({
  primaryKey: 'rcvTrxLineId',
  selection: false,
  modifiedCheck: false,
  fields: [
    {
      name: 'componentName',
      type: 'string',
      label: intl.get(`${modelPrompt}.componentName`).d('属性名称'),
    },
    {
      name: 'cpValue',
      type: 'string',
      label: intl.get(`${modelPrompt}.cpValue`).d('属性值'),
    },
  ],
});

export { custDS };
