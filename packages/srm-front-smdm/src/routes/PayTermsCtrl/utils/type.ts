// 详情页路由参数operate
export type Operate = 'create' | 'edit' | 'view' | 'copy' | 'all' | 'history';

// 头DataSet的提交类型state
export type SubmitType = 'create' | 'save' | 'copy' | 'release';

// 列表页个性化编码
export enum ListCustomizeCode {
  TableCode = 'SMDM.PAY_TERMS_CTRL_LIST.GRID', // 表格
  SearchBarCode = 'SMDM.PAY_TERMS_CTRL_LIST.SEARCH_BAR', // 筛选器
}

// 详情页个性化编码
export enum DetailCustomizeCode {
  BasicFormCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.BASIC', // 基本信息
  CuszFormCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.CUSZ_FORM', // 自定义表单信息
  LineTableCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.LINE', // 结构化定义
  CuszLineTableCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.CUSZ_LINE', // 自定义行
  WholeAmountCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.WHOLE_AMOUNT', // 整单管控规则
  StageMessageCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.STAGE_MESSAGE', // 消息提醒规则
  StageAmountCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.STAGE_AMOUNT', // 金额规则
  StagePayDateValidCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.STAGE_PAY_DATE_VALID', // 阶段付款日期校验规则
};

export const DetailCollapseCode = 'SMDM.PAY_TERMS_CTRL_DETAIL.COLLAPSE';

export enum RegEx {
  NOCHINESE = '^[^\\u4e00-\\u9fa5]+$', // chinese=false
  FREQUENCY = '^[-]?\\d+(,[-]?\\d+)*$', // 英文逗号分隔数字
};

export const permissionCodeMap = {
  edit: 'srm.fin.payment-terms.button.ctrl-edit', // 编辑按钮
  copy: 'srm.fin.payment-terms.button.ctrl-copy', // 复制按钮
  create: 'srm.fin.payment-terms.button.ctrl-create', // 新建按钮
  exChange: 'srm.fin.payment-terms.button.page-exchange', // 切换按钮
};
