import React from 'react';
import PropTypes from 'prop-types';
import { InputNumber as HzeroInputNumber } from 'hzero-ui';
import { InputNumber as C7nInputNumber } from 'choerodon-ui';
import { NumberField as C7nProInputNumber } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isUndefined, isObject, isNull, isFunction, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject } from 'utils/utils';
import { numberSeparatorRender } from '../utils';

// 是否有效
function isValidateValue(value) {
  return !isNull(value) && !isUndefined(value);
}

function formatterValue(value, precision) {
  // return isValidateValue(value) && Number(value).toFixed(precision);
  if (!isValidateValue(value) || math.isNaN(value)) return value;
  return numberSeparatorRender(value, precision);
}

// const DEFAULT_PRECISION = 10;

export default class PrecisionInputNumber extends React.Component {
  // 获取传递的context
  static contextTypes = {
    precisionCtx: PropTypes.object,
  };

  constructor(props) {
    super(props);
    let componentInstanceType = null;
    if (Object.hasOwnProperty.call(props, 'uom')) {
      componentInstanceType = 'uom';
    } else if (Object.hasOwnProperty.call(props, 'currency')) {
      componentInstanceType = 'currency';
    } else {
      componentInstanceType = 'financial';
    }
    this.state = {
      uom: undefined,
      precision: undefined,
      currency: undefined,
      financial: undefined,
      isFocused: false,
      // componentInstanceType, // 单位: 'uom', 价格: 'currency', 财务: 'financial'
      precisionVariableName: `${componentInstanceType}_precision`,
    };
  }

  componentDidMount() {
    const { dataSet, record, type } = this.props;
    const { uom, currency, financial, precision, precisionVariableName } = this.state;
    const hasPrecisionProp = Object.hasOwnProperty.call(this.props, 'precision'); // 传递了精度属性
    if (hasPrecisionProp) {
      // 拥有精度属性直接返回, 根据传入的精度为准
      if (type !== 'hzero') {
        if (dataSet) {
          dataSet.setState(precisionVariableName, precision);
        } else {
          // eslint-disable-next-line no-unused-expressions
          record?.setState(precisionVariableName, precision);
        }
      }
      return;
    }
    if (!isUndefined(uom) || !isUndefined(currency) || !isUndefined(financial)) {
      this.query(this.context);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      uom: nextUom,
      currency: nextCurrency,
      precision: nextPrecision,
      financial: nextFinancial,
    } = nextProps;
    const { uom, currency, precision, financial } = prevState;
    const hasPrecisionProp = Object.hasOwnProperty.call(nextProps, 'precision'); // 传递了精度属性
    const hasChangeProp =
      nextUom !== uom || nextCurrency !== currency || nextFinancial !== financial; // 除精度以外props 是否发生变化
    if (hasPrecisionProp && (nextPrecision !== precision || hasChangeProp)) {
      return {
        uom: nextUom,
        currency: nextCurrency,
        financial: nextFinancial,
        precision: nextPrecision,
      };
    } else if (!hasPrecisionProp && hasChangeProp) {
      // // 单位/币种/财务 变更
      // if (
      //   !isValidateValue(nextUom) &&
      //   !isValidateValue(nextCurrency) &&
      //   !isValidateValue(nextFinancial)
      // ) {
      //   // 单位/币种/财务 - 清空情况下变更
      //   return {
      //     uom: nextUom,
      //     currency: nextCurrency,
      //     financial: nextFinancial,
      //     precision: DEFAULT_PRECISION,
      //   };
      // }
      return {
        // 未清空情况下变更
        uom: nextUom,
        currency: nextCurrency,
        financial: nextFinancial,
        precision:
          isNil(nextUom) && isNil(nextCurrency) && isNil(nextFinancial) ? undefined : precision,
      };
    }
    return null;
  }

  componentDidUpdate(preProps, preState) {
    const { dataSet, record, precision, type } = this.props;
    const { record: preRecord } = preProps;
    const {
      uom: prenUom,
      currency: preCurrency,
      financial: preFinancial,
      precision: prePrecision,
    } = preState;
    const { uom, currency, financial, precisionVariableName } = this.state;
    const hasPrecisionProp = Object.hasOwnProperty.call(this.props, 'precision'); // 传递了精度属性
    if (hasPrecisionProp) {
      // 拥有精度属性直接返回, 根据传入的精度为准
      if (precision !== prePrecision && type !== 'hzero') {
        if (dataSet) {
          dataSet.setState(precisionVariableName, precision);
        } else {
          // eslint-disable-next-line no-unused-expressions
          record?.setState(precisionVariableName, precision);
        }
      } else if (!isNil(precision) && !dataSet && record !== preRecord && type !== 'hzero') {
        // 解决传递了精度属性, 但是表单初始值无 `record` bug
        // eslint-disable-next-line no-unused-expressions
        record?.setState(precisionVariableName, precision);
      }
      return;
    }
    if (isNil(uom) && isNil(currency) && isNil(financial) && !isNil(prePrecision)) {
      // 清空币种等操作时, 需要清空精度
      if (type !== 'hzero') {
        if (dataSet) {
          dataSet.setState(precisionVariableName, undefined);
        } else {
          // eslint-disable-next-line no-unused-expressions
          record?.setState(precisionVariableName, undefined);
        }
      }
      return;
    }
    if (prenUom !== uom || preCurrency !== currency || preFinancial !== financial) {
      this.query(this.context);
    }
  }

  /**
   * 主动去调用provider中封装的query方法
   * @param {*} context - react 执行上下文
   */
  query(context) {
    const { uom, currency, financial } = this.props;
    let code;
    let type;
    if (!isUndefined(uom)) {
      code = `uom_${uom}`;
      type = 'uom';
    } else if (!isUndefined(currency)) {
      code = `currency_${currency}`;
      type = 'currency';
    } else {
      code = `financial_${financial}`;
      type = 'financial';
    }
    if (
      context.precisionCtx &&
      (isValidateValue(uom) || isValidateValue(currency) || isValidateValue(financial))
    ) {
      context.precisionCtx.query({ code, type }, this.handlePrecision);
    }
  }

  /**
   * 精度回调
   * @param {!Object|number} res - 精度返回结果
   */
  @Bind()
  handlePrecision(res) {
    const { value, form, uom, currency, financial, record, type, name, dataSet } = this.props;
    const { precisionVariableName } = this.state;
    let code;
    if (!isUndefined(uom)) {
      code = `uom_${uom}`;
    } else if (!isUndefined(currency)) {
      code = `currency_${currency}`;
    } else {
      code = `financial_${financial}`;
    }
    const precision = isObject(res) ? res.get(code) : res;
    this.setState(
      {
        precision,
      },
      () => {
        if (form && type === 'hzero' && !isNil(value)) {
          if (value !== '' && !isNil(precision) && !math.isNaN(value)) {
            // 当值变化的时候再set, 否则ant会认为此数据为变更状态
            if (!math.eq(math.toFixed(value, precision), value)) {
              form.setFieldsValue({
                [this.props?.['data-__field']?.name]: math.toFixed(value, precision),
              });
            }
          }
        }
        setTimeout(() => this.forceUpdate(), 0); // 避免更改精度后, 输入框聚焦时, 缓存上一次精度值bug - 针对hzero
        if ((isUndefined(type) || type === 'c7n-pro') && isObject(record)) {
          this.resetRecordProperty({ precision });
          if (dataSet) {
            // 由于c7n 表格, editor只处于当前编辑组件, 所以需要手动改变所有数据源
            dataSet.setState(precisionVariableName, precision);
            return dataSet.forEach((r) => {
              const realValue = r.get(name);
              r.set(
                name,
                !isNil(realValue) &&
                  realValue !== '' &&
                  !isNil(precision) &&
                  // !isNaN(Number(realValue))
                  !math.isNaN(realValue)
                  ? // ? Number(realValue).toFixed(precision)
                    math.toFixed(realValue, precision)
                  : realValue
              );
            });
          }
          const currentValue = record.get(name);
          record.setState(precisionVariableName, precision);
          return record.set(
            name,
            !isNil(currentValue) &&
              currentValue !== '' &&
              !isNil(precision) &&
              // !isNaN(Number(currentValue))
              !math.isNaN(currentValue)
              ? // ? Number(currentValue).toFixed(precision)
                math.toFixed(currentValue, precision)
              : currentValue
          );
        }
      }
    );
  }

  // set 行数据精度
  resetRecordProperty = (options = {}) => {
    const { uom, currency, record, name } = this.props;
    const { precision = null } = options;

    if (!name) {
      return;
    }

    let code = null;
    if (!isUndefined(uom)) {
      code = 'uom';
    } else if (!isUndefined(currency)) {
      code = 'currency';
    } else {
      code = 'finicial';
    }
    record.setState(code, precision);
  };

  /**
   * 输入框失去焦点
   */
  @Bind()
  handleBlur(e) {
    const { name, record, onBlur } = this.props;
    const { precision } = this.state;
    // eslint-disable-next-line no-unused-expressions
    isObject(record) &&
      record.set(
        name,
        !isNil(e.target.value) &&
          e.target.value !== '' &&
          !isNil(precision) &&
          // !isNaN(Number(e.target.value))
          !math.isNaN(e.target.value)
          ? // ? Number(e.target.value).toFixed(precision)
            math.toFixed(e.target.value, precision)
          : e.target.value
      );
    // eslint-disable-next-line no-unused-expressions
    isFunction(onBlur) && onBlur(e);
  }

  /**
   * 处理formatter - 聚焦的时候, 无需formatter, 失焦的时候再校验
   */
  @Bind()
  handleFormatter(value, precision, focusValue = null) {
    const { isFocused } = this.state;
    if (isFocused) return focusValue;
    return formatterValue(value, precision);
  }

  /**
   * 失去焦点
   */
  @Bind()
  handleHzeroBlur(e) {
    const { onBlur } = this.props;
    this.setState({
      isFocused: false,
    });
    // eslint-disable-next-line no-unused-expressions
    isFunction(onBlur) && onBlur(e);
  }

  /**
   * 聚焦
   */
  @Bind()
  handleHzeroFocus(e) {
    const { onFocus } = this.props;
    this.setState({
      isFocused: true,
    });
    // eslint-disable-next-line no-unused-expressions
    isFunction(onFocus) && onFocus(e);
  }

  // 渲染金额输入框前缀
  renderInputPrefix() {
    return 'CNY';
  }

  renderComponent() {
    const { onRef, type, value: inputValue, currency, ...otherProps } = this.props;
    const { precision } = this.state;
    // precision = isValidateValue(precision) ? precision : DEFAULT_PRECISION;
    const expandProps = Object.assign(
      {
        value: inputValue, // `value` 不能忽略, 否则 set `undefined` 或 `null时`, 输入框不清空
        step: precision ? 1 / 10 ** precision : null,
      },
      filterNullValueObject({
        ...otherProps,
        precision,
      }),
      (isUndefined(type) || type === 'c7n-pro') && {
        renderer: ({ value }) => formatterValue(value, precision),
        onBlur: this.handleBlur,
      }
    );

    // --------todo----------- 格式化千分位
    // formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    // parser={value => value.replace(/\$\s?|(,*)/g, '')}

    // const inputPrefix = this.renderInputPrefix();
    // const formatterReg = /\B(?=(\d{3})+(?!\d))/g;
    // const parserReg = /\CNY\s?|(,*)/g;
    switch (type) {
      case 'hzero':
        // eslint-disable-next-line no-case-declarations
        const coverProps = {
          ...expandProps,
          onBlur: this.handleHzeroBlur,
          onFocus: this.handleHzeroFocus,
        };
        return (
          <HzeroInputNumber
            formatter={(value) =>
              this.handleFormatter(otherProps?.['data-__field']?.value || value, precision, value)
            }
            {...coverProps}
          />
        );
      case 'c7n':
        return <C7nInputNumber {...expandProps} />;
      case 'c7n-pro':
        return (
          <C7nProInputNumber ref={(vnode) => isFunction(onRef) && onRef(vnode)} {...expandProps} />
        );
      default:
        return (
          <C7nProInputNumber ref={(vnode) => isFunction(onRef) && onRef(vnode)} {...expandProps} />
        );
    }
  }

  render() {
    return this.renderComponent();
  }
}
