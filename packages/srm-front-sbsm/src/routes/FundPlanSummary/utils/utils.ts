export const actionFlagger= ({ record, action, workflowCaller, permissionMap }: any) => {
  const flagger = (action) => {
    const { balStatus } = record?.get(['balStatus']) || {};
    switch (action) {
      case 'edit':
        return ['NEW', 'RETURN'].includes(balStatus);
      case 'approve':
        return (
          (['SUBMIT_APPROVING', 'CANCEL_APPROVING'].includes(balStatus) &&
            workflowCaller?.getApproveFlag(record))
        );
      case 'revokeApproval':
        return (
          (['SUBMIT_APPROVING', 'CANCEL_APPROVING'].includes(balStatus) &&
            workflowCaller?.getRevokeFlag(record))
        );
      case 'cancel':
        return balStatus === 'CONFIRM' && permissionMap?.get('cancel');
      default:
        return false;
    }
  };
  return Array.isArray(action) ? action.map((item) => flagger(item)) : flagger(action);
};
