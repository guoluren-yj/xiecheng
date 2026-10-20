// 详情页路由参数operate
export type Operate = 'create' | 'edit' | 'view' | 'copy' | 'all' | 'history';

// 头DataSet的提交类型state
export type SubmitType = 'create' | 'save' | 'copy' | 'release';

// 列表页个性化编码
export enum ListCustomizeCode {
  TableCode = 'SBSM.FUND_PLAN_TERMS_LIST.GRID', // 表格
  SearchBarCode = 'SBSM.FUND_PLAN_TERMS_LIST.SEARCH_BAR', // 筛选器
}

// 列表按钮组
export const ListBtnCode = 'SBSM.FUND_PLAN_TERMS_LIST.BTNS';

// 详情页个性化编码
export enum DetailCustomizeCode {
  BasicFormCode = 'SBSM.FUND_PLAN_TERMS_DETAIL.BASIC', // 基本信息
  LineTableCode = 'SBSM.FUND_PLAN_TERMS_DETAIL.LINE', // 行
};

export const DetailCollapseCode = 'SBSM.FUND_PLAN_TERMS_DETAIL.COLLAPSE';

export const DetailBtnCode = 'SBSM.FUND_PLAN_TERMS_DETAIL.BTNS';

export enum RegEx {
  NOCHINESE = '^[^\\u4e00-\\u9fa5]+$', // chinese=false
  FREQUENCY = '^[-]?\\d+(,[-]?\\d+)*$', // 英文逗号分隔数字
};

export const permissionCodeMap = {
  edit: 'srm.sbsm.payment-terms.button.edit', // 编辑按钮
  copy: 'srm.sbsm.payment-terms.button.copy', // 复制按钮
  create: 'srm.sbsm.payment-terms.button.create', // 新建按钮
  enable: 'srm.sbsm.payment-terms.button.enable', // 启用按钮'
  disable: 'srm.sbsm.payment-terms.button.disable',
  revoke: 'srm.sbsm.payment-terms.button.revoke',
  cancelPublish: 'srm.sbsm.payment-terms.button.cancelPublish',
  approveRecord: 'srm.sbsm.payment-terms.button.approveRecord',
};
