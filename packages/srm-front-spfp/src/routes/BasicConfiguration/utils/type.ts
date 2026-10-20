
export enum DimensionType
{
  apply = 'APPLICABLE_DIMENSION',
  cumulative = 'CUMULATIVE_DIMENSION',
  reflex = 'REFLEX_DIMENSION'

}

// 字段对应的值集编码-选择默认值

export const fieldLovCodeMap = {
  // 规则类型
  'RULE_TYPE': { lookupCode: 'SPFP.BASE_PREFERENTIAL_TYPE' },
  // 来源单据
  'SOURCE_DOCUMENT_CODE': { lovCode: 'SPFP.SOURCE_DOCUMENT' },

  // 目标单据字段
  'TARGET_DOCUMENT_CODE': { lovCode: 'SPFP.TARGET_DOCUMENT' },

  // 累计周期
  'CUMULATIVE_PERIOD': { lookupCode: 'SPFP.BASE_CUMULATIVE_PERIOD' },

  // 累计性质
  'CUMULATIVE_NATURE': { lookupCode: 'SPFP.BASE_CUMULATIVE_NATURE' },

  // 规则模式
  'CUMULATIVE_RULE': { lookupCode: 'SPFP.BASE_CUMULATIVE_RULE' },

  // // 跨台阶类型
  // 'CROSS_STEP_TYPE': { lookupCode: 'SPFP.BASE_CROSS_STEP_TYPE' },

  // 取价时点
  'PRICE_TIME_POINT': { lookupCode: 'SPFP.BASE_PRICE_TIME_POINT' },

  // 累计时点
  'CUMULATIVE_TIME_POINT': { lookupCode: 'SPFP.BASE_CUMULATIVE_TIME_POINT' },

  // 累计模式
  'CUMULATIVE_MODE': { lookupCode: 'SPFP.BASE_CUMULATIVE_MODE' },

  // 基准价格来源
  'PRICE_SOURCE': { lookupCode: 'SPFP.BASE_PRICE_SOURCE' },
  DEDUCT_BASE_AMOUNT_FLAG: { lookupCode: 'HPFM.FLAG' },

  //  适用范围-定义表格-维度范围---动态渲染下拉框
  'APPLICATION_DIMENSION_RANGE': {},

  //  适用范围-定义表格-特性值--无默认值
  'APPLICATION_SPECIFIC_VALUE': {},

  // 适用范围-定义表格-维度值--无默认值
  'APPLICATION_DIMENSION_VALUE': {},

  /**
   * 累计维度-定义表格-维度范围--动态渲染下拉框
   */
  'CUMULATIVE_DIMENSION_RANGE': {},
  /**
   * 累计维度-定义表格-特性值--无默认值
   */
  'CUMULATIVE_SPECIFIC_VALUE': {},
  /**
   * 累计维度-定义表格-维度值--无默认值
   */
  'CUMULATIVE_DIMENSION_VALUE': {},
  /**
   * 计算规则-定义表格-计算时点
   */
  'CALCULATE_TIME_POINT': { lookupCode: 'SPFP.BASE_CALCULATE_TIME_POINT', defaultValue: 'CUMULATIVE_PERIOD' },
  /**
   * 计算规则-定义表格-计算规则
   */
  'CALCULATE_RULE': { lookupCode: 'SPFP.BASE_CALCULATE_RULE', defaultValue: 'QUANTITY_ROUND_UP_AND_AMOUNT_ROUND_OFF' },
  /**
   * 计算规则-定义表格-计算参数-税率类型
   */
  'CALCULATE_TAX_RATE_TYPE': { lookupCode: 'SPFP.BASE_CALCULATE_TAX_RATE_TYPE', defaultValue: 'COMMODITY_TAX_RATE' },
  /**
  * 计算规则-定义表格-税率
  */
  'CALCULATE_RATE': { lovCode: 'SPFP.TAX_RATE' },

  /**
   * 计算规则-定义表格-计算参数-其他参数
   */
  'CALCULATE_DIMENSION': { lookupCode: 'SPFP.BASE_CALCULATE_DIMENSION' },
  /**
   * 计算规则-定义表格-价格库服务编码
   */
  'PRICE_LIB_SERVICE_CODE': { lovCode: 'SPFP.PRICE_LIB_SERVICE' },
  /**
   * 出单规则-定义表格-出单周期
   */
  'ORDERING_CYCLE': { lookupCode: 'SPFP.BASE_ORDERING_CYCLE' },
  /**
   * 出单规则-定义表格-费用项目映射
   */
  'ORDERING_CHARGE_CODE': { lookupCode: 'SSTA.CHARGE' },
  /**
   * 出单规则-定义表格-费用单头并单维度
   */
  'ORDERING_MERGE_DIMENSION': { lookupCode: 'SPFP.BASE_ORDERING_MERGE_DIMENSION' },
  /**
   * 出单规则-定义表格-费用单行汇总维度
   */
  'ORDERING_SUMMARY_DIMENSION': { lookupCode: 'SPFP.BASE_ORDERING_SUMMARY_DIMENSION' },
  /**
   * 出单规则-定义表格-出单人
   */
  'ORDERING_BY': { lovCode: 'SPFP.ORDERING_USER_AUTH' },
  /**
   * 出单规则-定义表格-出单状态
   */
  'ORDERING_STATUS': { lookupCode: 'SPFP.ORDERING_STATUS' },
  /**
   * 出单规则-费用单出具规则
   */
  'ORDERING_RULE': { lookupCode: 'SPFP.REBATE_ORDER_RULES' },
  // 累计周期内累计值清零  cumulativePeriodClearFlag
  CUMULATIVE_PERIOD_CLEAR_FLAG: { lookupCode: 'HPFM.FLAG', defaultValue: 0 },
};

export const CUSTOM = 'CUSTOM';
