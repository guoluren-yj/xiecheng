/**
 * 字段金额格式化配置, 用于 dynamicProps.formatterOptions
 * 无需isSupplement: type: currency -> 自动补0， type: number -> 不补0
 * @param {Function} getPrecision 获取精度， props参考 dynamicProps
 * @returns
 */
export function c7nAmountFormatterOptions(getPrecision) {
  return (props) => {
    const precision = getPrecision(props);
    const options = {
      maximumFractionDigits: precision || 20,
    };
    if (precision) {
      options.minimumFractionDigits = precision;
    }
    return { options };
  };
}
