import intl from 'utils/intl';

export const queryFieldDataSet = ({ itemGroupViewFlag }) => ({
  dataToJSON: 'dirty-field',
  paging: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'planDateTimeDimension',
      type: 'string',
      required: true,
      lookupCode: 'SLOD.PLAN_DATE_TIME_DIMENSION',
      defaultValue: 'PLAN',
      label: intl.get('slod.deliveryWorkbench.model.common.planDateTimeDimension').d('时间维度'),
    },
    {
      name: 'quantityDimension',
      type: 'string',
      required: true,
      lookupCode: 'SLOD.PLAN_DATE_QUANTITY_D',
      defaultValue: '1',
      label: intl.get('slod.deliveryWorkbench.model.common.quantityDimension').d('数量维度'),
    },
    {
      name: 'planStartDate',
      type: 'date',
      required: true,
      defaultValue: new Date(),
      label: intl.get('slod.deliveryWorkbench.model.common.planStartDateTime').d('计划起始日'),
      // dynamicProps: () => {
      //   return {
      //     format: 'YYYY-MM-DD 00:00:00',
      //   };
      // },
    },
    {
      name: 'planDatePeriod',
      type: 'number',
      required: true,
      defaultValue: 7,
      max: 31,
      min: 1,
      label: intl.get('slod.deliveryWorkbench.model.common.timeDatePeriod').d('时间周期'),
    },
    {
      name: 'itemGroupViewFlag',
      type: 'boolean',
      defaultValue: itemGroupViewFlag,
      label: intl
        .get('slod.deliveryWorkbench.model.common.itemGroupViewFlag')
        .d('按物料和日期汇总订单数量'),
    },
  ],
});
