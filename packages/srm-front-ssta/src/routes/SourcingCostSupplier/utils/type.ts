export type DocType = 'tender' | 'deposit' | 'service';

// 固定格式、前缀和分隔符不可更改
export enum ActiveKey {
  TenderAll = 'tender-all',
  TenderInv = 'tender-inv',
  TenderPay = 'tender-pay',
  TenderDownload = 'tender-download',
  DepositAll = 'deposit-all',
  DepositPay = 'deposit-pay',
  DepositReturn = 'deposit-return',
  ServiceAll = 'service-all',
  // ServicePay = 'service-pay',
  // ServiceInv = 'service-inv',
}

const {
  TenderAll,
  TenderInv,
  TenderPay,
  TenderDownload,
  DepositAll,
  DepositPay,
  DepositReturn,
  ServiceAll,
  // ServicePay,
  // ServiceInv,
} = ActiveKey;

// 列表页-招标文件费-表格个性化单元
export const TenderListGridCustCode = {
  [TenderAll]: 'SSTA.SOURCING_COST_SUP.GRID_TENDER_ALL',
  [TenderInv]: 'SSTA.SOURCING_COST_SUP.GRID_TENDER_INV',
  [TenderPay]: 'SSTA.SOURCING_COST_SUP.GRID_TENDER_PAY',
  [TenderDownload]: 'SSTA.SOURCING_COST_SUP.GRID_TENDER_DOWNLOAD',
};

// 列表页-招标文件费-筛选器个性化单元
export const TenderListSearchCustCode = {
  [TenderAll]: 'SSTA.SOURCING_COST_SUP.SEARCH_TENDER_ALL',
  [TenderInv]: 'SSTA.SOURCING_COST_SUP.SEARCH_TENDER_INV',
  [TenderPay]: 'SSTA.SOURCING_COST_SUP.SEARCH_TENDER_PAY',
  [TenderDownload]: 'SSTA.SOURCING_COST_SUP.SEARCH_TENDER_DOWNLOAD',
};

// 列表页-保证金-表格个性化单元
export const DepositListGridCustCode = {
  [DepositAll]: 'SSTA.SOURCING_COST_SUP.GRID_DEPOSIT_ALL',
  [DepositPay]: 'SSTA.SOURCING_COST_SUP.GRID_DEPOSIT_PAY',
  [DepositReturn]: 'SSTA.SOURCING_COST_SUP.GRID_DEPOSIT_RETURN',
};

// 列表页-保证金-筛选器个性化单元
export const DepositListSearchCustCode = {
  [DepositAll]: 'SSTA.SOURCING_COST_SUP.SEARCH_DEPOSIT_ALL',
  [DepositPay]: 'SSTA.SOURCING_COST_SUP.SEARCH_DEPOSIT_PAY',
  [DepositReturn]: 'SSTA.SOURCING_COST_SUP.SEARCH_DEPOSIT_RETURN',
};

// 列表页-服务费-表格个性化单元
export const ServiceListGridCustCode = {
  [ServiceAll]: 'SSTA.SOURCING_COST_SUP.GRID_SERVICE_ALL',
  // [ServicePay]: 'SSTA.SOURCING_COST_SUP.GRID_SERVICE_PAY',
  // [ServiceInv]: 'SSTA.SOURCING_COST_SUP.GRID_SERVICE_INV',
};

// 列表页-服务费-筛选器个性化单元
export const ServiceListSearchCustCode = {
  [ServiceAll]: 'SSTA.SOURCING_COST_SUP.SEARCH_SERVICE_ALL',
  // [ServicePay]: 'SSTA.SOURCING_COST_SUP.SEARCH_SERVICE_PAY',
  // [ServiceInv]: 'SSTA.SOURCING_COST_SUP.SEARCH_SERVICE_INV',
};

// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SSTA.SOURCING_COST_SUP.TABS';

export enum ListBtnsCustCode {
  TENDER = 'SSTA.SOURCING_COST_SUP.BTNS_TENDER',
  DEPOSIT = 'SSTA.SOURCING_COST_SUP.BTNS_DEPOSIT',
  SERVICE = 'SSTA.SOURCING_COST_SUP.BTNS_SERVICE',
}

// 招标文件费头关联个性化单元
export enum TenderHeadUnitCode {
  BASIC = 'SSTA.TENDER_DETAIL_SUP.BASIC_INFO',
  RULE = 'SSTA.TENDER_DETAIL_SUP.RULE_INFO',
}
// 招标文件费详情页表格
export enum TenderDetailGridUnitCode {
  PAY = 'SSTA.TENDER_DETAIL_SUP.PAY_RECORD',
  INV = 'SSTA.TENDER_DETAIL_SUP.INV_RECORD',
  DOWNLOAD = 'SSTA.TENDER_DETAIL_SUP.DOWNLOAD_RECORD',
  SYNC = 'SSTA.TENDER_DETAIL_SUP.SYNC_RECORD',
}
// 保证金头关联个性化单元
export enum DepositHeadUnitCode {
  BASIC = 'SSTA.DEPOSIT_DETAIL_SUP.BASIC_INFO',
  RULE = 'SSTA.DEPOSIT_DETAIL_SUP.RULE_INFO',
}
// 保证金详情页表格
export enum DepositDetailGridUnitCode {
  PAY = 'SSTA.DEPOSIT_DETAIL_SUP.PAY_RECORD',
  TRANS_OUT = 'SSTA.DEPOSIT_DETAIL_SUP.TRANS_OUT_RECORD',
  SYNC = 'SSTA.DEPOSIT_DETAIL_SUP.SYNC_RECORD',
}
// 服务费头关联个性化单元
export enum ServiceHeadUnitCode {
  BASIC = 'SSTA.SERVICE_DETAIL_SUP.BASIC_INFO',
  RULE = 'SSTA.SERVICE_DETAIL_SUP.RULE_INFO',
}
// 服务费详情页表格
export enum ServiceDetailGridUnitCode {
  PAY = 'SSTA.SERVICE_DETAIL_SUP.PAY_RECORD',
  INV = 'SSTA.SERVICE_DETAIL_SUP.INV_RECORD',
  SYNC = 'SSTA.SERVICE_DETAIL_SUP.SYNC_RECORD',
}
// 招标文件费详情页按钮组
export enum TenderDetailBtnsUnitCode {
  HEAD = 'SSTA.TENDER_DETAIL_SUP.HEAD_BTNS',
}
// 保证金详情页按钮组
export enum DepositDetailBtnsUnitCode {
  HEAD = 'SSTA.DEPOSIT_DETAIL_SUP.HEAD_BTNS',
}
// 保证金详情页折叠面板
export enum DepositDetailCollapseUnitCode {
  COLLAPSE = 'SSTA.DEPOSIT_DETAIL_SUP.COLLAPSE',
}
// 服务费详情页按钮组
export enum ServiceDetailBtnsUnitCode {
  HEAD = 'SSTA.SERVICE_DETAIL_SUP.HEAD_BTNS',
}
