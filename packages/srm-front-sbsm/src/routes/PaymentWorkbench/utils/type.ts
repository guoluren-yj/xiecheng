export type Operate = 'all' | 'edit' | 'approve' | 'confirm' | 'reverse' | undefined;

export const BUCKET_DIRECTORY = 'payment-workbench';

export const PermissionCodeMap = {
  create: 'srm.sbsm.payment-platform.payment-workbench.button.create',
  createAll: 'srm.sbsm.payment-platform.payment-workbench.button.createAll',
  edit: 'srm.sbsm.payment-platform.payment-workbench.button.edit',
  submit: 'srm.sbsm.payment-platform.payment-workbench.button.submit',
  batchSubmit: 'srm.sbsm.payment-platform.payment-workbench.button.batchSubmit',
  cancel: 'srm.sbsm.payment-platform.payment-workbench.button.cancel',
  bepInitiate: 'srm.sbsm.payment-platform.payment-workbench.button.bepInitiate',
  bepCancel: 'srm.sbsm.payment-platform.payment-workbench.button.bepCancel',
  offlineConfirm: 'srm.sbsm.payment-platform.payment-workbench.button.offlineConfirm',
  offlineCancel: 'srm.sbsm.payment-platform.payment-workbench.button.offlineCancel',
  paperConfirm: 'srm.sbsm.payment-platform.payment-workbench.button.paperConfirm',
  paperCancel: 'srm.sbsm.payment-platform.payment-workbench.button.paperCancel',
  reverse: 'srm.sbsm.payment-platform.payment-workbench.button.reverse',
  wholeExport: 'srm.sbsm.payment-platform.payment-workbench.button.wholeExport',
  detailExport: 'srm.sbsm.payment-platform.payment-workbench.button.detailExport',
  operationRecord: 'srm.sbsm.payment-platform.payment-workbench.button.operationRecord',
  print: 'srm.sbsm.payment-platform.payment-workbench.button.print',
};

export enum ActiveKey {
  WholeAll = 'whole-all',
  WholeEdit = 'whole-edit',
  WholeApprove = 'whole-approve',
  WholeConfirm = 'whole-confirm',
  WholeReverse = 'whole-reverse',
  DetailPayment = 'detail-payment',
  DetailStatement = 'detail-statement',
};

export const ActionMap = {
  [ActiveKey.WholeEdit]: 'UPDATE',
  [ActiveKey.WholeApprove]: 'APPROVE',
  [ActiveKey.WholeConfirm]: 'CONFIRM',
  [ActiveKey.WholeReverse]: 'DEDUCTIBLE',
};

// 列表页-表格个性化单元
export const GridCustCodeMap = {
  [ActiveKey.WholeAll]: 'SBSM.PAYMENT_WORKBENCH_LIST.GRID_WHOLE_ALL',
  [ActiveKey.WholeEdit]: 'SBSM.PAYMENT_WORKBENCH_LIST.GRID_WHOLE_EDIT',
  [ActiveKey.WholeApprove]: 'SBSM.PAYMENT_WORKBENCH_LIST.GRID_WHOLE_APPROVE',
  [ActiveKey.WholeConfirm]: 'SBSM.PAYMENT_WORKBENCH_LIST.GRID_WHOLE_CONFIRM',
  [ActiveKey.WholeReverse]: 'SBSM.PAYMENT_WORKBENCH_LIST.GRID_WHOLE_REVERSE',
  [ActiveKey.DetailPayment]: 'SBSM.PAYMENT_WORKBENCH_LIST.GRID_DETAIL_PAYMENT',
  [ActiveKey.DetailStatement]: 'SBSM.PAYMENT_WORKBENCH_LIST.GRID_DETAIL_STATEMENT',
};

// 列表页-筛选器个性化单元
export const FilterCustCodeMap = {
  [ActiveKey.WholeAll]: 'SBSM.PAYMENT_WORKBENCH_LIST.FILTER_WHOLE_ALL',
  [ActiveKey.WholeEdit]: 'SBSM.PAYMENT_WORKBENCH_LIST.FILTER_WHOLE_EDIT',
  [ActiveKey.WholeApprove]: 'SBSM.PAYMENT_WORKBENCH_LIST.FILTER_WHOLE_APPROVE',
  [ActiveKey.WholeConfirm]: 'SBSM.PAYMENT_WORKBENCH_LIST.FILTER_WHOLE_CONFIRM',
  [ActiveKey.WholeReverse]: 'SBSM.PAYMENT_WORKBENCH_LIST.FILTER_WHOLE_REVERSE',
  [ActiveKey.DetailPayment]: 'SBSM.PAYMENT_WORKBENCH_LIST.FILTER_DETAIL_PAYMENT',
  [ActiveKey.DetailStatement]: 'SBSM.PAYMENT_WORKBENCH_LIST.FILTER_DETAIL_STATEMENT',
};

// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SBSM.PAYMENT_WORKBENCH_LIST.TABS';

// 列表页-按钮组个性化单元
export const ListBtnsCustCode = 'SBSM.PAYMENT_WORKBENCH_LIST.BTNS';

export const HeadCustCodeMap = {
  Basic: 'SBSM.PAYMENT_WORKBENCH_DETAIL.BASIC',
  Attachment: 'SBSM.PAYMENT_WORKBENCH_DETAIL.ATTACHMENT',
};

export const FlowCardCustCodeMap = {
  Basic: 'SBSM.PAYMENT_WORKBENCH_DETAIL.FLOW_CARD_BASIC',
};

export const FillHeadCustCodeMap = {
  cancel: 'SBSM.PAYMENT_WORKBENCH_DETAIL.FILL_HEAD_CANCEL',
  reverse: 'SBSM.PAYMENT_WORKBENCH_DETAIL.FILL_HEAD_REVERSE',
};

export const DetailBtnsCustCode = 'SBSM.PAYMENT_WORKBENCH_DETAIL.BTNS';

export const DetailCollapseCode = 'SBSM.PAYMENT_WORKBENCH_DETAIL.COLLAPSE';

export const BatchFlowCustCodeMap = {
  Collapse: 'SBSM.PAYMENT_WORKBENCH_BATCH_FLOW.COLLAPSE',
  BasicCard: 'SBSM.PAYMENT_WORKBENCH_BATCH_FLOW.BASIC_CARD',
  BatchInfo: 'SBSM.PAYMENT_WORKBENCH_BATCH_FLOW.BATCH_INFO',
  PayList: 'SBSM.PAYMENT_WORKBENCH_BATCH_FLOW.PAY_LIST',
};

export const PaymentLineGridCode = 'SBSM.PAYMENT_WORKBENCH_DETAIL.PAYMENT_LINE_GRID';

export const PaymentLineAddCodeMap = {
  Grid: 'SBSM.PAYMENT_WORKBENCH_DETAIL.PAYMENT_LINE_ADD_GRID',
  Filter: 'SBSM.PAYMENT_WORKBENCH_DETAIL.PAYMENT_LINE_ADD_FILTER',
};

export const PaperLineAddCodeMap = {
  Grid: 'SBSM.PAYMENT_WORKBENCH_DETAIL.STATEMENT_LINE_ADD_PAPER_GRID',
  Filter: 'SBSM.PAYMENT_WORKBENCH_DETAIL.STATEMENT_LINE_ADD_PAPER_FILTER',
};

export const StatementLineCodeMap = {
  BepForm: 'SBSM.PAYMENT_WORKBENCH_DETAIL.STATEMENT_LINE_BEP_FORM',
  PaperGrid: 'SBSM.PAYMENT_WORKBENCH_DETAIL.STATEMENT_LINE_PAPER_GRID',
  OfflineGrid: 'SBSM.PAYMENT_WORKBENCH_DETAIL.STATEMENT_LINE_OFFLINE_GRID',
};

export const InitiatePayCodeMap = {
  BepGrid: 'SBSM.PAYMENT_WORKBENCH_DETAIL.INITIATE_BEP_GRID',
  PaperGrid: 'SBSM.PAYMENT_WORKBENCH_DETAIL.INITIATE_PAPER_GRID',
  OfflineGrid: 'SBSM.PAYMENT_WORKBENCH_DETAIL.INITIATE_OFFLINE_GRID',
  PaperBatch: 'SBSM.PAYMENT_WORKBENCH_DETAIL.INITIATE_PAPER_BATCH',
  OfflineBatch: 'SBSM.PAYMENT_WORKBENCH_DETAIL.INITIATE_OFFLINE_BATCH',
};

export const MatchLineGridCode = 'SBSM.PAYMENT_WORKBENCH_DETAIL.MATCH_LINE_GRID';

export const BepResultGridCode = 'SBSM.PAYMENT_WORKBENCH_DETAIL.BEP_RESULT_GRID';

export const FillPayPoolGridCode = 'SBSM.PAYMENT_WORKBENCH_DETAIL.NEW_FILL_POOL_GRID';

export const FillPayPoolBatchEditCode = 'SBSM.PAYMENT_WORKBENCH_DETAIL.NEW_FILL_POOL_BATCH_EDIT';