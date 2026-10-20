import intl from 'utils/intl';

export const cardFieldDS = (updateCallback) => ({
  autoQuery: false,
  autoCreate: false,
  forceValidate: true,
  fields: [
    {
      name: 'fieldCode',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.fieldCode').d('字段编码'),
      type: 'string',
      required: true,
    },
    {
      name: 'fieldName',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.feildName').d('字段名'),
      type: 'intl',
      required: true,
    },
  ],
  events: {
    update: updateCallback,
  },
});
