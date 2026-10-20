
// SWBH_card 单据Name
enum DocNameList {
  ALL = '全部',
  SINV = '物流',
  SMALL = '商城管理',
  SODR = '订单',
  SPCM = '协议',
  SQAM = '质量',
  SRRM = '需求',
  SSLM = '供应商',
  SSRC = '寻源',
  SSTA = '结算',
}

// SWBH_card 单据背景色
enum DocBgColor {
  ALL = '#29BECE',
  SINV = '#FF9E01', // 橙
  SMALL = '#F56349', // 红
  SODR = '#0A7DF5', // 蓝
  SPCM = '#0A7DF5', // 蓝
  SQAM = '#0A7DF5', // 蓝
  SRRM = '#0A7DF5', // 蓝
  SSLM = '#36C2CF', // 绿
  SSRC = '#36C2CF', // 绿
  SSTA = '#36C2CF', // 绿
}

// 单据图标
enum DocSvg {
  ALL = 'icon-card-all',
  SINV = 'icon-card-sinv',
  SMALL = 'icon-card-small',
  SODR = 'icon-card-sodr',
  SPCM = 'icon-card-spcm',
  SQAM = 'icon-card-sqam',
  SRRM = 'icon-card-srrm',
  SSLM = 'icon-card-sslm',
  SSRC = 'icon-card-ssrc',
  SSTA = 'icon-card-ssta',
}

// export enum CompletedKindType {
//   NOTSTART = 2,
//   UNDONE = 3,
//   COMPLETED = 0,
//   OVERDUE = 1,
// }

export {DocNameList, DocBgColor, DocSvg};
