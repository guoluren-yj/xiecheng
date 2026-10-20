export type Operate = 'edit' | 'all' | 'cancel' | undefined;

// eslint-disable-next-line no-shadow
export enum ActiveKey {
  WholeAll = 'whole-all', // 整单-全部
  WholePending = 'whole-pending', // 整单-待提交
  WholeApprove = 'whole-approve', // 整单-待审批
  DetailAll = 'detail-all', // 明细行-全部
};

export const {
  WholeAll,
  WholePending,
  WholeApprove,
  DetailAll,
} = ActiveKey;

export const ListGridCode = {
  [WholeAll]: 'SBSM.FUND_PLAN_SUMMARY.GRID_WHOLE_ALL',
  [WholeApprove]: 'SBSM.FUND_PLAN_SUMMARY.GRID_WHOLE_APPROVE',
  [WholePending]: 'SBSM.FUND_PLAN_SUMMARY.GRID_WHOLE_PENDING',
  [DetailAll]: 'SBSM.FUND_PLAN_SUMMARY.GRID_DETAIL_ALL',
};

export const ListFilterCode = {
  [WholeAll]: 'SBSM.FUND_PLAN_SUMMARY.FILTER_WHOLE_ALL',
  [WholeApprove]: 'SBSM.FUND_PLAN_SUMMARY.FILTER_WHOLE_APPROVE',
  [WholePending]: 'SBSM.FUND_PLAN_SUMMARY.FILTER_WHOLE_PENDING',
  [DetailAll]: 'SBSM.FUND_PLAN_SUMMARY.FILTER_DETAIL_ALL',
};


// 标签组
export const ListTabsCustCode = 'SBSM.FUND_PLAN_SUMMARY.TABS';

// 按钮组
export const ListTableBtnCode = 'SBSM.FUND_PLAN_SUMMARY.BTNS';

// 新建个性化
// 标签组
export const QuoteCreateTabsCode = 'SBSM.FUND_PLAN_SUMMARY_NEW.TABS';

export const CreateSourceCode = {
  Grid: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_GRID_SUMMARY',
  Filter: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_SEARCH_SUMMARY',
};

export const CreateStageCode = {
  Grid: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_LIST_SUMMARY',
  Filter: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_SEARCH_SUMMARY',
};

export const LineAddSourceCode = {
  Grid: 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_ADD_GRID_PREP',
  Filter: 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_ADD_FILTER_PREP',
};

export const LineAddStageCode = {
  Grid: 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_ADD_GRID_STAGE',
  Filter: 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_ADD_FILTER_STAGE',
};


// 详情页
// 按钮组
export const DetailBtnCode = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.BTNS';
// 详情页个性化编码
export enum DetailCustomizeCode {
  BasicFormCode = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.BASIC', // 基本信息
  LineTableCode = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_GRID', // 行
  LineTableBtns = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_BTNS', // 行
  LineFilterCode = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_FILTER', // 行
  LineBatchEditCode = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_BATCH_EDIT', // 行-批量编辑
};

export enum LineDetailCuszCode {
  Basic = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_DETAIL_BASIC',
  RelatedGrid = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_DETAIL_RELATED_GRID',
  RelatedBatchEdit = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.LINE_DETAIL_RELATED_BATCH_EDIT',
}

// 详情折叠面板
export const DetailCollapseCode = 'SBSM.FUND_PLAN_SUMMARY_DETAIL.COLLAPSE';

export const PermissionCode = {
  initialExcelImport: `srm.sbsm.fund-plan-summary.button.initialExcelImport`,
  cancel: `srm.sbsm.fund-plan-summary.button.cancel`,
  returnPrePool: `srm.sbsm.fund-plan-summary.button.returnPrePool`,
  lineExport: `srm.sbsm.fund-plan-summary.button.lineexport`,
  export: `srm.sbsm.fund-plan-summary.button.export`,
  createAll: `srm.sbsm.fund-plan-summary.button.createAll`,
};


export const ActionExportType: Record<ActiveKey, string> = {
  [WholeAll]: 'ALL',
  [WholePending]: 'SUBMIT',
  [WholeApprove]: 'APPROVE',
  [DetailAll]: '',
};
