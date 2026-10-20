import intl from 'utils/intl';

// 申诉信息DS
const getAppealInfoDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'appealReason',
      type: 'string',
      label: intl.get('spfm.supplierRegister.button.appealReason').d('申诉理由'),
      required: true,
    },
  ],
});

export { getAppealInfoDS };
