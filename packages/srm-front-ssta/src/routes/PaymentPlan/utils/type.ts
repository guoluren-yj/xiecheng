import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';

export type Operate = 'view' | 'edit' | 'history' | 'all' | 'change';

export const ChangedStatusList = [
  RecordStatus.add,
  RecordStatus.update,
  RecordStatus.delete,
];

export const MyRecordStatus = {
  [RecordStatus.add]: 'add',
  [RecordStatus.update]: 'update',
  [RecordStatus.delete]: 'delete',
  [RecordStatus.sync]: 'sync',
};

export enum RegEx {
  NOCHINESE = '^[^\\u4e00-\\u9fa5]+$', // chinese=false
  FREQUENCY = '^[-]?\\d+(,[-]?\\d+)*$', // 英文逗号分隔数字
};

// 固定格式、前缀和分隔符不可更改
export enum ActiveKey {
  WholeAll = 'whole-all',
  WholeProgress = 'whole-executing',
  WholeNotStart = 'whole-effective',
  DetailAll = 'detail-all',
  DetailProgress = 'detail-executing',
  DetailNotStart = 'detail-effective',
};

const {
  WholeAll,
  WholeProgress,
  WholeNotStart,
  DetailAll,
  DetailProgress,
  DetailNotStart,
} = ActiveKey;

// 列表页查询接口映射参数
export const ActionType: Record<ActiveKey, string> = {
  [WholeAll]: 'ALL',
  [WholeProgress]: 'EXECUTING',
  [WholeNotStart]: 'EFFECTIVE',
  [DetailAll]: 'ALL',
  [DetailProgress]: 'EXECUTING',
  [DetailNotStart]: 'EFFECTIVE',
};

// 列表页-整单-表格个性化单元
export const WholeGridCustCode = {
  [WholeAll]: 'SSTA.PAYMENT_PLAN_LIST.GRID_WHOLE_ALL',
  [WholeProgress]: 'SSTA.PAYMENT_PLAN_LIST.GRID_WHOLE_PROGRESS',
  [WholeNotStart]: 'SSTA.PAYMENT_PLAN_LIST.GRID_WHOLE_NOTSTART',
};

// 列表页-整单-筛选器个性化单元
export const WholeSearchCustCode = {
  [WholeAll]: 'SSTA.PAYMENT_PLAN_LIST.SEARCH_WHOLE_ALL',
  [WholeProgress]: 'SSTA.PAYMENT_PLAN_LIST.SEARCH_WHOLE_PROGRESS',
  [WholeNotStart]: 'SSTA.PAYMENT_PLAN_LIST.SEARCH_WHOLE_NOTSTART',
};

// 列表页-明细-表格个性化单元
export const DetailGridCustCode = {
  [DetailAll]: 'SSTA.PAYMENT_PLAN_LIST.GRID_DETAIL_ALL',
  [DetailProgress]: 'SSTA.PAYMENT_PLAN_LIST.GRID_DETAIL_PROGRESS',
  [DetailNotStart]: 'SSTA.PAYMENT_PLAN_LIST.GRID_DETAIL_NOTSTART',
};

// 列表页-详情-筛选器个性化单元
export const DetailSearchCustCode = {
  [DetailAll]: 'SSTA.PAYMENT_PLAN_LIST.SEARCH_DETAIL_ALL',
  [DetailProgress]: 'SSTA.PAYMENT_PLAN_LIST.SEARCH_DETAIL_PROGRESS',
  [DetailNotStart]: 'SSTA.PAYMENT_PLAN_LIST.SEARCH_DETAIL_NOTSTART',
};

// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SSTA.PAYMENT_PLAN_LIST.TABS';

export const DetailCollapseCode = 'SSTA.PAYMENT_PLAN_DETAIL.COLLAPSE';

// 详情页个性化编码
export enum DetailCustomizeCode {
  BasicFormCode = 'SSTA.PAYMENT_PLAN_DETAIL.BASIC', // 基本信息
  CuszFormCode = 'SSTA.PAYMENT_PLAN_DETAIL.CUSZ_FORM', // 自定义表单信息
  LineTableCode = 'SSTA.PAYMENT_PLAN_DETAIL.STAGE', // 结构化定义
  CuszLineTableCode = 'SSTA.PAYMENT_PLAN_DETAIL.CUSZ_LINE', // 自定义行
  WholeAmountCode = 'SSTA.PAYMENT_PLAN_DETAIL.WHOLE_AMOUNT', // 整单管控规则
  StageMessageCode = 'SSTA.PAYMENT_PLAN_DETAIL.STAGE_MESSAGE', // 消息提醒规则
  StageDateCode = 'SSTA.PAYMENT_PLAN_DETAIL.STAGE_DATE', // 日期规则
  StageAmountCode = 'SSTA.PAYMENT_PLAN_DETAIL.STAGE_AMOUNT', // 金额规则
  StagePayDateValidCode = 'SSTA.PAYMENT_PLAN_DETAIL.STAGE_PAY_DATE_VALID', // 阶段付款日期校验规则
};

export enum PlanSourceCode {
  sodr = 'ORDER',
  spcm = 'CONTRACT',
}