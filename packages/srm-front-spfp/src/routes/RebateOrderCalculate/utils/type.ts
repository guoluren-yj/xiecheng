
// 列表个性化编码
export enum TableCustomizeCodes
{
  searchCode = 'SPFP.REBATE_ORDER_CALCULATE_LIST.SEARCH_BAR',
  listCode = 'SPFP.REBATE_ORDER_CALCULATE_LIST.ALL',
}

// 执行阶段-阶段类型 集合
export enum ExcuteStageTypes
{
  MATCH_REBATE_RULE = 'MATCH_REBATE_RULE', // 返利规则匹配
  LOCK_DATA_RANGE = 'LOCK_DATA_RANGE', // 锁定数据范围
  START_DATA_COMPUTING = 'START_DATA_COMPUTING', // 启动大数据计算
  PARSE_FILE = 'PARSE_FILE', // 解析文件
  EXECUTION_EVALUATION_RULE = 'EXECUTION_EVALUATION_RULE', // 执行计算规则
  TAKE_PRICE = 'TAKE_PRICE', // 取价
  ORDERING = 'ORDERING', // 出单
}

// 阶段类型过程标志
export enum ProgressMark
{
  WAIT = 'wait',
  PROCESS = 'process',
  FINISH = 'finish',
  ERROR = 'error',
}

export const TableCustomizeCodesBTNS = 'SPFP.REBATE_ORDER_CALCULATE_LIST.BTNS';
