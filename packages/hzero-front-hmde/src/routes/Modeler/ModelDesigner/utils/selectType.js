/*
 * 数据类型下拉枚举
 * @Date: 2020-08-07 17:20:13
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */

// 基础表字段类型枚举
export const getSelectType = (refDataSourceType) =>
  refDataSourceType !== 'Oracle'
    ? [
        { value: 'BIT', meaning: 'BIT' },
        { value: 'TINYINT', meaning: 'TINYINT' },
        { value: 'TINYINT UNSIGNED', meaning: 'TINYINT UNSIGNED' },
        { value: 'INT', meaning: 'INT' },
        { value: 'INT UNSIGNED', meaning: 'INT UNSIGNED' },
        { value: 'BIGINT', meaning: 'BIGINT' },
        { value: 'BIGINT UNSIGNED', meaning: 'BIGINT UNSIGNED' },
        { value: 'FLOAT', meaning: 'FLOAT' },
        { value: 'FLOAT UNSIGNED', meaning: 'FLOAT UNSIGNED' },
        { value: 'DOUBLE', meaning: 'DOUBLE' },
        { value: 'DOUBLE UNSIGNED', meaning: 'DOUBLE UNSIGNED' },
        { value: 'DECIMAL', meaning: 'DECIMAL' },
        { value: 'DECIMAL UNSIGNED', meaning: 'DECIMAL UNSIGNED' },
        // { value: 'LONGBLOB', meaning: 'LONGBLOB' },
        { value: 'DATETIME', meaning: 'DATETIME' },
        { value: 'TIMESTAMP', meaning: 'TIMESTAMP' },
        { value: 'DATE', meaning: 'DATE' },
        { value: 'CHAR', meaning: 'CHAR' },
        { value: 'VARCHAR', meaning: 'VARCHAR' },
        { value: 'LONGTEXT', meaning: 'LONGTEXT' },
      ]
    : [
        { value: 'CHAR', meaning: 'CHAR' },
        { value: 'VARCHAR2', meaning: 'VARCHAR2' },
        { value: 'CLOB', meaning: 'CLOB' },
        { value: 'BLOB', meaning: 'BLOB' },
        { value: 'DATE', meaning: 'DATE' },
        { value: 'NUMBER', meaning: 'NUMBER' },
      ];

// 虚拟字段数据类型下拉枚举
export const getVirtualType = () => [
  { value: 'BigDecimal', meaning: 'BigDecimal' },
  { value: 'Boolean', meaning: 'Boolean' },
  { value: 'LocalDate', meaning: 'LocalDate' },
  { value: 'Long', meaning: 'Long' },
  { value: 'ZonedDateTime', meaning: 'ZonedDateTime' },
  { value: 'String', meaning: 'String' },
];

// 虚拟字段类型
export const virtualFieldType = [
  {
    name: '普通型',
    value: 'NORMAL',
  },
  {
    name: '行统计',
    value: 'ROW_AGGREGATION',
  },
];

// 索引类型枚举
export const indexType = [
  {
    value: 'Unique',
    meaning: 'Unique',
  },
  {
    value: 'Normal',
    meaning: 'Normal',
  },
];

/**
 * 查询类型汇总
 */
export const QueryTypeList = [
  {
    name: '等于',
    code: 'EQUAL',
  },
  {
    name: '不等于',
    code: 'NOT_EQUAL',
  },
  {
    name: '大于',
    code: 'GREATER_THAN',
  },
  {
    name: '大于等于',
    code: 'GREATER_THAN_OR_EQUAL_TO',
  },
  {
    name: '小于',
    code: 'LESS_THAN',
  },
  {
    name: '小于等于',
    code: 'LESS_THAN_OR_EQUAL_TO',
  },
  {
    name: '全模糊',
    code: 'FULLY_FUZZY',
  },
  {
    name: '前模糊',
    code: 'BEFORE_FUZZY',
  },
  {
    name: '后模糊',
    code: 'AFTER_FUZZY',
  },
  {
    name: '包含',
    code: 'IN',
  },
  {
    name: '不包含',
    code: 'NOT_IN',
  },
];
