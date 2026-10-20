import intl from 'utils/intl';

const wholeAbadonDataSet = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'abandonRemark',
        label: intl.get('ssrc.supplierQuotation.model.supQuo.giveUpReason').d('放弃理由'),
        required: true,
      },
    ],
  };
};

export { wholeAbadonDataSet };
