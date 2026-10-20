import { OperationIconType } from '../../../components/HistoryRecord/enum';

export type Operate = 'view' | 'edit' | 'check' | 'create' | 'cancel' | undefined;

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

export enum TagColor {
}

export const ActionType: Record<ActiveKey, string> = {
  [WholeAll]: 'ALL',
  [WholePending]: 'PENDING',
  [WholeApprove]: 'APPROVE',
  [DetailAll]: 'ALL',
};

// 整单 个性化编码
export const WholeListCode = {
  [WholeAll]: 'SBSM.FUND_PLAN_PREPARATION.WHOLE_GRID_ALL',
  [WholeApprove]: 'SBSM.FUND_PLAN_PREPARATION.WHOLE_GRID_APPROVE',
  [WholePending]: 'SBSM.FUND_PLAN_PREPARATION.WHOLE_GRID_PENDING',
};

// 整单  查询个性化编码
export const WholeSearchCode = {
  [WholeAll]: 'SBSM.FUND_PLAN_PREPARATION.WHOLE_SEARCH_ALL',
  [WholeApprove]: 'SBSM.FUND_PLAN_PREPARATION.WHOLE_SEARCH_APPROVE',
  [WholePending]: 'SBSM.FUND_PLAN_PREPARATION.WHOLE_SEARCH_PENDING',
};

// 明细行  个性化编码
export const DetailListCode = {
  [DetailAll]: 'SBSM.FUND_PLAN_PREPARATION.STAGE_LIST_ALL',
};
// 查看明细行
export const DetailListLineCode = 'SBSM.FUND_PLAN_PREPARATION.DETAIL_LIST_LINE';

// 明细行  个性化编码
export const DetailSearchCode = {
  [DetailAll]: 'SBSM.FUND_PLAN_PREPARATION.DETAIL_SEARCH_ALL',
};

// 标签组
export const ListTabsCustCode = 'SBSM.FUND_PLAN_PREPARATION.TABS';

// 按钮组
export const ListTableBtnCode = 'SBSM.FUND_PLAN_PREPARATION.BTNS';

// 新建个性化
// 标签组
export const CreateTabsCode = 'SBSM.FUND_PLAN_PREPARATION.CREATE_TABS';

// 按钮组
export const CreateFooterCode = 'SBSM.FUND_PLAN_PREPARATION.CREATE_FOOTER_BTNS';

// 可编制 来源
export const CreateSourceCode = {
  List: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.SOURCE_GRID_COMPILE',
  Search: 'SBSM.FUND_PLAN_PREPARATION_DETAIL.SOURCE_SEARCH_COMPILE',
};

// 可编制 阶段
export const CreateStageCode = {
  List: 'SBSM.FUND_PLAN_PREFABRICATION_LIST.STAGE_LIST_COMPILE',
  Search: 'SBSM.FUND_PLAN_PREPARATION_DETAIL.STAGE_SEARCH_COMPILE',
};

// 详情页
// 按钮组
export const DetailBtnCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.BTNS';
// 详情页个性化编码
export enum DetailCustomizeCode {
  BasicFormCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.BASIC_INFO', // 基本信息
  LineTableCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.LINE', // 行
  LineTableBtn = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.LINE_BTN', // 行按钮
  LineSearchTableCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.LINE_SEARCH', // 行
  LineBatchCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.PREP_LINE_BATCH_EDIT', // 行-批量编辑
  ResultTableCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.PREP_MULTIPLE_LINE', // 多维度编制查询
  ResultSearchTableCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.PREP_MULTIPLE_SEARCH_LINE', // 多维度编制查询筛选

  PreStageInfoCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.PREP_STAGE_INFO', // 调整批量详情-编制阶段信息
  PreStageLineCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.PRE_STAGE_LINE', // 调整批量详情-编制来源单据行匹配阶段明细
  PreStageBatchCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.LINE_DETAIL_BATCH_EDIT', // 调整批量详情-批量编辑

};

// 详情折叠面板
export const DetailCollapseCode = 'SBSM.FUND_PLAN_PREPARATION_DETAIL.COLLAPSE';

export const PermissionCode = {
  initialExcelImport: `srm.sbsm.fund-plan-preparation.button.initialExcelImport`,
  cancel: `srm.sbsm.fund-plan-preparation.button.cancel`,
  lineExport: `srm.sbsm.fund-plan-preparation.button.lineexport`,
  batchSubmit: `srm.sbsm.fund-plan-preparation.button.submitBatch`,
  export: `srm.sbsm.fund-plan-preparation.button.export`,
};

export const actionEnum = {
  CREATE: {
    icon: OperationIconType.Add,
  },
  SUBMITED: {
    icon: OperationIconType.Submit,
  },
  CANCELED: {
    icon: OperationIconType.Cancel,
  },
  APPROVED: {
    icon: OperationIconType.Approve,
  },
  CONFIRMED: {
    icon: OperationIconType.Confirm,
  },
  REJECTED: {
    icon: OperationIconType.Return,
  },
  REVOKEED: {
    icon: OperationIconType.Revoke,
  },
};

export const ActionExportType: Record<ActiveKey, string> = {
  [WholeAll]: 'ALL',
  [WholePending]: 'SUBMIT',
  [WholeApprove]: 'APPROVE',
  [DetailAll]: '',
};
