// eslint-disable-next-line no-shadow
export enum ActiveKey {
  SourceLines = 'source-lines', // 来源单据视图-全部
  SourceError = 'source-error', // 来源单据视图-错误记录

  SourceAll = 'source-all', // 来源单据视图-全部
  SourceCompile = 'source-compile', // 来源单据视图-待编制
  SourceSummary = 'source-summary', // 来源单据视图-待汇总

  StageAll = 'stage-all', // 阶段视图-全部
  StageCompile = 'stage-compile', // 阶段视图-待编制
  StageSummary = 'stage-summary', // 阶段视图-待编制
};

export const {
  SourceAll,
  SourceError,
  SourceCompile,
  SourceSummary,
  SourceLines,

  StageAll,
  StageCompile,
  StageSummary,
} = ActiveKey;

export enum TagColor {
}

// 对应请求类型传参 根据后端定义
export const ActionType: Record<ActiveKey, string> = {
  [SourceAll]: 'ALL',
  [SourceError]: 'ERROR',
  [SourceCompile]: 'COMPILE',
  [SourceSummary]: 'SUMMARY',
  [SourceLines]: 'LINE',

  [StageAll]: 'ALL',
  [StageCompile]: 'COMPILE',
  [StageSummary]: 'SUMMARY',
};

// 来源单据视图列表 个性化编码
export const SourceListCode = {
  [SourceAll]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_GRID_ALL',
  [SourceError]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_LIST_ERROR',
  [SourceCompile]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_GRID_COMPILE',
  [SourceSummary]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_GRID_SUMMARY',
  [SourceLines]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_GRID_LINE_ALL',
};

// 来源单据视图列表  查询个性化编码
export const SourceSearchCode = {
  [SourceAll]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_SEARCH_ALL',
  [SourceError]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_ERROR_SEARCH',
  [SourceCompile]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_SEARCH_COMPILE',
  [SourceSummary]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_SEARCH_SUMMARY',
  [SourceLines]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_ALL_LINE_SEARCH',
};

// 阶段视图列表  个性化编码
export const StageListCode = {
  [StageAll]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_LIST_ALL',
  [StageCompile]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_LIST_COMPILE',
  [StageSummary]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_LIST_SUMMARY',
};

// 阶段视图列表  个性化编码
export const StageSearchCode = {
  [StageAll]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_SEARCH_ALL',
  [StageCompile]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_SEARCH_COMPILE',
  [StageSummary]: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_SEARCH_SUMMARY',
};

// 标签组
export const ListTabsCustCode = 'SBSM.FUND_PLAN_PREFABRICATION_LIST.TABS';

// 按钮组
export const ListTableBtnCode = 'SBSM.FUND_PLAN_PREFABRICATION_LIST.BTNS';

// 阶段视图侧弹框 基本信息
export const StageAllDetailBasicCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.STAGE_DETAIL_BASIC';
// 阶段信息
export const StageAllDetailLineCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.STAGE_DETAIL_TERM_GRID';
// 编制规则
export const StageAllPrepRuleCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.STAGE_DETAIL_PREP_RULE';
// 预制信息
export const StageAllPrefabInfoCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.STAGE_DETAIL_PREFAB_INFO';
// 预制事务详情
export const StageAllDetailPreLineCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.STAGE_DETAIL_PRE_LINE';
// 编制信息
export const StageAllPrepInfoCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.STAGE_DETAIL_PREP_INFO';
// 编制信息行
export const PrepLineCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PREP_LINE_LIST';
// 编制信息行 明细
export const PrepLineDetailCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PREP_LINE_DETAIL_LIST';
// 汇总信息
export const summaryInfoCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.SUMMARY_INFO';
// 汇总信息行
export const summaryLineCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.SUMMARY_LINE_LIST';
// 汇总信息行 明细
export const summaryLineDetailCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.SUMMARY_LINE_DETAIL_LIST';
// 预付款信息
export const prePaymentInfoCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PREPAYMENT_INFO';
// 预付款信息行
export const prePaymentLineCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PREPAYMENT_LINE_LIST';
// 预付款信息行 明细
export const prePaymentLineDetailCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PREPAYMENT_LINE_DETAIL_LIST';
// 付款信息
export const paymentInfoCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PAYMENT_INFO';
// 付款信息行
export const paymentLineCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PAYMENT_LINE_LIST';
// 付款信息行 明细
export const paymentLineDetailCode = 'SBSM.FUND_PLAN_PREFABRICATION_DETAIL.PAYMENT_LINE_DETAIL_LIST';



export const statusMap = {
  'UN_PREFAB': 'info',
  'PREFABBING': 'warn',
  'PREFABBED': 'success',
  'UN_PREP': 'info',
  'PREPPING': 'warn',
  'PREPPED': 'success',
  'UN_BAL': 'info',
  'BALANCING': 'warn',
  'BALANCED': 'success',
};

export const SourcePrimaryKey = {
  [ActiveKey.SourceError]: 'prepPoolErrorId',
  [ActiveKey.SourceLines]: 'poolLineId',
};

export const PermissionCode = {
  returnPrePool: `srm.sbsm.fund-plan-prefabrication-pool-list.button.returnPrePool`,
  stageExport: `srm.sbsm.fund-plan-prefabrication-pool-list.button.stageExport`,
  allCreate: `srm.sbsm.fund-plan-prefabrication-pool-list.button.allCreate`,
};


