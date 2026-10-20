import intl from 'utils/intl';

export function color(record = {}) {
  const cancelStatus = record.get('cancelStatus');
  if (['NOT_CANCEL'].includes(cancelStatus)) {
    return 'gray'; // 灰
  } else if (['CANCELED'].includes(cancelStatus)) {
    return 'red'; // 红
  } else {
    return 'yellow';
  }
}

export function preemColor(record = {}) {
  const preemptionStatus = record.get('preemptionStatus');
  if (['CONFIRMED', 'NOT_CONFIRM'].includes(preemptionStatus)) {
    return 'green'; // 绿
  } else if (
    ['PREEMPT_FAILED', 'PART_PREEMPT_FAILED', 'CONFIRM_FAILED'].includes(preemptionStatus)
  ) {
    return 'red'; // 红
  } else if (['NOT_PREEMPT'].includes(preemptionStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow';
  }
}

export function approveColor(record = {}) {
  const approveStatus = record.get('approveStatus');
  if (['APPROVED'].includes(approveStatus)) {
    return 'green'; // 绿
  } else if (['REJECTED'].includes(approveStatus)) {
    return 'red'; // 红
  } else if (['NOT_APPROVE'].includes(approveStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow';
  }
}

export function shipmentColor(record = {}) {
  const shipmentStatus = record.get('shipmentStatus');
  if (['DELIVERY_COMPLETED', 'NOT_DELIVERY'].includes(shipmentStatus)) {
    return 'green'; // 绿
  } else if (['NOT_DISTRIBUTE'].includes(shipmentStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow';
  }
}

export function receiveColor(record = {}) {
  const receiveStatus = record.get('receiveStatus');
  if (['RECEIVED'].includes(receiveStatus)) {
    return 'green'; // 绿
  } else if (['NOT_RECEIVE'].includes(receiveStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow';
  }
}

export function afterColor(record = {}) {
  const afterSaleStatus = record.get('afterSaleStatus');
  if (['AFTER_SALE_SUCCESS'].includes(afterSaleStatus)) {
    return 'green'; // 绿
  } else if (['NOT_AFTER_SALE'].includes(afterSaleStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow';
  }
}

export function stateColor(record = {}) {
  const statementsStatus = record.get('statementsStatus');
  if (['STATEMENTED'].includes(statementsStatus)) {
    return 'green'; // 绿
  } else if (['NOT_STATEMENTS'].includes(statementsStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow';
  }
}


export function invoiceColor(record = {}) {
  const statementsStatus = record.get('invoiceStatus');
  if (['SUCCEED'].includes(statementsStatus)) {
    return 'green'; // 绿
  } else if (['FAILED', 'EXCEPTION'].includes(statementsStatus)) {
    return 'red'; // 红
  } else if (['NON_INVOICE'].includes(statementsStatus)) {
    return 'gray'; // 灰
  } else {
    return 'yellow'; // 黄
  }
}
export function statusObj(exportStatus) {
  switch (exportStatus) {
    case 'no_synchronization_required':
      return {
        color: 'gray',
        text: intl.get('smodr.orderLine.detail.noSynchronizationRequired').d('无需同步'),
      };
    case 'not_synchronized':
      return {
        color: 'yellow',
        text: intl.get('smodr.orderLine.detail.notSynchronized').d('未同步'),
      };
    case 'synchronization_failed':
      return {
        color: 'red',
        text: intl.get('smodr.orderLine.detail.synchronizationFailed').d('同步失败'),
      };
    case 'pushed':
        return {
          color: 'green',
          text: intl.get('smodr.orderLine.detail.pushed').d('已推送'),
        };
    case 'synchronization_succeeded':
      return {
        color: 'green',
        text: intl.get('smodr.orderLine.detail.synchronizationSucceeded').d('同步成功'),
      };
    default:
      return {
        color: 'gray',
        text: intl.get('smodr.orderLine.detail.noSynchronizationRequired').d('无需同步'),
      };
  }
}


export function statusObjDisplay(exportStatus) {
  switch (exportStatus) {
    case 'no_synchronization_required':
      return {
        color: 'gray',
        text: intl.get('smodr.orderLine.detail.noSynchronizationRequired').d('无需同步'),
      };
    case 'not_synchronized':
      return {
        color: 'yellow',
        text: intl.get('smodr.orderLine.detail.notSynchronized').d('未同步'),
      };
    case 'synchronization_failed':
      return {
        color: 'red',
        text: intl.get('smodr.orderLine.detail.synchronizationFailed').d('同步失败'),
      };
    case 'pushed':
        return {
          color: 'green',
          text: intl.get('smodr.orderLine.detail.pushed').d('已推送'),
        };
    case 'synchronization_succeeded':
      return {
        color: 'green',
        text: intl.get('smodr.orderLine.detail.synchronizationSucceeded').d('同步成功'),
      };
    default:
      return {
        color: 'gray',
        text: intl.get('smodr.orderLine.detail.noSynchronizationRequired').d('无需同步'),
      };
  }
}

