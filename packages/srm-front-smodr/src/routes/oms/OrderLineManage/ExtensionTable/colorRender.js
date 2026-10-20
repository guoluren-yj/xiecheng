export function color(record = {}) {
  const cancelStatus = record.get('cancelStatus');
  if (['NOT_CANCEL'].includes(cancelStatus)) {
    return 'gray'; // 灰
  } else if (['CANCEL_FAILED', 'CANCELED'].includes(cancelStatus)) {
    return 'red'; // 红
  } else {
    return 'yellow';
  }
}

export function preemColor(record = {}) {
  const preemptionStatus = record.get('preemptionStatus');
  if (['CONFIRMED', 'NOT_CONFIRM'].includes(preemptionStatus)) {
    return 'green'; // 绿
  } else if (['TO_CONFIRM'].includes(preemptionStatus)) {
    return 'yellow';
  } else if (['NOT_PREEMPT'].includes(preemptionStatus)) {
    return 'gray'; // 灰
  } else if (['CONFIRMED_FAILED', '	PREEMPT_FAILED'].includes(preemptionStatus)) {
    return 'red'; // 红
  }
}

export function approveColor(record = {}) {
  const approveStatus = record.get('approveStatus');
  if (['APPROVED'].includes(approveStatus)) {
    return 'green'; // 绿
  } else if (['APPROVING'].includes(approveStatus)) {
    return 'yellow'; // 黄
  } else if (['REJECTED'].includes(approveStatus)) {
    return 'red'; // 红
  } else if (['NOT_APPROVE'].includes(approveStatus)) {
    return 'gray'; // 灰
  }
}

export function shipmentColor(record = {}) {
  const shipmentStatus = record.get('consignmentStatus');
  if (['DELIVERY_SUCCESS', 'NOT_DELIVERY'].includes(shipmentStatus)) {
    return 'green'; // 绿
  } else if (['NOT_DISTRIBUTE'].includes(shipmentStatus)) {
    return 'gray'; // 灰
  } else {
    return 'red'; // 红
  }
}

export function receiveColor(record = {}) {
  const receiveStatus = record.get('receiptStatus');
  switch (receiveStatus) {
    case 'RECEIVED':
    case 'APPROVED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'APPROVING':
      return 'yellow';
    default:
      return 'gray';
  }

}

export function afterColor(record = {}) {
  const afterSaleStatus = record.get('afterSaleStatus');
  if (['AFTER_SALE_SUCCESS', 'END_AFTER_SALE', 'FINISH'].includes(afterSaleStatus)) {
    return 'green'; // 绿
  } else if (
    ['INTERNAL_APPROVING', 'WAIT_SENT', 'WAIT_CONFIRM', 'APPROVING', 'WAIT_PROCESS'].includes(
      afterSaleStatus
    )
  ) {
    return 'yellow'; // 黄
  } else if (['CANCELED', 'NOT_SALE_AFTER'].includes(afterSaleStatus)) {
    return 'gray'; // 灰
  } else {
    return 'red'; // 红
  }
}

export function stateColor(record = {}) {
  const statementsStatus = record.get('statementsStatus');
  if (['STATEMENTED'].includes(statementsStatus)) {
    return 'green'; // 绿
  } else if (['CLOSE_STATEMENTS'].includes(statementsStatus)) {
    return 'red'; // 红
  } else if (['NOT_STATEMENTS'].includes(statementsStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow'; // 黄
  }
}


export function invoiceColor(record = {}) {
  const statementsStatus = record.get('requestStatus');
  if (['PASS', 'RETURN_SUCCESS'].includes(statementsStatus)) {
    return 'green'; // 绿
  } else if (['FAILED', 'EXCEPTION'].includes(statementsStatus)) {
    return 'red'; // 红
  } else if (['NON_INVOICE', 'CANCELED'].includes(statementsStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow'; // 黄
  }
}

// 发票状态
export function receiptColor(record = {}) {
  const statementsStatus = record.get('validityStatus');
  if (['VALID'].includes(statementsStatus)) {
    return 'green'; // 绿
  } else if (['ABNORMAL'].includes(statementsStatus)) {
    return 'red'; // 红
  } else {
    return 'gray'; // 黄
  }
}
