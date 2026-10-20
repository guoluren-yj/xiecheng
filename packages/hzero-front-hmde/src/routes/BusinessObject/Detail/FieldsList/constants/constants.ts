import intl from 'srm-front-boot/lib/utils/intl';

export enum FieldSourceType {
  StandardField = 'StandardField', // 标准
  ElasticDomainField = 'FLEX_FIELD', // 弹性域
  ExtensionTableField = 'EXTEND_TABLE', // 扩展表字段
}

export const arithmetic = [
  {
    meaning: '关系',
    value: '关系',
    children: [
      {
        value: '==',
        meaning: '==（等于）',
      },
      {
        value: '<>',
        meaning: '<>与!=（不等于）',
      },
      { value: '>', meaning: '>（大于）' },
      { value: '<', meaning: '<（小于）' },
      { value: '>=', meaning: '>=（大于或等于）' },
      { value: '<=', meaning: '<=（小于或等于）' },
    ],
  },
  {
    meaning: '逻辑',
    value: '逻辑',
    children: [
      {
        value: '&&',
        meaning: '&&（与）',
      },
      {
        value: '||',
        meaning: '||（或）',
      },
    ],
  },
  {
    meaning: '算术',
    value: '算术',
    children: [
      {
        value: '+',
        meaning: '+（加）',
      },
      {
        value: '-',
        meaning: '-（减）',
      },
      {
        value: '*',
        meaning: '*（乘）',
      },
      {
        value: '/',
        meaning: '/（除）',
      },
    ],
  },
  {
    meaning: '其他',
    value: '其他',
    children: [
      {
        value: '()',
        meaning: '()（左括号和右括号）',
      },
      // {
      //   value: '&',
      //   meaning: '&（连接多个字符串）',
      // },
    ],
  },
];

export const getArithmetic = () => [
  {
    meaning: intl.get('hmde.bo.field.associateType').d('关系'),
    value: intl.get('hmde.bo.field.associateType').d('关系'),
    children: [
      {
        value: '==',
        meaning: `==（${intl.get('hmde.bo.view.message.equalTo').d('等于')}）`,
      },
      {
        value: '<>',
        meaning: `<> ${intl.get('hmde.bo.view.message.and').d('与')} !=（${intl.get('hmde.bo.view.message.noEqual').d('不等于')}）`,
      },
      { value: '>', meaning: `>（${intl.get('hmde.bo.view.message.greaterThan').d('大于')}）` },
      { value: '<', meaning: `<（${intl.get('hmde.bo.view.message.lessThan').d('小于')}）` },
      { value: '>=', meaning: `>=（${intl.get('hmde.bo.view.message.greaterThanOrEqual').d('大于或等于')}）` },
      { value: '<=', meaning: `<=（${intl.get('hmde.bo.view.message.lessThanOrEqual').d('小于或等于')}）` },
    ],
  },
  {
    meaning: intl.get('hmde.bo.view.message.logic').d('逻辑'),
    value: intl.get('hmde.bo.view.message.logic').d('逻辑'),
    children: [
      {
        value: '&&',
        meaning: `&&（${intl.get('hmde.bo.view.message.and').d('与')}）`,
      },
      {
        value: '||',
        meaning: `||（${intl.get('hmde.bo.view.message.or').d('或')}）`,
      },
    ],
  },
  {
    meaning: intl.get('hmde.bo.view.message.operation').d('算术'),
    value: intl.get('hmde.bo.view.message.operation').d('算术'),
    children: [
      {
        value: '+',
        meaning: `+（${intl.get('hmde.bo.view.message.plus').d('加')}）`,
      },
      {
        value: '-',
        meaning: `-（${intl.get('hmde.bo.view.message.minus').d('减')}）`,
      },
      {
        value: '*',
        meaning: `*（${intl.get('hmde.bo.view.message.times').d('乘')}）`,
      },
      {
        value: '/',
        meaning: `/（${intl.get('hmde.bo.view.message.divide').d('除')}）`,
      },
    ],
  },
  {
    meaning: intl.get('hmde.bo.view.message.other').d('其他'),
    value: intl.get('hmde.bo.view.message.other').d('其他'),
    children: [
      {
        value: '()',
        meaning: `()（${intl.get('hmde.bo.view.message.leftAndRightParentheses').d('左括号和右括号')}）`,
      },
      // {
      //   value: '&',
      //   meaning: '&（连接多个字符串）',
      // },
    ],
  },
];

export const fun = [
  {
    meaning: '日期和时间',
    value: '日期和时间',
    children: [
      {
        value: 'DATEDIFF_DAY(startdate,enddate)',
        meaning: 'DATEDIFF_DAY()',
      },
      {
        value: 'DATEDIFF_MONTH(startdate,enddate)',
        meaning: 'DATEDIFF_MONTH()',
      },
      { value: 'DATEDIFF_YEAR(startdate,enddate)', meaning: 'DATEDIFF_YEAR()' },
      { value: 'NOW()', meaning: 'NOW()' },
      // { value: 'TODAY()', meaning: 'TODAY()' },
      // { value: 'DATEDIFF()', meaning: 'DATEDIFF()' },
    ],
  },
  // {
  //   meaning: '数学',
  //   value: '数学',
  //   children: [
  //     {
  //       value: 'ROUND()',
  //       meaning: 'ROUND()',
  //     },
  //   ],
  // },
  {
    meaning: '文本',
    value: '文本',
    children: [
      // {
      //   value: 'LEN()',
      //   meaning: 'LEN()',
      // },
      // {
      //   value: 'LEFT()',
      //   meaning: 'LEFT()',
      // },
      // {
      //   value: 'RIGHT()',
      //   meaning: 'RIGHT()',
      // },
      // {
      //   value: 'JOIN()',
      //   meaning: 'JOIN()',
      // },
      {
        value: 'CONCAT(str1, str2, ...)',
        meaning: 'CONCAT()',
      },
    ],
  },
  // {
  //   meaning: '算术',
  //   value: '算术',
  //   children: [
  //     {
  //       value: 'MAX(expression)',
  //       meaning: 'MAX()',
  //     },
  //     {
  //       value: 'MIN(expression)',
  //       meaning: 'MIN()',
  //     },
  //     {
  //       value: 'AVG(expression)',
  //       meaning: 'AVG()',
  //     },
  //     {
  //       value: 'DISTINCTAVG()',
  //       meaning: 'DISTINCTAVG()',
  //     },
  //     {
  //       value: 'SUM(expression)',
  //       meaning: 'SUM()',
  //     },
  //     {
  //       value: 'DISTINCTSUM(expression)',
  //       meaning: 'DISTINCTSUM()',
  //     },
  //     {
  //       value: 'COUNT(expression)',
  //       meaning: 'COUNT()',
  //     },
  //     {
  //       value: 'DISTINCTCOUNT(expression)',
  //       meaning: 'DISTINCTCOUNT()',
  //     },
  //   ],
  // },
  {
    meaning: '条件判断',
    value: '条件判断',
    children: [
      // {
      //   value: 'CASE()',
      //   meaning: 'CASE()',
      // },
      {
        value: 'CASEWHEN(expression1, value1, expression2, value2, ..., else_value)',
        meaning: 'CASEWHEN()',
      },
      // {
      //   value: 'ISEMPTY()',
      //   meaning: 'ISEMPTY()',
      // },
    ],
  },
  {
    meaning: '其他',
    value: '其他',
    children: [
      {
        value: 'ISNULL (expression, defaultValue)',
        meaning: 'ISNULL',
      },
    ],
  },
];

export const componentTypeMap = [
  /**
   * 文本框
   */
  {
    value: 'TEXT_FIELD',
    meaning: intl.get('hmde.textField').d('文本框'),
  },
  /**
   * 多行文本
   */
  {
    value: 'TEXT_AREA',
    meaning: intl.get('hmde.textField').d('多行文本'),
  },
  /**
   * 数字
   */
  {
    value: 'NUMBER_FIELD',
    meaning: '数字',
  },
  /**
   * 浮点数
   */
  {
    value: 'FLOAT',
    meaning: '浮点数',
  },
  /**
   * 百分数
   */
  {
    value: 'PERCENTAGE',
    meaning: '百分数',
  },
  /**
   * 日期选择框
   */
  {
    value: 'DATE_SELECTION_BOX',
    meaning: '日期选择框',
  },

  /**
   * 日期时间选择框
   */
  {
    value: 'DATETIME_SELECTION_BOX',
    meaning: '日期时间选择框',
  },
  /**
   * 下拉单选
   */
  {
    value: 'SINGLE_SELECT',
    meaning: '下拉单选',
  },
  /**
   * 下拉多选
   */
  {
    value: 'MULTIPLE_SELECT',
    meaning: '下拉多选',
  },
  /**
   * 单选框
   */
  {
    value: 'RADIO',
    meaning: '单选框',
  },
  /**
   * 复选框
   */
  {
    value: 'CHECKBOX',
    meaning: '复选框',
  },
  /**
   * 开关
   */
  {
    value: 'SWITCH',
    meaning: '开关',
  },

  /**
   * 金额
   */
  {
    value: 'MONEY',
    meaning: '金额',
  },
  /**
   * 手机号码
   */
  {
    value: 'PHONE_NUMBER',
    meaning: '手机号码',
  },
  /**
   * 电子邮箱
   */
  {
    value: 'EMAIL',
    meaning: '电子邮箱',
  },
  /**
   * 附件
   */
  {
    value: 'APPENDIX',
    meaning: '附件',
  },
  /**
   * 超链接
   */
  {
    value: 'LINK',
    meaning: '超链接',
  },
  /**
   * 公式
   */
  {
    value: 'FORMULA',
    meaning: '公式',
  },
  /**
   * 关联字段
   */
  {
    value: 'LINK_RELATION',
    meaning: '关联字段',
  },
  /**
   * 主从关系
   */
  {
    value: 'MASTER_RELATION',
    meaning: '从主关系',
  },
  /**
   * 引用字段
   */
  {
    value: 'REFERENCE_FIELD',
    meaning: '引用字段',
  },
];
