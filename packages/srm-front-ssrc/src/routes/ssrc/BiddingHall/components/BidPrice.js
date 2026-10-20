import React, { Component } from 'react';
import { Icon, Output, NumberField } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { isNil } from 'lodash';
import { Throttle, Debounce } from 'lodash-decorators';
import classNames from 'classnames';

// import intl from 'utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';
// import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import {
  calcQuotationRangeValue,
  reCalculatePriceValue,
  calcLowestMinusQuotationRange,
  handleOperatePricePrecision,
} from '@/routes/ssrc/BiddingHall/utils/calculatorPrice';

import Styles from './index.less';

/**
 * props object
 * name string NumberField name
    validField number 上次有效值
    record Record current
    pageReadOnlyFlag boolean
    headerInfo object
    afterQuotatedPriceCalc boolean 报价后是否计算
    changePriceCancelCalculateFlag int 0 - 输入框变更后，不执行自动计算逻辑标识, 1 = 输入框变更后不执行自动计算
 * */

/**
 * A.竞价方式是竞价
 * 出价策略是低于最低价，数据公开规则是隐藏身份公开报价/公开身份公开报价，当最低价发生变化后，如果单价字段中的值<【最低价-报价幅度】，系统不对单价进行刷新。如果单价字段中的值>【最低价-报价幅度】,系统自动将单价字段中的值变为【最低价-报价幅度】；出价策略是低于上次出价，供应商出价后，系统自动将单价字段中的值变为【最低价-报价幅度】

  B.竞价方式是拍卖
  出价策略是高于最高价
  数据公开规则是隐藏身份公开报价/公开身份公开报价，如果单价字段中的值>【最高价+报价幅度】，系统不对单价进行刷新。如果单价字段中的值<【最高价+报价幅度】,系统自动将单价字段中的值变为【最低价-报价幅度】；出价策略是高于上次出价，供应商出价后，系统自动将单价字段中的值变为【最高价+报价幅度】

  PS：浮动方式是金额时，按照以上逻辑进行加减；浮动方式是比例，出价格策略是低于最低价时，报价幅度=最低价*比例；浮动方式是比例，出价格策略是低于上次出价时，报价幅度=上次出价*比例
*/

// 单价输入
@observer
class BidPrice extends Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }
  }

  @Throttle(800)
  minus = () => {
    const { record, name, pageReadOnlyFlag, validField, currentPrecision } = this.props;
    if (!record || pageReadOnlyFlag) {
      return;
    }

    const { minusEditFlag = 0 } = this.minusAndPlusDisabled() || {};
    const currentFieldDisabled = this.calcInputDisabled(); // 如果当前字段禁用，+-号也需要禁用
    const { quotationRange, [name]: price, biddingQuotationMethod } = record.get([
      'quotationRange',
      name,
      'biddingQuotationMethod',
    ]);
    if (isNil(price) || isNil(quotationRange) || !minusEditFlag || currentFieldDisabled) {
      return;
    }

    const calcQuotationRange = calcQuotationRangeValue(record, {
      validField,
    });

    let newPrice = math.minus(price, calcQuotationRange);
    newPrice = handleOperatePricePrecision(newPrice, {
      currentPrecision,
      biddingQuotationMethod,
    });
    if (math.lte(newPrice, 0)) {
      newPrice = 0;
    }

    runInAction(() => {
      record.set(name, newPrice);

      this.reCalculatePrice(record);
    });
  };

  @Throttle(800)
  plus = () => {
    const { record, name, pageReadOnlyFlag, validField, currentPrecision } = this.props;
    if (!record || pageReadOnlyFlag) {
      return;
    }

    const { plusEditFlag = 0 } = this.minusAndPlusDisabled() || {};
    const { quotationRange, [name]: price, biddingQuotationMethod } = record.get([
      'quotationRange',
      name,
      'biddingQuotationMethod',
    ]);
    const currentFieldDisabled = this.calcInputDisabled(); // 如果当前字段禁用，+-号也需要禁用
    if (isNil(price) || isNil(quotationRange) || !plusEditFlag || currentFieldDisabled) {
      return;
    }

    const calcQuotationRange = calcQuotationRangeValue(record, {
      validField,
    });

    let newPrice = math.plus(price, calcQuotationRange);

    newPrice = handleOperatePricePrecision(newPrice, {
      currentPrecision,
      biddingQuotationMethod,
    });

    runInAction(() => {
      record.set(name, newPrice);

      this.reCalculatePrice(record);
    });
  };

  /**
   * 1.展示逻辑：
      1）报价行的状态是【进行中】，点击+/-符号，可+/-报价幅度。
      竞价方式是竞价，出价策略是低于最低价，供应商可以点击-，供应商的报价低于最低价至少2个报价幅度时，可点击+，否则置灰。
      出价策略是低于上次出价，供应商可以可以点击-，供应商的报价低于最低价至少2个报价幅度时，可点击+，否则置灰。
      输入价格小于报价幅度，减号禁用

      竞价方式是拍卖，出价策略是高于上次出价，供应商可以点击+，供应商的报价高于最高价至少2个报价幅度时，可点击-，否则置灰。
      出价策略是高于上次出价，供应商可以点击+，供应商的报价高于最高价至少2个报价幅度时，可点击-，否则置灰。
      输入价格小于报价幅度，减号禁用

      例：拍卖，出价策略是高于上次出价，报价幅度是10，当前最高价是100，单价高于等于120时，可以点击-，110时，不可以点击-
      2）在报价行的状态是其他，+/-符号置灰，不可操作。
     2.点击【-】，需要校验当前金额-报价幅度≥起拍价，如果小于起拍价，前端自动将【-】按钮置灰（拍卖）
     3.点击【+】，需要校验当前金额+报价幅度≤起竞价，如果大于起竞价，前端自动将【+】按钮置灰（竞价）
  */
  minusAndPlusDisabled = () => {
    const { name, record, validField } = this.props;
    if (!record) {
      return;
    }

    const {
      biddingStrategy,
      lowestQuotationPrice,
      biddingQuotationMethod = null,
      startingBiddingPrice,
      [name]: currentQuotationPrice = null,
      [validField]: validPrice,
    } =
      record?.get([
        'biddingStrategy',
        'lowestQuotationPrice',
        'biddingQuotationMethod',
        name,
        validField,
        'startingBiddingPrice',
      ]) || {};

    let minusEditFlag = false;
    let plusEditFlag = false;

    if (!isNil(currentQuotationPrice)) {
      minusEditFlag = true;
      plusEditFlag = true;
    }

    const calcQuotationRange = calcQuotationRangeValue(record, {
      validField,
    });

    if (biddingQuotationMethod === 'BIDDING') {
      if (biddingStrategy === 'BELOW_THE_LOWEST_PRICE') {
        minusEditFlag = math.gte(currentQuotationPrice, calcQuotationRange);

        // 起竞价存在，最低价不存在
        if (!isNil(startingBiddingPrice) && isNil(lowestQuotationPrice)) {
          plusEditFlag = math.lte(
            currentQuotationPrice || 0,
            math.minus(startingBiddingPrice || 0, calcQuotationRange || 0)
          );
        }

        // 起竞价不存在，最低价不存在
        if (isNil(startingBiddingPrice) && isNil(lowestQuotationPrice)) {
          plusEditFlag = true;
        }

        // 起竞价存在，最低价存在
        if (!isNil(startingBiddingPrice) && !isNil(lowestQuotationPrice)) {
          plusEditFlag = math.lte(
            currentQuotationPrice,
            math.minus(lowestQuotationPrice, math.multipliedBy(calcQuotationRange || 0, 2))
          );
        }

        // 起竞价不存在，最低价存在
        if (isNil(startingBiddingPrice) && !isNil(lowestQuotationPrice)) {
          plusEditFlag = math.lte(
            currentQuotationPrice,
            math.minus(lowestQuotationPrice, math.multipliedBy(calcQuotationRange || 0, 2))
          );
        }
      }

      if (biddingStrategy === 'LOWER_THAN_LAST_QUOTE') {
        // 上次报价不存在
        if (isNil(validPrice)) {
          plusEditFlag = false;
          minusEditFlag = false;
        }

        // 上次报价存在
        if (!isNil(validPrice)) {
          minusEditFlag = math.gte(currentQuotationPrice, calcQuotationRange);
          plusEditFlag = math.lte(
            currentQuotationPrice || 0,
            math.minus(validPrice, math.multipliedBy(calcQuotationRange || 0, 2))
          );

          if (math.eq(validPrice, 0)) {
            plusEditFlag = false;
            minusEditFlag = false;
          }
        }
      }
    }

    if (biddingQuotationMethod === 'AUCTION') {
      if (biddingStrategy === 'ABOVE_MAXIMUM_PRICE') {
        plusEditFlag = true;

        // 起竞价存在，最低价不存在
        if (!isNil(startingBiddingPrice) && isNil(lowestQuotationPrice)) {
          minusEditFlag = math.gte(
            currentQuotationPrice || 0,
            math.plus(startingBiddingPrice, calcQuotationRange || 0)
          );
        }

        // 起竞价不存在，最低价不存在
        if (isNil(startingBiddingPrice) && isNil(lowestQuotationPrice)) {
          minusEditFlag = math.gte(currentQuotationPrice || 0, calcQuotationRange);
        }

        // 起竞价存在，最低价存在
        if (!isNil(startingBiddingPrice) && !isNil(lowestQuotationPrice)) {
          minusEditFlag = math.gte(
            currentQuotationPrice,
            math.plus(lowestQuotationPrice, math.multipliedBy(calcQuotationRange || 0, 2))
          );
        }

        // 起竞价不存在，最低价存在
        if (isNil(startingBiddingPrice) && !isNil(lowestQuotationPrice)) {
          minusEditFlag = math.gte(
            currentQuotationPrice,
            math.plus(lowestQuotationPrice, math.multipliedBy(calcQuotationRange || 0, 2))
          );
        }
      }

      if (biddingStrategy === 'ABOVE_THAN_LAST_QUOTE') {
        // 上次报价不存在
        if (isNil(validPrice)) {
          plusEditFlag = false;
          minusEditFlag = false;
        }

        // 上次报价存在
        if (!isNil(validPrice)) {
          minusEditFlag = math.gte(
            currentQuotationPrice,
            math.plus(validPrice, math.multipliedBy(calcQuotationRange || 0, 2))
          );

          if (math.eq(validPrice, 0)) {
            plusEditFlag = false;
            minusEditFlag = false;
          }
        }
      }
    }

    if (!calcQuotationRange || isNil(currentQuotationPrice)) {
      minusEditFlag = false;
      plusEditFlag = false;
    }

    return {
      minusEditFlag,
      plusEditFlag,
    };
  };

  changePrice = (value, record) => {
    const { afterQuotatedPriceCalc = null } = this.props;
    if (!record) {
      return;
    }

    if (afterQuotatedPriceCalc) {
      afterQuotatedPriceCalc({ record });
    }

    // 输入值后 自动计算逻辑
    // const autoCalculateFlag = changePriceCancelCalculateFlag !== 1;

    // this.reCalculatePrice(record, { autoCalculateFlag, });
  };

  /**
   * rp 错误，这块逻辑可能不符合
   * A.竞价方式是竞价，出价策略是低于最低价，数据公开规则是隐藏身份公开报价/公开身份公开报价，
   *  当最低价发生变化后，如果单价字段中的值<【最低价-报价幅度】，系统不对单价进行刷新。
   *  如果单价字段中的值>【最低价-报价幅度】,系统自动将单价字段中的值变为【最低价-报价幅度】；
   *  出价策略是低于上次出价，供应商出价后，系统自动将单价字段中的值变为【最低价-报价幅度】
   * B.竞价方式是拍卖，出价策略是高于最高价，数据公开规则是隐藏身份公开报价/公开身份公开报价，
   *  如果单价字段中的值>【最高价+报价幅度】，系统不对单价进行刷新。如果单价字段中的值<【最高价+报价幅度】,系统自动将单价字段中的值变为【最低价-报价幅度】
   *  出价策略是高于上次出价，供应商出价后，系统自动将单价字段中的值变为【最高价+报价幅度】
   */
  @Debounce(500)
  reCalculatePrice = (record, options) => {
    const { autoCalculateFlag = 1 } = options || {};
    const {
      name,
      detailViewFormDS,
      currentPrecision,
      validField,
      afterQuotatedPriceCalc,
    } = this.props;
    const {
      startingBiddingPrice,
      biddingStrategy,
      lowestQuotationPrice,
      biddingQuotationMethod,
      openRule,
      [name]: currentQuotationPrice = null,
      [validField]: validQuotationPrice = null,
    } =
      record?.get([
        'startingBiddingPrice',
        'biddingStrategy',
        'lowestQuotationPrice',
        'biddingQuotationMethod',
        'openRule',
        name,
        validField,
      ]) || {};
    const pristineCurrentPriceValue = record.getPristineValue(name);
    const calcQuotationRange = calcQuotationRangeValue(record, {
      validField,
    });

    const lowestMinusQuotationRange = calcLowestMinusQuotationRange(record, {
      calcQuotationRange,
      currentValidField: validField,
    });

    const data = {
      name,
      record,
      calcQuotationRange,
      lowestQuotationPrice,
      lowestMinusQuotationRange,
      pristineCurrentPriceValue,
      startingBiddingPrice,
      biddingStrategy,
      biddingQuotationMethod,
      openRule,
      currentQuotationPrice,
      detailViewFormDS,
      currentPrecision,
      validQuotationPrice,
    };

    // 是否跳过自动计算赋值
    if (autoCalculateFlag) {
      reCalculatePriceValue(data);
    }

    if (afterQuotatedPriceCalc) {
      afterQuotatedPriceCalc({ record });
    }
  };

  calcInputDisabled = () => {
    const { record } = this.props;

    let currentFieldDisabled = false; // 如果当前字段禁用，+-号也需要禁用
    const currentField = record?.dataSet?.getField?.(name);
    currentFieldDisabled = currentField ? currentField?.get('disabled') : currentFieldDisabled;

    return currentFieldDisabled;
  };

  renderField = () => {
    const {
      record,
      name = '',
      pageReadOnlyFlag,
      disabledSubmitFlag = false,
      totalPriceFlag,
      validField,
      placeholder = '',
      // headerDS,
      headerInfo,
      allBidPriceDisabled = false, // 整个组件禁用
      showInputPrefixFlag = 1,
      innerTable = 0,
    } = this.props;
    if (!record || !name) {
      return '';
    }

    const currentFieldDisabled = this.calcInputDisabled(); // 如果当前字段禁用，+-号也需要禁用

    const { quotationRange } = record?.get(['quotationRange']);
    const { currencySymbol } = headerInfo || {};
    const showIconFlag =
      !!quotationRange && (!pageReadOnlyFlag || (!disabledSubmitFlag && totalPriceFlag));
    const { minusEditFlag, plusEditFlag } = this.minusAndPlusDisabled() || {};

    const iconVisibleFlag = showIconFlag && !pageReadOnlyFlag && !allBidPriceDisabled;
    const InputReadOnlyFlag = pageReadOnlyFlag || disabledSubmitFlag;
    const minusIconDisabledFlag = !minusEditFlag || allBidPriceDisabled || currentFieldDisabled;
    const plusIconDisabledFlag = !plusEditFlag || allBidPriceDisabled || currentFieldDisabled;

    return (
      <div className={Styles['ssrc-bidding-price-bid-price-component-wrap']}>
        {iconVisibleFlag ? (
          <div
            className={classNames(
              Styles['ssrc-bidding-price-bid-price-component-icon'],
              Styles['left-icon'],
              {
                [Styles['disabled-icon']]: minusIconDisabledFlag,
              }
            )}
            onClick={this.minus}
          >
            <Icon
              className={classNames({
                [Styles['disabled-icon-only']]: minusIconDisabledFlag,
              })}
              type="remove"
            />
          </div>
        ) : (
          ''
        )}
        <div
          className={classNames(Styles['ssrc-bidding-price-bid-price-component-price-value'], {
            [Styles['ssrc-bidding-price-bid-price-component-price-value-read']]: InputReadOnlyFlag,
            [Styles[
              'ssrc-bidding-price-bid-price-component-price-value-all-width'
            ]]: !iconVisibleFlag,
            [Styles['ssrc-bidding-price-bid-price-component-price-value-all-width-inner-table']]:
              !iconVisibleFlag && innerTable,
          })}
        >
          {InputReadOnlyFlag ? (
            <Output
              name={validField}
              record={record}
              renderer={({ value }) => {
                return (
                  <span style={{ fontWeight: !innerTable ? '600' : 'normal' }}>
                    {numberSeparatorRender(value) ?? ''}
                  </span>
                );
              }}
            />
          ) : (
            <NumberField
              name={name}
              prefix={showInputPrefixFlag ? currencySymbol || '' : ''}
              record={record}
              readOnly={allBidPriceDisabled}
              onChange={(value) => this.changePrice(value, record)}
              placeholder={placeholder}
              style={{ width: iconVisibleFlag ? '140px' : '100%', height: '40px' }}
            />
          )}
        </div>
        {iconVisibleFlag ? (
          <div
            className={classNames(
              Styles['ssrc-bidding-price-bid-price-component-icon'],
              Styles['right-icon'],
              {
                [Styles['disabled-icon']]: plusIconDisabledFlag,
              }
            )}
            onClick={this.plus}
          >
            <Icon
              type="add"
              className={classNames({
                [Styles['disabled-icon-only']]: plusIconDisabledFlag,
              })}
            />
          </div>
        ) : (
          ''
        )}
      </div>
    );
  };

  render() {
    const { visibleFlag = true, hiddenFlag = false } = this.props;

    if (hiddenFlag || !visibleFlag) {
      return '';
    }

    return this.renderField();
  }
}

export default BidPrice;
