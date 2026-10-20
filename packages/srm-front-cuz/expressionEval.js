import math from 'choerodon-ui/dataset/math';

export const ctxMap = {
  ACC: 'ctx',
  URL: 'url',
  CUS: 'self',
};
export const specMap = {
  DATE: {
    FIRST_MON_DAY_END:
      'moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format("YYYY-MM-DD 23:59:59")',
    FIRST_MON_DAY:
      'moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format("YYYY-MM-DD 00:00:00")',
    LAST_MON_DAY:
      'moment(new Date(new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getTime()-86400000)).format("YYYY-MM-DD 00:00:00")',
    LAST_MON_DAY_END:
      'moment(new Date(new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getTime()-86400000)).format("YYYY-MM-DD 23:59:59")',
    NOW: 'moment(new Date()).format("YYYY-MM-DD HH:mm:ss")',
    NOW_DAY: 'moment(new Date()).format("YYYY-MM-DD")',
  },
};
export const innerFunctionMap = {
  OFFSET_DATE(date) {
    const argsLength = arguments.length;
    if (argsLength < 2) throw new Error('this function need two arguments at least!');
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments, 1);
    const reg = /(-?\d+)([s|m|h|D|W|M|Y])/;
    // eslint-disable-next-line one-var
    let s = 0,
      mon = 0,
      year = 0;
    args.forEach((offset) => {
      const [, value, unit] = offset.match(reg);
      switch (unit) {
        case 's':
          s += Number(value);
          break;
        case 'm':
          s += 60 * Number(value);
          break;
        case 'h':
          s += 3600 * Number(value);
          break;
        case 'D':
          s += Number(value) * 86400;
          break;
        case 'W':
          s += Number(value) * 604800;
          break;
        case 'M':
          mon += Number(value);
          break;
        case 'Y':
          year += Number(value);
          break;
        default:
      }
    });
    if (!date) return undefined;
    const originDate = new Date(date);
    originDate.setTime(originDate.getTime() + s * 1000);
    const relativeMonth = originDate.getMonth() + mon;
    originDate.setMonth(relativeMonth);
    const newYear = originDate.getFullYear() + year;
    originDate.setFullYear(newYear);
    return moment
      ? moment(originDate).format('YYYY-MM-DD HH:mm:ss')
      : originDate.toISOString();
  },
  TIME_DIFF(date1, date2, timeUnit){
    if (!date1 || !date2) return NaN;
    let d1 = moment(date1);
    let d2 = moment(date2);
    if ([d1.toString(), d2.toString()].includes(moment.invalid().toString()) || !timeUnit) return NaN;
    switch (timeUnit) {
      case 'm':
        d1 = moment(d1.format("YYYY-MM-DD HH:mm:00"));
        d2 = moment(d2.format("YYYY-MM-DD HH:mm:00"));
        return (d1.valueOf() - d2.valueOf())/60000;
      case 'h':
        d1 = moment(d1.format("YYYY-MM-DD HH:00:00"));
        d2 = moment(d2.format("YYYY-MM-DD HH:00:00"));
        return (d1.valueOf() - d2.valueOf())/3600000;
      case 'D':
        d1 = moment(d1.format("YYYY-MM-DD 00:00:00"));
        d2 = moment(d2.format("YYYY-MM-DD 00:00:00"));
        return (d1.valueOf() - d2.valueOf())/86400000;
      case 'W':
        d1 = moment(d1.format("YYYY-MM-DD 00:00:00"));
        d2 = moment(d2.format("YYYY-MM-DD 00:00:00"));
        return Math.round((d1.valueOf() - d2.valueOf())/604800000);
      case 'M':
        return (Number(d1.format("YYYY")) - Number(d2.format("YYYY"))) * 12 + d1.month() - d2.month();
      case 'Y':
        return Number(d1.format("YYYY")) - Number(d2.format("YYYY"));
      default:
        return (d1.valueOf() - d2.valueOf())/1000;
    }
  },
  MATH_SUM: math.sum,
  MATH_ABS: math.abs,
  MATH_FIX: math.fix,
  MATH_PLUS: math.plus,
  MATH_MINUS: math.minus,
  MATH_TIMES: math.multipliedBy,
  MATH_DIV: math.div,
  MATH_MOD: math.mod,
  MATH_POW: math.pow,
  MATH_SQRT: math.sqrt,
  MATH_TOFIXED: math.toFixed,
  MATH_LT: math.lt,
  MATH_LTE: math.lte,
  MATH_GT: math.gt,
  MATH_GTE: math.gte,
  MATH_EQ: math.eq,
  MATH_ROUND: math.round,
  MATH_FLOOR: math.floor,
  MATH_CEIL: math.ceil,
  MATH_DP: math.dp,
  MATH_MAX: math.max,
  MATH_MIN: math.min,
  MATH_NEGATED: math.negated,
  MATH_ISFINITE: math.isFinite,
  MATH_ISNAN: math.isNaN,
  MATH_ISNEGATIVE: math.isNegative,
  MATH_ISZERO: math.isZero,
  // MATH_ISNEGATIVEZERO: math.isNegativeZero,
  MATH_ISBIGNUMBER: math.isBigNumber,
  // MATH_ISVALIDBIGNUMBER: math.isValidBigNumber,
};
