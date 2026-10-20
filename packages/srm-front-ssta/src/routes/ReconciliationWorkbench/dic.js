// 对账单状态字典
const tagColor = {
  UN_SIGNED: 'warn',
  SIGNED: 'success',
  SIGNING: 'warn',
  SIGN_FAILED: 'error',
  UN_EVIDENCE: 'warn',
  EVIDENCED: 'success',
  EVIDENCE_FAILED: 'error',
  NOT_TERMINATED: 'warn',
  TERMINATED: 'success',
  TERMINATING: 'warn',
  PURCHASER_TERMINATED: 'success',
  SUPPLIER_TERMINATED: 'success',
  PURCHASER_TERMINATING: 'warn',
  SUPPLIER_TERMINATING: 'warn',
  SYNC_FAILURE: 'error',
  SYNC_SUCCESS: 'success',
  ERP_CANCEL_SUCCESS: 'success',
  ERP_CANCEL_FAILURE: 'error',
  ERP_CANCELING: 'warn',
  SYNCHRONIZING: 'warn',
  NOT_PUSHED: 'info',
  PUSHED: 'success',
  PUSH_FAILED: 'error',
  PUSH_RETURN: 'warn',
};

export { tagColor };
