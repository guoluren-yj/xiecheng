import intl from 'utils/intl';

const abandonFormDS = () => ({
  selection: false,
  autoCreate: true,
  fields: [
    {
      name: 'abandonRemark',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.giveUpReason`).d('关闭理由'),
      required: true,
    },
  ],
});

export { abandonFormDS };
