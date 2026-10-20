export type Operate = 'all' | 'edit' | 'approve' | 'confirm' | 'reverse' | undefined;


export const PermissionCodeMap = {
  cancel: 'srm.settle-account.direct-pool.supply.ps.radio.button.cancel',
  direct: 'srm.settle-account.direct-pool.supply.ps.radio.button.direct',
  create: 'srm.settle-account.direct-pool.supply.ps.radio.button.create',
  export: 'srm.settle-account.direct-pool.supply.ps.radio.button.export',
  deliveryAgain: 'srm.settle-account.direct-pool.supply.button.deliveryAgain',
};
// B待开票 c已开票 d垃圾箱 a全部
export enum ActiveKey {
  B = 'b',
  C = 'c',
  D = 'd',
  A = 'a',
  InvoiceAll = 'invoice-all',
  InvoicePending = 'invoice-pending',
};

export const ActionMap = {
  [ActiveKey.B]: 'INVOICE',
  [ActiveKey.C]: 'INVOICED',
  [ActiveKey.D]: 'INVOICE_ERROR',
  [ActiveKey.A]: 'ALL',
  [ActiveKey.InvoiceAll]: 'ALL',
  [ActiveKey.InvoicePending]: 'UPDATE',
};

export const ActionMapReserve = {
  affair: {
    'INVOICE': ActiveKey.B,
    'INVOICED': ActiveKey.C,
    'INVOICE_ERROR': ActiveKey.D,
    'ALL': ActiveKey.A,
  },
  invoice: {
    'ALL': ActiveKey.InvoiceAll,
    'UPDATE': ActiveKey.InvoicePending,
  },
};

// 列表页-表格个性化单元
export const GridCustCodeMap = {
    [ActiveKey.B]: 'SDIM.POOL_SUPPLY.TAB_INVOICE.GRID',
    [ActiveKey.C]: 'SDIM.POOL_SUPPLY.TAB_INVOICED.GRID',
    [ActiveKey.D]: 'SDIM.POOL_SUPPLY.TAB_TRASH.GRID',
    [ActiveKey.A]: 'SDIM.POOL_SUPPLY.TAB_ALL.GRID',
    [ActiveKey.InvoiceAll]: 'SDIM.DIRECT_INVOICE_LIST.GRID_ALL',
    [ActiveKey.InvoicePending]: 'SDIM.DIRECT_INVOICE_LIST.GRID_PENDING',
};

// 列表页-筛选器个性化单元
export const FilterCustCodeMap = {
    [ActiveKey.B]: 'SDIM.POOL_SUPPLY.TAB_INVOICE.SEARCH_BAR',
    [ActiveKey.C]: 'SDIM.POOL_SUPPLY.TAB_INVOICED.SEARCH_BAR',
    [ActiveKey.D]: 'SDIM.POOL_SUPPLY.TAB_TRASH.SEARCH_BAR',
    [ActiveKey.A]: 'SDIM.POOL_SUPPLY.TAB_ALL.SEARCH_BAR',
    [ActiveKey.InvoiceAll]: 'SDIM.DIRECT_INVOICE_LIST.SEARCH_ALL',
    [ActiveKey.InvoicePending]: 'SDIM.DIRECT_INVOICE_LIST.SEARCH_PENDING',
};

// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SDIM.POOL_SUPPLY.TABS.LIST';

// 列表页-按钮组个性化单元
export const ListBtnsCustCode = 'SDIM.POOL_SUPPLY.BTNS.LIST_HEADER';
