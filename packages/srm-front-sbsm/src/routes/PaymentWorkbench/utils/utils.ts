const ConfirmPermissionCode = {
  BANK_CORPORATE_EXPRESS: 'bepInitiate',
  BANK_PAPER: 'paperConfirm',
  OFFLINE_PAY: 'offlineConfirm',
};

export const actionFlagger = ({ record, action, permissionMap, workflowCaller }): any => {
  const flagger = (action) => {
    const { payForm, payStatus } = record?.get(['payForm', 'payStatus']) || {};
    switch (action) {
      case 'edit':
        return ['NEW', 'RETURN'].includes(payStatus) && permissionMap.get('edit');
      case 'approve':
        return ['SUBMITTED', 'REVERSING'].includes(payStatus) && workflowCaller?.getApproveFlag(record);
      case 'revokeApproval':
        return ['SUBMITTED', 'REVERSING'].includes(payStatus) && workflowCaller?.getRevokeFlag(record);
      case 'confirm':
        return ['REVIEWED', 'BEP_FAILED'].includes(payStatus) && permissionMap.get(ConfirmPermissionCode[payForm]);
      case 'reverse':
        return ['PAY_SUCCESS', 'PART_PAY_SUCCESS'].includes(payStatus) && ['BANK_PAPER', 'OFFLINE_PAY'].includes(payForm) && permissionMap.get('reverse');
      default:
        return false;
    }
  };
  return Array.isArray(action) ? action.map((item) => flagger(item)) : flagger(action);
};
