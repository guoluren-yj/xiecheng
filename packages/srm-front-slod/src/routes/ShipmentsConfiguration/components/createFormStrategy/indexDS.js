/*
 * @Description:
 * @Date: 2021-12-01 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';

const formDS = () => ({
  dataToJSON: 'all',
  paging: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.strategyCode').d('策略编码'),
      pattern: '^[0-9a-zA-Z_-]{1,}$',
      required: true,
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get('slod.shipmentsConfiguration.model.strategyName').d('策略描述'),
      required: true,
    },
    {
      name: 'sourceCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.sourceCode').d('来源单据'),
      required: true,
      lookupCode: 'SLOD.STRATEGY_SOURCE',
      defaultValue: 'ORDER',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        Object.assign(record, { status: 'update' });
        // if (record.get('sourceCode')) {
        //   record.set('sourceCode', 'ORDER');
        // }
      });
    },
  },
});

export { formDS };
