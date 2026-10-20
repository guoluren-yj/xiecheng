const getLineSearchbarCode = (orderType) => {
  switch (orderType) {
    case 'OUT': return 'SSTK.STOCK_DETAIL.OUT.LINE.SEARCHBAR';
    case 'TRANSFER': return 'SSTK.STOCK_DETAIL.TRANSFER.LINE.SEARCHBAR';
    default: return 'SSTK.STOCK_DETAIL.LINE.SEARCHBAR'; // IN
  }
};

const inOrderCodes = {
  header: 'SSTK.STOCK_DETAIL.IN.ORDER_LINE', // 入库单头
  line: `SSTK.STOCK_DETAIL.ORDER_LINE`, // 入库单-单据行
};

const outOrderCodes = {
  header: 'SSTK.STOCK_DETAIL.OUT.ORDER_HEADER',
  line: `SSTK.STOCK_DETAIL.OUT_ORDER.LINE`,
};

const transferOrderCodes = {
  header: 'SSTK.STOCK_DETAIL.TRANSFER.ORDER_HEADER',
  line: `SSTK.STOCK_DETAIL.TRANSFER_ORDER.LINE`,
};

const importCode = {
  IN: 'SRM_C_SRM_STCK_IN_OUT_ORDER_IN',
  OUT: 'SRM_C_SRM_STCK_IN_OUT_ORDER_OUT',
  TRANSFER: 'SRM_C_SRM_STCK_IN_OUT_ORDER_TRANSFER',
};

const detailCodes = [
  inOrderCodes.header,
  inOrderCodes.line,
  outOrderCodes.header,
  outOrderCodes.line,
  transferOrderCodes.header,
  transferOrderCodes.line,
];

export {
  inOrderCodes,
  outOrderCodes,
  transferOrderCodes,
  detailCodes,
  importCode,
  getLineSearchbarCode,
};
