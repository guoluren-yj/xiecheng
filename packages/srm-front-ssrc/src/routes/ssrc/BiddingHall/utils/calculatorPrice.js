import { math } from 'choerodon-ui/dataset';
import { isNil } from 'lodash';

// 计算最小/大出价
const calcQuotationRangeValue = (record = null, options = {}) => {
  const { validField } = options || {};

  const {
    floatType,
    quotationRange,
    biddingStrategy,
    lowestQuotationPrice,
    [validField]: validPrice,
  } =
    record?.get?.([
      'floatType',
      'quotationRange',
      'biddingStrategy',
      'lowestQuotationPrice',
      validField,
    ]) || {};

  let rangeValue = null;

  if (isNil(quotationRange)) {
    return rangeValue;
  }

  // 最低价*幅度/100
  if (floatType === 'ratio') {
    if (biddingStrategy === 'BELOW_THE_LOWEST_PRICE' || biddingStrategy === 'ABOVE_MAXIMUM_PRICE') {
      if (!isNil(lowestQuotationPrice)) {
        rangeValue = math.div(math.multipliedBy(lowestQuotationPrice || 0, quotationRange), 100);
      }
    }

    if (
      biddingStrategy === 'LOWER_THAN_LAST_QUOTE' ||
      biddingStrategy === 'ABOVE_THAN_LAST_QUOTE'
    ) {
      if (!isNil(validPrice)) {
        rangeValue = math.div(math.multipliedBy(validPrice || 0, quotationRange || 0), 100);
      }
      if (isNil(validPrice)) {
        rangeValue = null;
      }
    }
  }

  if (floatType === 'money') {
    rangeValue = quotationRange;
  }

  return rangeValue;
};

/**
 * 依据单据状态格式化最小出价
 *
 * */
const formatLowestMinusQuotationRange = (data) => {
  const { biddingQuotationMethod, lowestMinusQuotationRange, currentPrecision } = data || {};

  let formatByPrecisonLowestRange = lowestMinusQuotationRange;

  if (!formatByPrecisonLowestRange) {
    return lowestMinusQuotationRange;
  }

  const PrecisionNumber = math.pow(10, currentPrecision || 0);

  if (biddingQuotationMethod === 'BIDDING') {
    formatByPrecisonLowestRange = math.div(
      math.floor(math.multipliedBy(lowestMinusQuotationRange || 0, PrecisionNumber)),
      PrecisionNumber
    );
  }

  if (biddingQuotationMethod === 'AUCTION') {
    formatByPrecisonLowestRange = math.div(
      math.ceil(math.multipliedBy(lowestMinusQuotationRange || 0, PrecisionNumber)),
      PrecisionNumber
    );
  }

  return formatByPrecisonLowestRange;
};

// 最小出价计算
const calcLowestMinusQuotationRange = (record, options = {}) => {
  if (!record) {
    return;
  }

  const { currentValidField, calcQuotationRange } = options || {};

  const {
    // floatType,
    biddingStrategy,
    lowestQuotationPrice,
    biddingQuotationMethod,
    [currentValidField]: validQuotaitonPrice,
  } =
    record?.get([
      // 'floatType',
      'biddingStrategy',
      'lowestQuotationPrice',
      'biddingQuotationMethod',
      currentValidField,
    ]) || {};

  let lowestMinusQuotationRange = null;
  if (biddingQuotationMethod === 'BIDDING') {
    // lowestMinusQuotationRange = math.minus(lowestQuotationPrice, calcQuotationRange || 0); // 最低价-报价幅度
    if (biddingStrategy === 'BELOW_THE_LOWEST_PRICE') {
      if (!isNil(lowestQuotationPrice)) {
        lowestMinusQuotationRange = math.minus(lowestQuotationPrice, calcQuotationRange || 0);
      }
    }
    if (biddingStrategy === 'LOWER_THAN_LAST_QUOTE') {
      if (!isNil(validQuotaitonPrice)) {
        lowestMinusQuotationRange = math.minus(validQuotaitonPrice, calcQuotationRange || 0);
      }
    }
  }

  if (biddingQuotationMethod === 'AUCTION') {
    // lowestMinusQuotationRange = math.plus(lowestQuotationPrice, calcQuotationRange || 0); // 最低价-报价幅度
    if (biddingStrategy === 'ABOVE_MAXIMUM_PRICE') {
      if (!isNil(lowestQuotationPrice)) {
        lowestMinusQuotationRange = math.plus(lowestQuotationPrice, calcQuotationRange || 0);
      }
    }
    if (biddingStrategy === 'ABOVE_THAN_LAST_QUOTE') {
      if (!isNil(validQuotaitonPrice)) {
        lowestMinusQuotationRange = math.plus(validQuotaitonPrice, calcQuotationRange || 0);
      }
    }
  }

  return lowestMinusQuotationRange;
};

// 重新计算价格值
const reCalculatePriceValue = (data = null, options) => {
  const {
    name,
    record,
    lowestMinusQuotationRange,
    biddingStrategy,
    biddingQuotationMethod,
    currentQuotationPrice,
    currentPrecision,
  } = data || {};
  const { needInitValue = 0 } = options || {};

  if (!record) {
    return;
  }

  // if (isNil(calcQuotationRange)) {
  //   record.set(name, null);
  //   return;
  // }

  // record init field vlaue
  const initValues = (currentFieldName, currentFieldValue) => {
    if (needInitValue) {
      record.init(currentFieldName, currentFieldValue);
    }
  };

  if (math.lt(lowestMinusQuotationRange || 0, 0)) {
    return;
  }

  // 最低价依据精度处理小数位数
  const currentFormatLowestMinusQuotationRange = () => {
    return handleOperatePricePrecision(lowestMinusQuotationRange, { biddingQuotationMethod, currentPrecision, });
  };

  const CurrentLowestFormattedByPrecisionValue = currentFormatLowestMinusQuotationRange();

  if (biddingQuotationMethod === 'BIDDING') {
    if (biddingStrategy === 'BELOW_THE_LOWEST_PRICE') {
      if (!isNil(lowestMinusQuotationRange)) {
        record.set(name, CurrentLowestFormattedByPrecisionValue);
        initValues(name, CurrentLowestFormattedByPrecisionValue);
      }

      if (!isNil(currentQuotationPrice)) {
        if (math.lt(currentQuotationPrice, lowestMinusQuotationRange || 0)) {
          record.set(name, currentQuotationPrice);
          initValues(name, currentQuotationPrice);
        }

        if (math.gte(currentQuotationPrice, lowestMinusQuotationRange)) {
          record.set(name, CurrentLowestFormattedByPrecisionValue);
          initValues(name, CurrentLowestFormattedByPrecisionValue);
        }
      }
    }

    if (biddingStrategy === 'LOWER_THAN_LAST_QUOTE') {
      if (!isNil(lowestMinusQuotationRange)) {
        record.set(name, CurrentLowestFormattedByPrecisionValue);
        initValues(name, CurrentLowestFormattedByPrecisionValue);
      }

      if (math.lt(currentQuotationPrice || 0, lowestMinusQuotationRange || 0)) {
        record.set(name, currentQuotationPrice);
        initValues(name, currentQuotationPrice);
      }
    }
  }

  if (biddingQuotationMethod === 'AUCTION') {
    if (biddingStrategy === 'ABOVE_MAXIMUM_PRICE') {
      if (math.gt(currentQuotationPrice || 0, lowestMinusQuotationRange || 0)) {
        record.set(name, currentQuotationPrice);
        initValues(name, currentQuotationPrice);
      }

      if (math.lt(currentQuotationPrice || 0, lowestMinusQuotationRange || 0)) {
        record.set(name, CurrentLowestFormattedByPrecisionValue);
        initValues(name, CurrentLowestFormattedByPrecisionValue);
      }
    }
    if (biddingStrategy === 'ABOVE_THAN_LAST_QUOTE') {
      if (!isNil(lowestMinusQuotationRange)) {
        record.set(name, lowestMinusQuotationRange);
        initValues(name, lowestMinusQuotationRange);
      }
      if (!isNil(lowestMinusQuotationRange)) {
        if (math.lt(currentQuotationPrice || 0, lowestMinusQuotationRange || 0)) {
          record.set(name, CurrentLowestFormattedByPrecisionValue);
          initValues(name, CurrentLowestFormattedByPrecisionValue);
        } else {
          record.set(name, currentQuotationPrice);
          initValues(name, currentQuotationPrice);
        }
      }
    }
  }
};

// 处理金额精度
const handleOperatePricePrecision = (value, data) => {
  const {
    biddingQuotationMethod,
    currentPrecision,
  } = data || {};

  if (isNil(value)) {
    return value;
  }

  let newPriceValue = value;
  const PrecisionNumber = math.pow(10, currentPrecision || 0);

  if (biddingQuotationMethod === 'AUCTION') {
    newPriceValue = math.div(
      math.ceil(
        math.multipliedBy(value || 0, PrecisionNumber)
      ),
      PrecisionNumber
    );
  }

  if (biddingQuotationMethod === 'BIDDING') {
    newPriceValue = math.div(
      math.floor(
        math.multipliedBy(value || 0, PrecisionNumber)
      ),
      PrecisionNumber
    );
  }

  return newPriceValue;
};

export {
  calcQuotationRangeValue,
  reCalculatePriceValue,
  calcLowestMinusQuotationRange,
  formatLowestMinusQuotationRange,
  handleOperatePricePrecision,
};
