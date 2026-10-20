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
        value: '!=',
        meaning: '!=（不等于）',
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

export const fun = [
  {
    meaning: '逻辑类',
    value: '逻辑类',
    children: [
      {
        value: 'CASE(expression, value1, result1, value2, result2, …, else_result)',
        meaning: 'CASE()',
      },
      {
        value: 'IF(logical_test, value_if_true, value_if_false)',
        meaning: 'IF()',
      },
      {
        value: 'ISNULL(expression)',
        meaning: 'ISNULL()',
      },
      {
        value: 'NOT(logical)',
        meaning: 'NOT()',
      },
      {
        value: 'ISEMPTY(arg1)',
        meaning: 'ISEMPTY()',
      },
      {
        value: 'NULL()',
        meaning: 'NULL()',
      },
      {
        value: 'ISBLANK(expression)',
        meaning: 'ISBLANK()',
      },
    ],
  },
  {
    meaning: '日期时间类',
    value: '日期时间类',
    children: [
      {
        value: 'DATE(year, month, day)',
        meaning: 'DATE()',
      },
      {
        value: 'DATEVALUE(arg1, arg2)',
        meaning: 'DATEVALUE()',
      },
      {
        value: 'DAY(date)',
        meaning: 'DAY()',
      },
      {
        value: 'MONTH(date)',
        meaning: 'MONTH()',
      },
      {
        value: 'NOW()',
        meaning: 'NOW()',
      },
      {
        value: 'TODAY()',
        meaning: 'TODAY()',
      },
      {
        value: 'YEAR(date)',
        meaning: 'YEAR()',
      },
      {
        value: 'HOUR(time)',
        meaning: 'HOUR()',
      },
      {
        value: 'MINUTE(time)',
        meaning: 'MINUTE()',
      },
      {
        value: 'SECOND(time)',
        meaning: 'SECOND()',
      },
      {
        value: 'ADDMONTHS(date,num)',
        meaning: 'ADDMONTHS()',
      },
      {
        value: 'DATETIMEVALUE(expression)',
        meaning: 'DATETIMEVALUE()',
      },
      {
        value: 'WEEKDAY(date)',
        meaning: 'WEEKDAY()',
      },
      {
        value: 'DATE_FORMAT(date, format)',
        meaning: 'DATE_FORMAT()',
      },
    ],
  },
  {
    meaning: '数字类',
    value: '数字类',
    children: [
      {
        value: 'ABS(number)',
        meaning: 'ABS()',
      },
      {
        value: 'CEIL(number)',
        meaning: 'CEIL()',
      },
      {
        value: 'MAX(number, number, …)',
        meaning: 'MAX()',
      },
      {
        value: 'MIN(number, number, …)',
        meaning: 'MIN()',
      },
      {
        value: 'MOD(number, divisor)',
        meaning: 'MOD()',
      },
      {
        value: 'ROUND(number, num_digits)',
        meaning: 'ROUND()',
      },
      {
        value: 'SQRT(number)',
        meaning: 'SQRT()',
      },
      {
        value: 'FLOOR(number)',
        meaning: 'FLOOR()',
      },
    ],
  },
  {
    meaning: '文本类',
    value: '文本类',
    children: [
      {
        value: 'CONTAINS(text, compare_text)',
        meaning: 'CONTAINS()',
      },
      {
        value: 'ENDS_WITH(arg1, arg2)',
        meaning: 'ENDS_WITH()',
      },
      {
        value: 'STARTS_WITH(arg1, arg2)',
        meaning: 'STARTS_WITH()',
      },
      {
        value: 'INDEX_OF(arg1, arg2)',
        meaning: 'INDEX_OF()',
      },
      {
        value: 'SUBSTRING(arg1, arg2) ',
        meaning: 'SUBSTRING()',
      },
      {
        value: 'LENGTH(text)',
        meaning: 'LENGTH()',
      },
      {
        value: 'TO_LOWER_CASE(text)',
        meaning: 'TO_LOWER_CASE()',
      },
      {
        value: 'REPLACE(arg1, arg2, arg3)',
        meaning: 'REPLACE()',
      },
      {
        value: 'TRIM(text)',
        meaning: 'TRIM()',
      },
      {
        value: 'REGEX(Text, RegEx_Text)',
        meaning: 'REGEX()',
      },
      {
        value: 'PINYIN(text)',
        meaning: 'PINYIN()',
      },
      {
        value: 'TO_UPPER_CASE(text)',
        meaning: 'TO_UPPER_CASE()',
      },
    ],
  },
  {
    meaning: '转换类',
    value: '转换类',
    children: [
      {
        value: 'TO_STRING(num)',
        meaning: 'TO_STRING()',
      },
      {
        value: 'TO_FLOAT(text)',
        meaning: 'TO_FLOAT()',
      },
      {
        value: 'TO_INTEGER(text)',
        meaning: 'TO_INTEGER()',
      },
      {
        value: 'TO_BOOLEAN(arg1)',
        meaning: 'TO_BOOLEAN()',
      },
    ],
  },
];

export const getFlatFun = () => {
  return fun
    .reduce((acc: any, current: any) => {
      if (Array.isArray(current.children)) {
        return [...acc, ...current.children];
      } else {
        return acc;
      }
    }, [])
    .map((o) => o.value);
};

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
