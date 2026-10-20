// 详情页路由参数operate
export type Operate = 'create' | 'edit' | 'view' | 'copy' | 'all' | 'history';

// 详情页个性化编码
export enum DetailCustomizeCode {
  BASIC = 'SBSM.SOURCE_DOC_TERM.BASIC_INFO', // 基础信息-类型订单
  LINE = 'SBSM.SOURCE_DOC_TERM.LINE',
}
export enum RegEx {
  NOCHINESE = '^[^\\u4e00-\\u9fa5]+$', // chinese=false
  FREQUENCY = '^[-]?\\d+(,[-]?\\d+)*$', // 英文逗号分隔数字
};

// 构造请求参数映射字段
export const mapQueryFields = {
  'PO_LINE': {
    'sourceDocId': 'poHeaderId',
    'sourceDocLineId': 'poLineId',
    'sourceDocDisplayLineNum': 'displayLineNum', // 行号
    'itemCode': 'itemCode',
    'itemName': 'itemName',
    'currencyCode': 'currencyCode',
    'sourceDocLineNum': 'lineNum',
  },
};
