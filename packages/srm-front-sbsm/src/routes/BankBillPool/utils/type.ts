export type Operate = 'edit' ;

export const BUCKET_DIRECTORY = 'bank-bill-pool';

export const PermissionCodeMap = {
  create: 'srm.sbsm.payment-platform.bank-bill-pool.button.create',
  void: 'srm.sbsm.payment-platform.bank-bill-pool.button.void',
  split: 'srm.sbsm.payment-platform.bank-bill-pool.button.split',
  without: 'srm.sbsm.payment-platform.bank-bill-pool.button.without',
  export: 'srm.sbsm.payment-platform.bank-bill-pool.button.export',
};

export enum ActiveKey {
  All = 'all',
  Usable = 'usable',
  Occupy = 'occupy',
  Without = 'without',
};

export const ActionMap: Record<ActiveKey, string> = {
  [ActiveKey.All]: 'ALL',
  [ActiveKey.Usable]: 'USABLE',
  [ActiveKey.Occupy]: 'USED',
  [ActiveKey.Without]: 'NO_NEED_USE',
};

// 列表页-表格个性化单元
export const GridCustCodeMap = {
  [ActiveKey.All]: 'SBSM.BANK_BILL_POOL_LIST.GRID_ALL',
  [ActiveKey.Usable]: 'SBSM.BANK_BILL_POOL_LIST.GRID_USABLE',
  [ActiveKey.Occupy]: 'SBSM.BANK_BILL_POOL_LIST.GRID_OCCUPY',
  [ActiveKey.Without]: 'SBSM.BANK_BILL_POOL_LIST.GRID_WITHOUT',
};

// 列表页-筛选器个性化单元
export const FilterCustCodeMap = {
  [ActiveKey.All]: 'SBSM.BANK_BILL_POOL_LIST.FILTER_ALL',
  [ActiveKey.Usable]: 'SBSM.BANK_BILL_POOL_LIST.FILTER_USABLE',
  [ActiveKey.Occupy]: 'SBSM.BANK_BILL_POOL_LIST.FILTER_OCCUPY',
  [ActiveKey.Without]: 'SBSM.BANK_BILL_POOL_LIST.FILTER_WITHOUT',
};
// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SBSM.BANK_BILL_POOL_LIST.TABS';
// 列表页-按钮组个性化单元
export const ListBtnsCustCode = 'SBSM.BANK_BILL_POOL_LIST.BTNS';

export const DetailBtnsCustCode = 'SBSM.BANK_BILL_POOL_DETAIL.BTNS';

export const DetailCollapseCode = 'SBSM.BANK_BILL_POOL_DETAIL.COLLAPSE';

// 详情页个性化单元
export const HeadCustCodeMap = {
  Basic: 'SBSM.BANK_BILL_POOL_DETAIL.BASIC',
  Attachment: 'SBSM.BANK_BILL_POOL_DETAIL.ATTACHMENT',
};

export const SplitCustCode = 'SBSM.BANK_BILL_POOL_LIST.SPLIT_GRID';

export const PayDocRecordCustCode = 'SBSM.BANK_BILL_POOL_LIST.PAY_DOC_RECORD';