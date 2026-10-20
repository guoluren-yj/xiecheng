import intl from 'utils/intl';

const budgetVerification = () => ({
  paging: false,
  fields: [
    {
      name: 'displayPoNum',
      label: intl.get('sodr.common.model.common.displayPoNum').d('订单号'),
    },
    {
      name: 'displayLineNum',
      label: intl.get('sodr.common.model.common.lineNum').d('行号'),
    },
    {
      name: 'errorMessage',
      label: intl.get('sodr.common.model.common.errorMessage').d('提示'),
    },
  ],
});

export { budgetVerification };
