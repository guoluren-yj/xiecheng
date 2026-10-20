// 替代方案列表行状态渲染tag对应色值
export enum TagTypes {
  // 状态：色值 new: volcano
  NEW = 'volcano', // 新建
  RELEASED = 'green', // 已发布
}

// 代替方案多语言前缀 // 设置sbdm国际化前缀
export const langPrefixCode = 'smdm.subRelation';

// 列表页个性化编码
export enum ListCustomizeCode {
  SearchBarCode = 'SMDM.SUBSTITUTE_RELATION_LIST.FILTER', // 筛选器
  TableListCode = 'SMDM.SUBSTITUTE_RELATION_LIST.TABLE_LIST', // 表格列表
}

// 维护页个性化编码
export enum UpdateCustomizeCode {
  BaseInfoCode = 'SMDM.SUBSTITUTE_RELATION_UPDATE.BASEINFO_FORM', // 基础信息
  LineTableCode = 'SMDM.SUBSTITUTE_RELATION_UPDATE.LINE_TABLE', // 物料表格
}

// 明细页个性化编码
export enum DetailCustomizeCode {
  BaseInfoCode = 'SMDM.SUBSTITUTE_RELATION_DETAIL.BASEINFO_FORM', // 基础信息
  LineTableCode = 'SMDM.SUBSTITUTE_RELATION_DETAIL.LINE_TABLE', //  物料表格
}