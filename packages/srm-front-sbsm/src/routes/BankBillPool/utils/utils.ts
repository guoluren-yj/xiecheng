export const actionFlagger = ({ record, action, permissionMap }): any => {
  const flagger = (action) => {
    const { paperSystemStatus } = record?.get(['paperSystemStatus']) || {};
    switch (action) {
      case 'edit':
        return ['NEW', 'NO_NEED_USE'].includes(paperSystemStatus);
      case 'void':
        return ['NEW', 'NO_NEED_USE'].includes(paperSystemStatus) && permissionMap.get('void');
      case 'split':
        return ['NEW', 'NO_NEED_USE'].includes(paperSystemStatus) && permissionMap.get('split');
      case 'without':
        return ['NEW'].includes(paperSystemStatus) && permissionMap.get('without');
      default:
        return false;
    }
  };
  return Array.isArray(action) ? action.map((item) => flagger(item)) : flagger(action);
};
