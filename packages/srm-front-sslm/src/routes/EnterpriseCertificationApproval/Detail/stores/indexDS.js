import intl from 'utils/intl';

// 拒绝理由
const rejectModalDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'remark',
      label: intl.get('sslm.supplierInvite.model.supplier.rejectReason').d('拒绝理由'),
      required: true,
    },
  ],
});

// 认证结果
const approvalResultDS = () => ({
  fields: [
    // {
    //   name: 'approvalResult',
    //   label: intl.get('sslm.supplierInvite.model.supplier.approvalResult').d('认证结果'),
    // },
    {
      name: 'appealReason',
      label: intl.get('spfm.supplierRegister.button.appealReason').d('申诉理由'),
    },
  ],
});

export { rejectModalDS, approvalResultDS };
