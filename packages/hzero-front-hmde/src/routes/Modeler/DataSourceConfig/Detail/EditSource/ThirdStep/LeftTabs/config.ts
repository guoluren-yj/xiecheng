// 高级函数信息
const FunAConfig = [
  {
    funName: 'CONCAT',
    expression: 'CONCAT()',
    _expression: 'CONCAT(str1, str2, ...)',
  },
  {
    funName: 'CASEWHEN',
    expression: 'CASEWHEN()',
    _expression: 'CASEWHEN(expression1, value1, expression2, value2, ..., else_value)',
  },
  {
    funName: 'ISNULL',
    expression: 'ISNULL()',
    _expression: 'ISNULL(expression, defaultValue)',
  },
  {
    funName: 'DATEDIFF_YEAR',
    expression: 'DATEDIFF_YEAR()',
    _expression: 'DATEDIFF_YEAR(startdate,enddate)',
  },
  {
    funName: 'DATEDIFF_MONTH',
    expression: 'DATEDIFF_MONTH()',
    _expression: 'DATEDIFF_MONTH(startdate,enddate)',
  },
  {
    funName: 'DATEDIFF_DAY',
    expression: 'DATEDIFF_DAY()',
    _expression: 'DATEDIFF_DAY(startdate,enddate)',
  },
  {
    funName: 'NOW',
    expression: 'NOW()',
    _expression: 'NOW()',
  },
];

// 聚合函数信息
const FunBConfig = [
  {
    funName: 'SUM',
    expression: 'SUM()',
    _expression: 'SUM(expression)',
  },
  {
    funName: 'DISTINCTSUM',
    expression: 'DISTINCTSUM()',
    _expression: 'DISTINCTSUM(expression)',
  },
  {
    funName: 'AVG',
    expression: 'AVG()',
    _expression: 'AVG(expression)',
  },
  {
    funName: 'DISTINCTAVG',
    expression: 'DISTINCTAVG()',
    _expression: 'DISTINCTAVG(expression)',
  },
  {
    funName: 'MAX',
    expression: 'MAX()',
    _expression: 'MAX(expression)',
  },
  {
    funName: 'MIN',
    expression: 'MIN()',
    _expression: 'MIN(expression)',
  },
  {
    funName: 'COUNT',
    expression: 'COUNT()',
    _expression: 'COUNT(expression)',
  },
  {
    funName: 'DISTINCTCOUNT',
    expression: 'DISTINCTCOUNT()',
    _expression: 'DISTINCTCOUNT(expression)',
  },
];

// 函数信息
const FunctionList = [
  {
    title: '高级函数',
    key: 'FunAConfig',
    children: FunAConfig,
  },
  {
    title: '聚合函数',
    key: 'FunBConfig',
    children: FunBConfig,
  },
];

// 数学运算符
const MatheConfig = [
  {
    name: '+（加）',
    _name: '+',
    expression: '计算两个值的和。也可用于拼接字符串，例如A+B拼接可得到AB',
  },
  {
    name: '-（减）',
    _name: '-',
    expression: '计算两个值的差。',
  },
  {
    name: '*（乘）',
    _name: '*',
    expression: '乘以其值。',
  },
  {
    name: '/（除）',
    _name: '/',
    expression: '除以其值。',
  },
  {
    name: '()（左括号和右括号）',
    _name: '()',
    expression:
      '指定先计算左括号和右括号内的表达式。所有其他表达式均使用标准运算符优先权进行评估。',
  },
];

// 逻辑运算符
const LogicConfig = [
  {
    name: '==（等于）',
    _name: '==',
    expression: '计算两个值是否相等。',
  },
  {
    name: '<> 与 !=（不等于）',
    _name: '<>!=',
    expression: '计算两个值是否不相等。',
  },
  {
    name: '<（小于）',
    _name: '<',
    expression: '计算一个值是否小于此符号后面的值。',
  },
  {
    name: '>（大于）',
    _name: '>',
    expression: '计算一个值是否大于此符号后面的值。',
  },
  {
    name: '<=（小于或等于）',
    _name: '<=',
    expression: '计算一个值是否小于等于此符号后面的值。',
  },
  {
    name: '>=（大于或等于）',
    _name: '>=',
    expression: '计算一个值是否大于等于此符号后面的值。',
  },
  {
    name: '&& （与）',
    _name: '&&',
    expression: '评估两个值或表达式是否都为真，使用此运算符作为逻辑函数 AND 的备选。',
  },
  {
    name: '|| （或）',
    _name: '||',
    expression: '评估多个值或表达式中是否至少有一个为真，使用此运算符作为逻辑函数 OR 的备选。',
  },
];

const CalculateList = [
  {
    title: '数学运算符',
    key: 'MatheConfig',
    children: MatheConfig,
  },
  {
    title: '逻辑运算符',
    key: 'LogicConfig',
    children: LogicConfig,
  },
];
// 描述配置
const DescriptionConfig = {
  CONCAT: '用于将多个字符串连接成一个字符串',
  CASEWHEN:
    '根据一系列布尔表达式。如果表达式为true，则返回相应结果。如果不等于任何值，则返回else（其他）结果。',
  ISNULL:
    '确定表达式是否为空（NULL），如果是则返回该函数自定义的默认值。如果非空，则返回条件表达式数据。',
  DATEDIFF_YEAR: ' 返回两个日期之间的年份差，默认后一个日期减去前一个日期。',
  DATEDIFF_MONTH: ' 返回两个日期之间的月份差，默认后一个日期减去前一个日期。',
  DATEDIFF_DAY: ' 返回两个日期之间的天数差，默认后一个日期减去前一个日期。',
  NOW: ' 返回当前时刻的日期时间。',
  SUM: '返回一系列数字中的求和值。目前仅适用于行上列表某一列的数据聚合。',
  AVG: '返回一系列数字中的平均值。目前仅适用于行上列表某一列的数据聚合。',
  MAX: '返回指定的数值集合中的最大值。目前仅适用于行上列表某一列的数据聚合。',
  MIN: '返回指定的数值集合中的最小值。目前仅适用于行上列表某一列的数据聚合。',
  COUNT: '返回一系列数据中的条目数。目前仅适用于行上列表某一列的数据聚合。',
  DISTINCTCOUNT: '返回一系列数据中去重后的条目数。目前仅适用于行上列表某一列的数据聚合。',
  DISTINCTAVG: '返回一系列数字中去重后的平均值。目前仅适用于行上列表某一列的数据聚合。',
  DISTINCTSUM: '返回一系列数字中去重后的求和值。目前仅适用于行上列表某一列的数据聚合。',
};
// 注意事项配置
const CareConfig = {
  CONCAT: [
    {
      title:
        '拼接参数支持两种方式方式: 变量：模型字段名常量包括：数字、大小写字母、任意连接分隔符如".","-","_","/"等。',
      children: [
        '变量：模型字段名',
        '常量包括：数字、大小写字母、任意连接分隔符如".","-","_","/"等。',
      ],
    },
    {
      title: '常量需使用英文双引号""才会生效。',
    },
    {
      title:
        '示例：CONCAT(demo_customer.name, "-" ,demo_customer.id , "-" ,"hand"）效果：小王-888-汉得',
    },
  ],
  ISNULL: [
    {
      title: '支持已有函数表达式嵌套',
    },
    {
      title: 'DefaultValue为字符串时需使用英文双引号""才会生效。',
    },
    {
      title: '示例 ISNULL(CODE,"code0") ,如果CODE字段值为空，输出：code0',
    },
  ],
  CASEWHEN: [
    {
      title: '支持已有高级函数表达式嵌套',
    },
    {
      title: 'value值需使用英文双引号""才会生效。',
    },
    {
      title:
        '示例：CASEWHEN (USERNAME=="张三", "这是张三" ,CODE=="李四", "这是李四", "陌生人"）效果：当不满足以上两个条件时，输出值为"陌生人"',
    },
  ],
  DATEDIFF_YEAR: [
    {
      title: '函数入参startdate/enddate仅支持日期数据类型',
    },
    {
      title: '示例 DATEDIFF_YEAR(x_date0,x_date1)输出：两日期间的年份差',
    },
  ],
  DATEDIFF_MONTH: [
    {
      title: '函数入参startdate/enddate仅支持日期数据类型',
    },
    {
      title: 'DATEDIFF_MONTH(x_date0,x_date1)输出：两日期间的月份差',
    },
  ],
  DATEDIFF_DAY: [
    {
      title: '函数入参startdate/enddate仅支持日期数据类型 ',
    },
    {
      title: '示例 DATEDIFF_DAY(x_date0,x_date1)输出：两日期间的天数差',
    },
  ],
  NOW: [
    {
      title: '此函数无入参信息 ',
    },
    {
      title: '示例 NOW()输出：以年月日时分秒形式返回当前时间',
    },
  ],
  SUM: [
    {
      title: '函数入参仅支持1个参数，需要为字段名且仅支持数字类的数据类型',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用',
    },
    {
      title: '示例 SUM(x_price)输出：列表字段x_price所有数值的求和值',
    },
  ],
  AVG: [
    {
      title: '函数入参仅支持1个参数，需要为字段名且仅支持数字类的数据类型',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用',
    },
    {
      title: '示例 AVG(x_price) 输出：列表字段x_price所有数值的平均值',
    },
  ],
  MAX: [
    {
      title: '函数入参仅支持1个参数，需要为字段名且仅支持数字类/日期类的数据类型',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用',
    },
    {
      title: '示例 MAX(x_price)输出：列表字段x_price所有数值的最大值',
    },
  ],
  MIN: [
    {
      title: '函数入参仅支持1个参数，需要为字段名且仅支持数字类/日期类的数据类型。',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用。',
    },
    {
      title: '示例 MIN(x_price)输出：列表字段x_price所有数值的最小值',
    },
  ],
  COUNT: [
    {
      title: '函数入参仅支持1个参数，需要为字段名且支持任意数据类型',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用',
    },
    {
      title: '示例 COUNT(x_price)输出：列表字段x_price所有数据条目数',
    },
  ],
  DISTINCTCOUNT: [
    {
      title: '函数入参仅支持1个参数，需要为字段名，支持任意数据类型',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用',
    },
    {
      title: '示例 DISTINCTCOUNT(x_price)输出：列表字段x_price所有数据去重后的条目数',
    },
  ],
  DISTINCTAVG: [
    {
      title: '函数入参仅支持1个参数，需要为字段名且仅支持数字类的数据类型',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用',
    },
    {
      title: '示例 DISTINCTAVG(x_price) 输出：列表字段x_price所有数值去重后的的平均值',
    },
  ],
  DISTINCTSUM: [
    {
      title: '函数入参仅支持1个参数，需要为字段名且仅支持数字类的数据类型',
    },
    {
      title: '暂不支持与已有的其他函数如CASEWHEN或ISNULL为空函数混合使用',
    },
    {
      title: '示例 DISTINCTSUM(x_price)输出：列表字段x_price所有数值去重后的求和值',
    },
  ],
};
export { FunctionList, DescriptionConfig, CareConfig, CalculateList, FunBConfig, FunAConfig };
