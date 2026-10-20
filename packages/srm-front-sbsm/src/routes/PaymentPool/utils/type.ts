export enum ActiveKey {
  All = 'all',
  Pending = 'pending',
  Error = 'error',
};

export const PermissionCodeMap = {
  create: 'srm.sbsm.payment-platform.payment-pool.button.create',
  createAll: 'srm.sbsm.payment-platform.payment-pool.button.createAll',
  return: 'srm.sbsm.payment-platform.payment-pool.button.return',
  hold: 'srm.sbsm.payment-platform.payment-pool.button.hold',
  export: 'srm.sbsm.payment-platform.payment-pool.button.export',
  sourceDetail: 'srm.sbsm.payment-platform.payment-pool.button.sourceDocDetail',
};

export const ActionMap: Record<ActiveKey, string | null> = {
  [ActiveKey.All]: 'ALL',
  [ActiveKey.Pending]: 'PAY',
  [ActiveKey.Error]: null,
};

// 列表页-表格个性化单元
export const GridCustCodeMap = {
  [ActiveKey.All]: 'SBSM.PAYMENT_POOL_LIST.GRID_ALL',
  [ActiveKey.Pending]: 'SBSM.PAYMENT_POOL_LIST.GRID_PENDING',
  [ActiveKey.Error]: 'SBSM.PAYMENT_POOL_LIST.GRID_ERROR',
};

// 列表页-筛选器个性化单元
export const SearchCustCodeMap = {
  [ActiveKey.All]: 'SBSM.PAYMENT_POOL_LIST.SEARCH_ALL',
  [ActiveKey.Pending]: 'SBSM.PAYMENT_POOL_LIST.SEARCH_PENDING',
  [ActiveKey.Error]: 'SBSM.PAYMENT_POOL_LIST.SEARCH_ERROR',
};

// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SBSM.PAYMENT_POOL_LIST.TABS';

// 列表页-按钮组个性化单元
export const ListBtnsCustCode = 'SBSM.PAYMENT_POOL_LIST.BTNS';

export const HeadCustCodeMap = {
  Counterparty: 'SBSM.PAYMENT_POOL_DETAIL.COUNTERPARTY',
  Transaction: 'SBSM.PAYMENT_POOL_DETAIL.TRANSACTION',
  Amount: 'SBSM.PAYMENT_POOL_DETAIL.AMOUNT',
};

export const ErrorHeadCustCodeMap = {
  Counterparty: 'SBSM.PAYMENT_POOL_ERROR_DETAIL.COUNTERPARTY',
  Transaction: 'SBSM.PAYMENT_POOL_ERROR_DETAIL.TRANSACTION',
};

export const ExeCustCodeMap = {
  Grid: 'SBSM.PAYMENT_POOL_DETAIL.EXECUTION_GRID',
  Filter: 'SBSM.PAYMENT_POOL_DETAIL.EXECUTION_FILTER',
};

// 提供给外部使用使用
export const PendingCustCodeMap = {
  Grid: GridCustCodeMap[ActiveKey.Pending],
  Filter: SearchCustCodeMap[ActiveKey.Pending],
};
