/* eslint-disable prefer-destructuring */
/* eslint-disable radix */
class CurrencyFormatter {
  static formatter = Number.prototype.toLocaleString;

  props;

  locales;

  thousandthsSymbol = ',';

  decimalSymbol = '.';

  emptyValue = ['0', 0];

  constructor(props) {
    const { locales, formatter, ...otherProps } = props;
    this.vaildDigits(props);
    if (!locales) {
      throw new Error('the locales one of constructor props must be truth');
    }
    this.locales = locales;
    this.props = otherProps;
    // this.emptyValue = emptyValue;
    if (formatter) {
      CurrencyFormatter.formatter = formatter;
    }
    if (this.props.useGrouping === undefined || !!this.props.useGrouping === true) {
      this.thousandthsSymbol = this.parseThousandthsSymbol();
    }
    this.decimalSymbol = this.parseDecimalSymbol();
  }

  vaildDigits(props = {}) {
    if (
      props.minimumFractionDigits ||
      props.maximumFractionDigits ||
      props.minimumSignificantDigits ||
      props.maximumSignificantDigits
    ) {
      throw new Error(
        '{minimumFractionDigits, maximumFractionDigits, minimumSignificantDigits, maximumSignificantDigits} is not supported, please use {precision: number}'
      );
    }
  }

  parseThousandthsSymbol(locales) {
    const str = CurrencyFormatter.formatter.call(Number('1111'), locales || this.locales);
    return str.slice(1, 2);
  }

  parseDecimalSymbol(locales) {
    const str = CurrencyFormatter.formatter.call(Number('1'), locales || this.locales, {
      minimumFractionDigits: 2,
    });
    return str.slice(1, 2);
  }

  dealDecimalPart(decimalPart = '', precision) {
    if (!precision) {
      return decimalPart;
    }
    const decimalPartArr = decimalPart;
    const zeroArr = '00000000000000000000000';
    const newDecimalPart = decimalPartArr.slice(0, precision);
    return newDecimalPart.length === precision
      ? newDecimalPart
      : newDecimalPart.concat(zeroArr.slice(0, precision - newDecimalPart.length));
  }

  regThousandthsSymbol(thousandthsSymbol) {
    let ca = null;
    if (!thousandthsSymbol) {
      ca = ca || new RegExp(this.thousandthsSymbol, 'g');
      return ca;
    } else {
      return new RegExp(thousandthsSymbol, 'g');
    }
  }

  digitsIsZero = {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  };

  // we recommend string as prop since Number(10.10) = 10.1
  format(formatVal, localesOrOption, options) {
    this.vaildDigits(options);
    let decimalSymbol = this.decimalSymbol;
    if (
      (localesOrOption && typeof localesOrOption === 'string') ||
      Array.isArray(localesOrOption)
    ) {
      decimalSymbol = this.parseDecimalSymbol(localesOrOption);
    }
    const numArr = formatVal.toString().split(decimalSymbol);
    let intPart = numArr[0];
    const decimalPart = numArr[1];

    const intPartNum = Number(intPart);
    let precision = this.props.precision;
    if (options) {
      precision = options?.precision ? options.precision : precision;
      intPart = CurrencyFormatter.formatter.call(intPartNum, localesOrOption, {
        ...this.props,
        ...options,
        ...this.digitsIsZero,
      });
    } else if (localesOrOption) {
      if (typeof localesOrOption === 'string' || Array.isArray(localesOrOption)) {
        intPart = CurrencyFormatter.formatter.call(intPartNum, localesOrOption, {
          ...this.props,
          ...this.digitsIsZero,
        });
      } else {
        intPart = CurrencyFormatter.formatter.call(intPartNum, this.locales, {
          ...this.props,
          ...localesOrOption,
          ...this.digitsIsZero,
        });
      }
    } else {
      intPart = CurrencyFormatter.formatter.call(intPartNum, this.locales, {
        ...this.props,
        ...this.digitsIsZero,
      });
    }
    if (precision && precision >= 1) {
      return intPart + decimalSymbol + this.dealDecimalPart(decimalPart, precision);
    }
    return decimalPart !== undefined ? intPart + decimalSymbol + decimalPart : intPart;
  }

  unformat(string, locales, isNumber) {
    const newIsNumber = typeof locales === 'boolean' ? locales : isNumber;
    const newLocales = typeof locales === 'boolean' ? undefined : locales;
    if (!string) {
      return this.emptyValue[newIsNumber ? 1 : 0];
    } else {
      let thousandthsSymbol;

      let decimalSymbol = this.decimalSymbol;
      if ((newLocales && typeof newLocales === 'string') || Array.isArray(newLocales)) {
        thousandthsSymbol = this.parseThousandthsSymbol(newLocales);
        decimalSymbol = this.parseDecimalSymbol(newLocales);
      }
      const numArr = string.toString().split(decimalSymbol);
      let intPart = numArr[0];
      const decimalPart = numArr[1];
      if (this.props.useGrouping === undefined || !!this.props.useGrouping === true) {
        intPart = intPart.replace(this.regThousandthsSymbol(thousandthsSymbol), '');
      }
      return decimalPart !== undefined
        ? newIsNumber
          ? parseFloat(`${intPart}.${decimalPart}`)
          : `${intPart}.${decimalPart}`
        : newIsNumber
        ? parseInt(intPart)
        : intPart;
    }
  }
}

export default CurrencyFormatter;
