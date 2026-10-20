export enum ActiveKey {
  All = 'all',
  Success = 'success',
  Refund = 'refund',
  Refundable = 'refundable',
  Abnormal = 'abnormal',
};

export const ActionMap: Record<ActiveKey, string | null> = {
  [ActiveKey.All]: 'ALL',
  [ActiveKey.Success]: 'SUCCESS',
  [ActiveKey.Refund]: 'REFUND',
  [ActiveKey.Refundable]: 'REFUNDABLE',
  [ActiveKey.Abnormal]: 'ABNORMAL',
};

// 列表页-表格个性化单元
export const GridCustCodeMap = {
  [ActiveKey.All]: 'SBSM.BANK_FLOW_POOL_LIST.GRID_ALL',
  [ActiveKey.Success]: 'SBSM.BANK_FLOW_POOL_LIST.GRID_SUCCESS',
  [ActiveKey.Refund]: 'SBSM.BANK_FLOW_POOL_LIST.GRID_REFUND',
  [ActiveKey.Refundable]: 'SBSM.BANK_FLOW_POOL_LIST.GRID_REFUNDABLE',
  [ActiveKey.Abnormal]: 'SBSM.BANK_FLOW_POOL_LIST.GRID_ABNORMAL',
};

// 列表页-筛选器个性化单元
export const SearchCustCodeMap = {
  [ActiveKey.All]: 'SBSM.BANK_FLOW_POOL_LIST.SEARCH_ALL',
  [ActiveKey.Success]: 'SBSM.BANK_FLOW_POOL_LIST.SEARCH_SUCCESS',
  [ActiveKey.Refund]: 'SBSM.BANK_FLOW_POOL_LIST.SEARCH_REFUND',
  [ActiveKey.Refundable]: 'SBSM.BANK_FLOW_POOL_LIST.SEARCH_REFUNDABLE',
  [ActiveKey.Abnormal]: 'SBSM.BANK_FLOW_POOL_LIST.SEARCH_ABNORMAL',
};

// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SBSM.BANK_FLOW_POOL_LIST.TABS';

// 列表页-按钮组个性化单元
export const ListBtnsCustCode = 'SBSM.BANK_FLOW_POOL_LIST.BTNS';
// 银行流水池退票匹配-退票收款流水信息
export const RefundFlowListCode = 'SBSM.BANK_FLOW_POOL_MATCH_REFUND.REFUND_FLOW_LIST';
// 银行流水池退票匹配-退票收款流水信息
export const MatchExpendFlowListCode = 'SBSM.BANK_FLOW_POOL_MATCH_REFUND.MATCH_EXPEND_FLOW_LIST';
// 银行流水池退票匹配-退票收款流水信息-匹配流水弹框
export const MatchFlowListCode = 'SBSM.BANK_FLOW_POOL_MATCH_REFUND.MATCH_FLOW_LIST';
// 银行流水池退票匹配-退票收款流水信息-匹配流水弹框-筛选器
export const MatchFlowSearchCode = 'SBSM.BANK_FLOW_POOL_MATCH_REFUND.MATCH_FLOW_SEARCH';

export const PermissionCode = {
  export: `srm.sbsm.payment-platform.bank-flow-pool.button.export`,
  refundMatchRecord: `srm.sbsm.payment-platform.bank-flow-pool.button.refundMatchRecord`,
  refundMatch: `srm.sbsm.payment-platform.bank-flow-pool.button.refundMatch`,
};
