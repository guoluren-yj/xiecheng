// 详情页路由参数operate
export type Operate = 'create' | 'edit' | 'view' | 'copy' | 'all' | 'history';

// 列表页个性化编码
export enum ListCustomizeCode {
  TableCode = 'SBSM.FUND_PLAN_FORCE_LIST.GRID', // 表格
  SearchBarCode = 'SBSM.FUND_PLAN_FORCE_LIST.SEARCH_BAR', // 筛选器
}

export const ListCustomizeBtnCode = 'SBSM.FUND_PLAN_FORCE_LIST.BTNS';

export const DetailBasicCode = 'SBSM.FUND_PLAN_FORCE_DETAIL.TERM_BASIC';

export const DetailLineCode = 'SBSM.FUND_PLAN_FORCE_DETAIL.TERM_LINE';
