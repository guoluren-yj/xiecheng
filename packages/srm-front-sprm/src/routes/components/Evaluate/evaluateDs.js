import intl from 'utils/intl';

const evaluateDs = () => {
  return {
    autoQuery: false,
    // autoCreate: true,
    selection: false,
    fields: [
      {
        name: 'satisfactionDegreeCode',
        label: intl.get(`sprm.common.model.common.userMarktitle`).d('用户评价'),
      },
      {
        label: intl.get(`sprm.common.model.common.remark`).d('备注'),
        name: 'evaluateRemark',
        dynamicProps: {
          required: ({ record }) => {
            return [1, 2].includes(record.get('satisfactionDegreeCode'));
          },
        },
      },
    ],
  };
};

export { evaluateDs };
