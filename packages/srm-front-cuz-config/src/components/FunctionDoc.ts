
const funNameToOperator = {
  PLUS: "+",
  MINUS: "-",
  TIMES: "*",
  DIV: "/",
  MOD: "%",
};

const funNameToCompare = {
  lt: "<",
  gt: ">",
  eq: "=",
  lte: "<=",
  gte: ">=",
};
/**
 * 公式函数文档数据
 * @param _key 函数对应的key
 * @param intl 多语言函数
 * @returns {InsData}
 */
export default function getInsData(_key: string, intl: any): InsData {
  let res: any = {};
  if (!_key) return res;
  // 暂定，非大数字函数带下划线
  const isBigNumber = !_key.includes("_");
  const key = _key.toLocaleLowerCase();
  switch (key) {
    case "offset_date": res = {
      funName: "OFFSET_DATE(dateVar, offset1, offset2, ...)",
      funIns: intl.get("hpfm.customize.common.fun.offsetDate").d("计算偏移时间"),
      argsList: [
        { name: "dateVar", ins: intl.get("hpfm.customize.common.fun.ins1").d("时间变量") },
        {
          name: "offset",
          ins: intl.get("hpfm.customize.common.fun.ins2").d("偏移量"),
          extraData: [
            {
              name: intl.get("hpfm.customize.common.fun.ins3").d("可选单位"),
              data: intl.get("hpfm.customize.common.fun.ins4").d("s:秒、m:分、h:时、D:天、W:周、M:月、Y:年"),
            },
          ],
        },
      ],
      example: "OFFSET_DATE(date, \"1h\", \"+30m\", \"-30s\")",
      exampleMeaning: intl.get("hpfm.customize.common.fun.ins5").d("将时间date推迟1小时29分30秒"),
    };
      break;
    case "time_diff": res = {
      funName: "TIME_DIFF(date1, date2, timeUnit)",
      funIns: intl.get("hpfm.customize.common.fun.timeDiff").d("计算给定单位下的时间差值(结果保留整数), 在支持范围外的单位以秒计算, 且参数不合法时返回NaN"),
      argsList: [
        { name: "date1", ins: intl.get("hpfm.customize.common.fun.ins1").d("时间变量") },
        { name: "date2", ins: intl.get("hpfm.customize.common.fun.ins1").d("时间变量") },
        {
          name: "timeUnit",
          ins: intl.get("hpfm.customize.common.timeUnit").d("时间单位"),
          extraData: [
            {
              name: intl.get("hpfm.customize.common.fun.ins3").d("可选单位"),
              data: intl.get("hpfm.customize.common.fun.ins4").d("s:秒、m:分、h:时、D:天、W:周、M:月、Y:年"),
            },
          ],
        },
      ],
      example: "TIME_DIFF('2022-01-01', '2021-12-01', 'M')",
      exampleMeaning: intl.get("hpfm.customize.common.fun.ins6").d("以月为单位计算2022-01-01减去2021-12-01"),
    };
      break;
    case "abs": res = {
      funName: "Math.abs(x)",
      funIns: intl.get("hpfm.customize.common.fun.abs").d("取绝对值"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
      ],
    };
      break;
    case "ceil": res = {
      funName: "Math.ceil(x)",
      funIns: intl.get("hpfm.customize.common.fun.ceil").d("对x向上取整"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
      ],
    };
      break;
    case "floor": res = {
      funName: "Math.floor(x)",
      funIns: intl.get("hpfm.customize.common.fun.floor").d("对x向下取整"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
      ],
    };
      break;
    case "max": res = {
      funName: "Math.max(x1, x2, ...)",
      funIns: intl.get("hpfm.customize.common.fun.max").d("取一组数中最大值"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
      ],
      example: "Math.max(1.2, 0, 5)",
      exampleMeaning: intl.get("hpfm.customize.common.fun.maxIns1").d("取这几个数的最大值"),
    };
      break;
    case "min": res = {
      funName: "Math.min(x1, x2, ...)",
      funIns: intl.get("hpfm.customize.common.fun.min").d("取一组数中最小值"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
      ],
      example: "Math.min(1.2, 0, 5)",
      exampleMeaning: intl.get("hpfm.customize.common.fun.minIns1").d("取这几个数的最小值"),
    };
      break;
    case "pow": res = {
      funName: "Math.pow(x, y)",
      funIns: intl.get("hpfm.customize.common.fun.pow").d("返回x的y次幂"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
        { name: "y", ins: intl.get("hpfm.customize.common.fun.powArgY").d("幂y") },
      ],
      example: "Math.pow(1.2, 3)",
      exampleMeaning: intl.get("hpfm.customize.common.fun.powIns1").d("取1.2的3次幂"),
    };
      break;
    case "random": res = {
      funName: "Math.random()",
      funIns: intl.get("hpfm.customize.common.fun.random").d("取0到1的随机数"),
    };
      break;
    case "round": res = {
      funName: "Math.round(x)",
      funIns: intl.get("hpfm.customize.common.fun.round").d("对x四舍五入"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
      ],
    };
      break;
    case "sqrt": res = {
      funName: "Math.sqrt(x)",
      funIns: intl.get("hpfm.customize.common.fun.sqrt").d("返回x的平方根"),
      argsList: [
        { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
      ],
    };
      break;
    case "plus":
    case "minus":
    case "times":
    case "div":
    case 'mod':
      res = {
        funName: "plus(x1, x2)|minus(x1, x2)|times(x1, x2)|div(x1, x2)|mod(x1, x2)",
        funIns: intl.get("hpfm.customize.common.fun.normalCompute").d("基本运算函数"),
        argsList: [
          { name: "x", ins: intl.get("hpfm.customize.common.fun.numArgX").d("数值x") },
        ],
      };
      res.example = `MATH_${_key}(1, 2)`;
      res.exampleMeaning = `1 ${funNameToOperator[_key]} 2`;
      break;
    case 'fix':
      res = {
        funName: 'Math.fix(a)',
        funIns: intl.get("hpfm.customize.common.fun.fix").d("如果所给参数能转换为普通数字则返回对应的普通数字"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigA").d("大数字a") },
        ],
      };
      break;
    case 'tofixed':
      res = {
        funName: 'toFixed(a, b)',
        funIns: intl.get("hpfm.customize.common.fun.toFixed").d("格式化BigNumber的小树位数"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigA").d("大数字a") },
          { name: "b", ins: intl.get("hpfm.customize.common.fun.numArgIntB").d("整数b") },
        ],
      };
      break;
    case 'eq':
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
      res = {
        funName: 'lt(a, b)|lte(a, b)|gt(a, b)|gte(a, b)|eq(a, b)',
        funIns: intl.get("hpfm.customize.common.fun.compare").d("BigNumber的比较函数"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
          { name: "b", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
        ],
      };
      res.example = `MATH_${_key}(a, b)`;
      res.exampleMeaning = `a ${funNameToCompare[key]} b`;
      break;
    case 'sum':
      res = {
        funName: 'sum(a, b, ...)',
        funIns: intl.get("hpfm.customize.common.fun.sum").d("多个BigNumber或常规数字相加"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
          { name: "b", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
        ],
      };
      break;
    case 'isbignumber':
      res = {
        funName: 'isbignumber(a)',
        funIns: intl.get("hpfm.customize.common.fun.isbignumber").d("判断参数是不是一个大数字"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.anyArg").d("任意参数类型") },
        ],
      };
      break;
    case 'isnan':
      res = {
        funName: 'isnan(a)',
        funIns: intl.get("hpfm.customize.common.fun.isnan").d("判断参数是不是一个非数字类型"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.anyArg").d("任意参数类型") },
        ],
      };
      break;
    case 'negated':
      res = {
        funName: 'negated(a)',
        funIns: intl.get("hpfm.customize.common.fun.negated").d("对BigNumber取负数"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
        ],
      };
      break;
    case 'isnegative':
      res = {
        funName: 'isnegative(a)',
        funIns: intl.get("hpfm.customize.common.fun.isnegative").d("判断一个BigNumber是不是负数"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
        ],
      };
      break;
    case 'iszero':
      res = {
        funName: 'iszero(a)',
        funIns: intl.get("hpfm.customize.common.fun.iszero").d("判断一个BigNumber是不是0"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
        ],
      };
      break;
    case 'isfinite':
      res = {
        funName: 'isfinite(a)',
        funIns: intl.get("hpfm.customize.common.fun.isfinite").d("判断一个BigNumber是不是无穷大"),
        argsList: [
          { name: "a", ins: intl.get("hpfm.customize.common.fun.numArgBigOrNum").d("大数字/常规数字") },
        ],
      };
      break;
    default: ;
  }
  if (isBigNumber && res.funName) {
    res.funName = res.funName.split("|").map(i => i.replace(/(Math.)?([a-zA-Z\s]*)\(([a-zA-Z,\s.0-9]*)\)/, (a, _a, b, c) => `MATH_${b.toLocaleUpperCase()}(${c})`)).join("、");
    // eslint-disable-next-line no-unused-expressions
    res.example && (res.example = res.example.replace(/Math.([a-zA-Z\s]*)\(([a-zA-Z,\s.0-9]*)\)/, (_a, b, c) => `MATH_${b.toLocaleUpperCase()}(${c})`));
  }
  return res;
}
export type InsData = {
  funName: string;
  funIns: string;
  argsList: {
    name: string;
    ins: string;
    extraData?: {
      name: string;
      data: string;
    }[];
  }[];
  example: string;
  exampleMeaning: string;
}

export const bigNumberList = [
  { funName: "MATH_FIX", key: "FIX" },
  { funName: "MATH_SUM", key: "SUM" },
  { funName: "MATH_ABS", key: "ABS" },
  { funName: "MATH_PLUS", key: "PLUS" },
  { funName: "MATH_MINUS", key: "MINUS" },
  { funName: "MATH_TIMES", key: "TIMES" },
  { funName: "MATH_DIV", key: "DIV" },
  { funName: "MATH_MOD", key: "MOD" },
  { funName: "MATH_POW", key: "POW" },
  { funName: "MATH_SQRT", key: "SQRT" },
  { funName: "MATH_TOFIXED", key: "TOFIXED" },
  { funName: "MATH_LT", key: "LT" },
  { funName: "MATH_LTE", key: "LTE" },
  { funName: "MATH_GT", key: "GT" },
  { funName: "MATH_GTE", key: "GTE" },
  { funName: "MATH_EQ", key: "EQ" },
  { funName: "MATH_ROUND", key: "ROUND" },
  { funName: "MATH_FLOOR", key: "FLOOR" },
  { funName: "MATH_CEIL", key: "CEIL" },
  { funName: "MATH_MAX", key: "MAX" },
  { funName: "MATH_MIN", key: "MIN" },
  { funName: "MATH_NEGATED", key: "NEGATED" },
  { funName: "MATH_ISFINITE", key: "ISFINITE" },
  { funName: "MATH_ISNAN", key: "ISNAN" },
  { funName: "MATH_ISNEGATIVE", key: "ISNEGATIVE" },
  { funName: "MATH_ISZERO", key: "ISZERO" },
  { funName: "MATH_ISBIGNUMBER", key: "ISBIGNUMBER" },
];