export function getTabKeys<U extends string>(allTabKeys: U[]) {
  return allTabKeys.reduce<Record<string, U[]>>((total, item) => {
    if (item.startsWith('whole')) total.wholeKeys.push(item);
    else total.detailKeys.push(item);
    return total;
  }, { wholeKeys: [], detailKeys: [] });
};

export const actionFlagger= ({ record, action, workflowCaller, permissionMap }) => {
  const flagger = (action) => {
    const { prepReportStatus } = record?.get(['prepReportStatus']) || {};
    switch (action) {
      case 'edit':
        return ['NEW', 'RETURN'].includes(prepReportStatus);
      case 'approve':
        return (
          (['SUBMIT_APPROVING', 'CANCEL_APPROVING'].includes(prepReportStatus) &&
            workflowCaller?.getApproveFlag(record))
        );
      case 'revoke':
          return (
            (['SUBMIT_APPROVING', 'CANCEL_APPROVING'].includes(prepReportStatus) &&
              workflowCaller?.getRevokeFlag(record))
          );
      case 'cancel':
        return prepReportStatus === 'CONFIRM' && permissionMap?.get('cancel');
      default:
        return false;
    }
  };
  return Array.isArray(action) ? action.map((item) => flagger(item)) : flagger(action);
};
