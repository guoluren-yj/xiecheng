import React, { Component } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { Icon, Popover, Text } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Throttle, Bind } from 'lodash-decorators';
import { noop, isEmpty, isNil } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { C7NCPopover } from '@/routes/components/CPopover/C7NPopover';
import { numberSeparatorRender } from '@/utils/renderer';
import { warningPriceSave } from '@/services/biddingHallService';
import { getRatioTitle, getRangeTitle } from '@/routes/ssrc/BiddingHall/utils/renders';
import WarningForm from '../Modals/WarningForm';
import { CurrencyPrice } from '../../components';
import { priceCompareText } from '../../utils/renders';

import Styles from './index.less';

@observer
class WarningPrice extends Component {
  @Throttle(1200)
  @Bind()
  handleOperaterWarningPrice() {
    const {
      headerInfo = {},
      pageLoading,
      pageOperationLoading,
      warningDS,
      totalPriceFlag,
      unitWholeBatchPriceFlag = 0,
    } = this.props;
    if (pageLoading || pageOperationLoading) {
      return;
    }

    warningDS.setState('header', headerInfo);

    if (unitWholeBatchPriceFlag) {
      const defaultData = {
        collectionApplyToAllFlag: 1,
      };
      warningDS.loadData([defaultData]);
      warningDS.setState('unitWholeBatchPriceFlag', unitWholeBatchPriceFlag);
    }

    const containerProps = {
      warningDS,
      totalPriceFlag,
    };

    return Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.biddingHall.view.title.warningPriceValueSetting`).d('警戒值设置'),
      children: <WarningForm {...containerProps} />,
      style: { width: '380px' },
      bodyStyle: { padding: 0 },
      drawer: true,
      closable: true,
      onOk: this.warningPriceSave,
      onClose: this.clearWarningPriceDS,
      // cancelText: intl.get('hzero.common.button.close').d('关闭'),
      okProps: {
        loading: pageLoading || pageOperationLoading,
      },
    });
  }

  clearWarningPriceDS = () => {
    const { warningDS } = this.props;
    if (!warningDS) {
      return;
    }

    warningDS.loadData();
    warningDS.reset();
  };

  @Throttle(1200)
  warningPriceSave = async () => {
    const {
      organizationId,
      biddingSupLineCurId,
      rfxLineSupplierId,
      initPage = noop,
      refreshContent = noop,
      toggleContentLoading = noop,
      totalPriceFlag,
      unitPriceFlag,
      unitWholeBatchPriceFlag,
      warningDS,
      loading,
      detailViewFormDS,
      headerInfo,
    } = this.props;
    if (!warningDS) {
      return;
    }

    const { biddingSupHeaderCurId: headerBiddingSupHeaderCurId } = headerInfo || {};
    const { current: editFormRecord } = detailViewFormDS || {};
    const { biddingSupHeaderCurId } = editFormRecord
      ? editFormRecord.get(['biddingSupHeaderCurId'])
      : {};
    warningDS.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.status = 'update';
    });

    const validateFlag = await warningDS.validate();
    if (!validateFlag) {
      return false;
    }

    const formData = warningDS?.toData() || {};
    const currentFormData = formData[0];
    if (isEmpty(currentFormData)) {
      return;
    }

    const data = {
      querys: {},
      organizationId,
      biddingSupHeaderCurId: biddingSupHeaderCurId || headerBiddingSupHeaderCurId,
      biddingSupLineCurId,
      rfxLineSupplierId,
      ...currentFormData,
    };

    if (loading) {
      return false;
    }

    toggleContentLoading(true);
    let result = null;
    try {
      result = await warningPriceSave(data);
      result = getResponse(result);
      toggleContentLoading(false);
      if (!result) {
        return false;
      }

      notification.success();
      this.clearWarningPriceDS();

      if (unitPriceFlag) {
        if (unitWholeBatchPriceFlag) {
          // 整单批量出价
          initPage();
          return;
        }
        refreshContent({
          skipQueryTotalPriceTableFlag: 1,
        });
      }

      // 总价有前端计算的金额字段，所以不能刷新页面，只能手动更新
      if (totalPriceFlag) {
        const {
          objectVersionNumber,
          warnPriceReductionRatio = null,
          warnPriceReductionRange = null,
        } = result || {};

        headerInfo.objectVersionNumber = objectVersionNumber;
        const { current } = detailViewFormDS || {};
        if (current) {
          current.set({
            objectVersionNumber,
            warnPriceReductionRatio,
            warnPriceReductionRange,
          });
        }
      }
    } catch (e) {
      throw e;
    }
  };

  renderWarningPriceInfo = () => {
    const {
      headerDS,
      detailViewFormDS,
      headerInfo,
      warningPriceShowFlag,
      totalPriceFlag,
      pageLoading,
      pageOperationLoading,
      pageReadOnlyFlag,
      unitWholeBatchPriceFlag,
      japanDutchTotalPrice,
    } = this.props;
    const { biddingQuotationMethod } = headerInfo || {};
    let record = detailViewFormDS?.current;
    if (unitWholeBatchPriceFlag) {
      // 整单批量出价
      record = headerDS?.current;
    }
    const { warnPriceReductionRatio, warnPriceReductionRange } = record
      ? record.get(['warnPriceReductionRatio', 'warnPriceReductionRange'])
      : {};

    const formatPriceRatio = !isNil(warnPriceReductionRatio) ? `${warnPriceReductionRatio} %` : '-';
    const formatPriceRange = !isNil(warnPriceReductionRange)
      ? this.formatPriceUsePrecision(warnPriceReductionRange)
      : '-';

    if (japanDutchTotalPrice) {
      return '';
    }

    return (
      <span className={Styles['supplier-bidding-hall-body-quotation-warning-item']}>
        <span className={Styles['warning-item-wrap']}>
          <span className={Styles['warning-item-label']}>
            <Text>{getRatioTitle({ biddingQuotationMethod })}</Text>
          </span>
          <span className={Styles['warning-item-value']}>
            <Text>{formatPriceRatio}</Text>
          </span>
        </span>
        <span className={Styles['warning-item-wrap']}>
          <span className={Styles['warning-item-label']}>
            <Text>{getRangeTitle({ biddingQuotationMethod })}</Text>
          </span>
          <span className={Styles['warning-item-value']}>
            <Text>{formatPriceRange}</Text>
          </span>
        </span>
        {warningPriceShowFlag && (totalPriceFlag || unitWholeBatchPriceFlag) ? (
          <a
            className={classnames(Styles['warning-item-edit'], {
              [Styles['warning-item-edit-clear-flex']]: unitWholeBatchPriceFlag,
            })}
            onClick={this.handleOperaterWarningPrice}
            disabled={pageLoading || pageReadOnlyFlag || pageOperationLoading}
          >
            <Icon type="drive_file_rename_outline" style={{ color: '#868D9C' }} />
          </a>
        ) : (
          ''
        )}
      </span>
    );
  };

  // 差额
  getDifferencePrice = ({ totalAmount }) => {
    const { detailViewFormDS } = this.props;
    const { current: formCurrent } = detailViewFormDS || {};

    const { displayQuotationPrice } =
      formCurrent?.get([
        // 'qtnNetAmount',
        // 'qtnTotalAmount',
        'displayQuotationPrice',
        // 'supplementQtnNetAmount',
        // 'supplementQtnTotalAmount',
        // 'biddingSupplementPriceRunningFlag',
        // 'amountDifference',
      ]) || {};

    if (isNil(displayQuotationPrice) && isNil(totalAmount)) {
      return null;
    }

    const value = math.minus(displayQuotationPrice || 0, totalAmount || 0);

    return value;
  };

  // 差额 - render
  renderDifferencePrice = (value) => {
    const { detailViewFormDS, headerInfo, supplementPriceFlag } = this.props;
    const { displayBiddingSupHeaderStatus, biddingTotalPricePrinciple } = headerInfo || {};
    const { current: formCurrent } = detailViewFormDS || {};
    // 补充单价中
    const supplementFlag = supplementPriceFlag;
    // 出价和金额显示前提
    const currentPriceFlag =
      displayBiddingSupHeaderStatus === 'PAUSED' || displayBiddingSupHeaderStatus === 'IN_PROGRESS';
    if (!currentPriceFlag) {
      return '';
    }

    if (!formCurrent || !supplementFlag || biddingTotalPricePrinciple !== 'TOTAL_PRICE_REQUIRED') {
      return '';
    }

    return !isNil(value) ? (
      <span
        className={`${Styles['total-price-amount-difference-price-wrap']} total-price-amount-difference-price-value`}
      >
        <Text>
          {intl.get('ssrc.biddingHall.view.value.yourDifferencePriceValue').d('您的差额是')}:
          {this.formatPriceUsePrecision(value)}
        </Text>
      </span>
    ) : (
      ''
    );
  };

  formatPriceUsePrecision = (amount) => {
    const { headerInfo } = this.props;
    const { financialPrecision } = headerInfo || {};

    let price = null;
    if (!isNil(amount) && !isNil(financialPrecision)) {
      price = numberSeparatorRender(amount, financialPrecision, { omitZeroFlag: true });
    }

    return price;
  };

  // unit price 整单批量出价
  renderUnitWholeBatchPriceOperateView = () => {
    const {
      pageReadOnlyFlag,
      headerInfo,
      submitQuotationPrice = noop,
      pageLoading,
      pageOperationLoading,
      displayBiddingSupHeaderStatus,
      headerDS,
      unitWholeBatchPriceFlag,
      // totalCount,
      getBiddingRemainingQuotationCount,
      remote,
    } = this.props;
    const { benchmarkPriceType, currencySymbol, supplierStatus, rfxLineItemCount } =
      headerInfo || {};
    const { current: formCurrent } = headerDS || {};

    if (
      !formCurrent ||
      supplierStatus === 'PROHIBIT_QUOTATION' ||
      displayBiddingSupHeaderStatus === 'PAUSED'
    ) {
      return '';
    }

    const {
      currentQuotationTotalCount,
      currentQuotationTotalCountValue,
      qtnTotalAmount,
      qtnNetAmount,
      quotationCurrentTotalAmountValue,
      quotationCurrentNetAmountValue,
    } =
      formCurrent?.get([
        'currentQuotationTotalCount',
        'currentQuotationTotalCountValue',
        'qtnTotalAmount',
        'qtnNetAmount',
        'quotationCurrentTotalAmountValue',
        'quotationCurrentNetAmountValue',
      ]) || {};

    const unitPriceFieldStatusVisibleFlag =
      displayBiddingSupHeaderStatus === 'IN_PROGRESS' ||
      // displayBiddingSupHeaderStatus === 'FINISHED' ||
      // displayBiddingSupHeaderStatus === 'CLOSED' ||
      displayBiddingSupHeaderStatus === 'PAUSED';

    const { biddingRemainingCount: biddingRemainingQuotationCount } =
      getBiddingRemainingQuotationCount() || {};

    // 单价-整单-显示价格信息
    const unitWholePriceVisibleFlag = unitWholeBatchPriceFlag && unitPriceFieldStatusVisibleFlag;
    const currentTableQuotedNumber = currentQuotationTotalCountValue ?? currentQuotationTotalCount;

    const unTaxFlag = benchmarkPriceType && benchmarkPriceType !== 'TAX_INCLUDED_PRICE'; // 未税

    let totalAmount = quotationCurrentTotalAmountValue ?? qtnTotalAmount;
    if (unTaxFlag) {
      totalAmount = quotationCurrentNetAmountValue ?? qtnNetAmount;
    }

    // ps: 2023-09-28 新增判断 biddingSupplierPriceSubmitFlag为1代表已补充单价，不显示出价按钮
    const biddingSubmitShowFlag = displayBiddingSupHeaderStatus !== 'PAUSED' && !pageReadOnlyFlag;

    const formatTotalAmount = this.formatPriceUsePrecision(totalAmount) ?? '-';
    const submitDisabledFlag = biddingRemainingQuotationCount === 0;

    const currencyAndPrice = (
      <span className={Styles['total-price-amount-price']} style={{ maxWidth: '260px' }}>
        <CurrencyPrice
          currencySymbol={currencySymbol}
          price={formatTotalAmount}
          popProps={{ placement: 'topLeft' }}
        />
      </span>
    );

    let cuxBeforeDom = '';
    cuxBeforeDom = remote
      ? remote.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_WARNING_PRICE_CUX_BEFORE_DOM',
          cuxBeforeDom,
          { that: this, headerInfo }
        )
      : cuxBeforeDom;

    return (
      <div className={Styles['supplier-bidding-hall-body-quotation-warning-total-price-wrap']}>
        <div
          className={`${Styles['supplier-bidding-hall-body-quotation-warning-total-price-left-wrap']} supplier-bottom-wrap`}
        >
          {cuxBeforeDom}
          {!isNil(biddingRemainingQuotationCount) && unitWholePriceVisibleFlag ? (
            <div
              className={`${Styles['total-price-quotation-count-wrap']} total-price-quotation-count-wrap-num`}
            >
              {intl
                .get('ssrc.biddingHall.view.title.biddingAllowedQuotationCount', {
                  count: biddingRemainingQuotationCount,
                })
                .d('剩余可出价{count}次')}
            </div>
          ) : (
            ''
          )}
          {unitWholePriceVisibleFlag ? (
            <div className={Styles['total-price-amount-to-wrap']}>
              <span className={Styles['total-price-amount-to-label']}>
                {intl.get('ssrc.biddingHall.view.title.priceCurrentLines').d('出价行数')}：
              </span>
              <span className={Styles['total-price-amount-to-price-value']}>
                <span>
                  {currentTableQuotedNumber ?? 0}/{rfxLineItemCount || 0}
                </span>
              </span>
            </div>
          ) : (
            ''
          )}
          {unitWholePriceVisibleFlag ? (
            <div className={Styles['total-price-amount-to-wrap']}>
              <span className={Styles['total-price-amount-to-label']}>
                {intl.get('ssrc.biddingHall.view.title.amountTo').d('合计')}
              </span>
              <span
                className={`${Styles['total-price-amount-to-price-value']} total-price-amount-to-price-value-num`}
              >
                <span>{currencyAndPrice}</span>
              </span>
            </div>
          ) : (
            ''
          )}
        </div>

        {!biddingSubmitShowFlag ? (
          ''
        ) : (
          <Button
            color="primary"
            onClick={submitQuotationPrice}
            loading={pageLoading || pageOperationLoading}
            disabled={submitDisabledFlag}
            style={{ marginLeft: '12px' }}
          >
            {intl.get('ssrc.biddingHall.view.title.quotationPriceImmediately').d('立即出价')}
          </Button>
        )}
      </div>
    );
  };

  // total price
  renderTotalPriceAllowLineQuotationOperateView = () => {
    const {
      pageReadOnlyFlag,
      totalPriceFlag,
      headerInfo,
      detailViewFormDS,
      submitQuotationPrice = noop,
      pageLoading,
      pageOperationLoading,
      // supplementPriceFlag = false,
      // supplementUnitPriceFlag = false,
      displayBiddingSupHeaderStatus,
      currentStageBiddingRemainQuotationCount,
      japanDutchTotalPrice,
    } = this.props;
    const {
      biddingQuotationMethod,
      benchmarkPriceType,
      currencySymbol,
      biddingTotalPricePrinciple,
      supplierStatus,
      biddingSpreadPrice = null,
      quotationStatus,
    } = headerInfo || {};
    const { current: formCurrent } = detailViewFormDS || {};

    if (!formCurrent || !totalPriceFlag || supplierStatus === 'PROHIBIT_QUOTATION') {
      return '';
    }

    const {
      qtnTotalAmount,
      currentQtnTotalAmount = null,
      currentQtnNetAmount = null,
      qtnNetAmount,
      displayQuotationPrice,
      startingBiddingPrice,
      // amountDifference,
      biddingSupplierPriceSubmitFlag,
      biddingSupplementPriceRunningFlag,
      supplementQtnTotalAmount,
      supplementQtnNetAmount,
      // safePrice,
      currentSupplementQtnTotalAmount,
      currentSupplementQtnNetAmount,
      validSupplementQtnTaxAmount,
      validSupplementQtnNetAmount,
    } =
      formCurrent?.get([
        'qtnNetAmount',
        'currentQtnTotalAmount',
        'currentQtnNetAmount',
        'qtnTotalAmount',
        'displayQuotationPrice',
        'startingBiddingPrice',
        // 'amountDifference',
        'biddingSupplierPriceSubmitFlag',
        'biddingSupplementPriceRunningFlag',
        'supplementQtnTotalAmount',
        'supplementQtnNetAmount',
        // 'safePrice',
        'currentSupplementQtnTotalAmount',
        'currentSupplementQtnNetAmount',
        'validSupplementQtnTaxAmount',
        'validSupplementQtnNetAmount',
      ]) || {};

    const unTaxFlag = benchmarkPriceType && benchmarkPriceType !== 'TAX_INCLUDED_PRICE'; // 未税
    const processFlag = displayBiddingSupHeaderStatus === 'IN_PROGRESS';

    // 总价金额
    let totalAmount = currentQtnTotalAmount ?? qtnTotalAmount;
    if (unTaxFlag) {
      totalAmount = currentQtnNetAmount ?? qtnNetAmount;
    }

    // 补充单价金额
    if (biddingSupplementPriceRunningFlag || biddingSupplierPriceSubmitFlag) {
      totalAmount = currentSupplementQtnTotalAmount ?? supplementQtnTotalAmount;
      if (unTaxFlag) {
        totalAmount = currentSupplementQtnNetAmount ?? supplementQtnNetAmount;
      }
    }

    const biddingPriceValidate =
      biddingQuotationMethod === 'BIDDING' && math.gt(totalAmount, startingBiddingPrice);
    const auctionPriceValidate =
      biddingQuotationMethod === 'AUCTION' && math.lt(totalAmount, startingBiddingPrice);

    // const biddingSafePriceValidate = math.lt(displayQuotationPrice, safePrice);
    // const auctionSafePriceValidate = math.gt(displayQuotationPrice, safePrice);

    let text = priceCompareText({
      biddingPriceValidate,
      auctionPriceValidate,
      biddingQuotationMethod,
      // biddingSafePriceValidate,
      // auctionSafePriceValidate,
    });

    // 补充单价或者总价
    if (
      biddingSupplementPriceRunningFlag ||
      (totalPriceFlag && biddingTotalPricePrinciple !== 'UNIT_PRICE_REQUIRED')
    ) {
      text = '';
    }

    const totalFieldVisibleFlag =
      displayBiddingSupHeaderStatus === 'IN_PROGRESS' ||
      displayBiddingSupHeaderStatus === 'FINISHED' ||
      displayBiddingSupHeaderStatus === 'CLOSED' ||
      displayBiddingSupHeaderStatus === 'PAUSED';
    // 补充单价判定
    const totalPriceSupplementPriceFlag =
      totalPriceFlag &&
      (biddingSupplierPriceSubmitFlag ||
        biddingSupplementPriceRunningFlag ||
        !isNil(validSupplementQtnNetAmount) ||
        !isNil(validSupplementQtnTaxAmount));
    // 单价必输或者补充单价中
    const unitPriceRequiredOrSupplement =
      biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
      (totalPriceSupplementPriceFlag && !isNil(displayQuotationPrice));
    // 单价阶段或补充单价
    // ps: 2023-09-28 新增判断 biddingSupplierPriceSubmitFlag为1代表已补充单价，不显示出价按钮
    let biddingSubmitShowFlag =
      displayBiddingSupHeaderStatus !== 'PAUSED' &&
      !pageReadOnlyFlag &&
      unitPriceRequiredOrSupplement &&
      !biddingSupplierPriceSubmitFlag;

    // 日/荷兰式, 只要有一轮响应过，则可以补充单价
    if (japanDutchTotalPrice) {
      biddingSubmitShowFlag = biddingSubmitShowFlag && quotationStatus === 'QUOTED';
    }

    // 剩余可出价次数显示逻辑
    const biddingRemainingQuotationCountVisible =
      !pageReadOnlyFlag &&
      !biddingSupplementPriceRunningFlag &&
      processFlag &&
      biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED';

    const formatTotalAmount = this.formatPriceUsePrecision(totalAmount);
    const submitDisabledFlag =
      biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' &&
      currentStageBiddingRemainQuotationCount === 0;

    const currencyAndPrice = (
      <span className={Styles['total-price-amount-price']}>
        <CurrencyPrice
          currencySymbol={currencySymbol}
          price={formatTotalAmount}
          popProps={{ placement: 'topLeft' }}
        />
      </span>
    );

    const totalVisibleFlag =
      !isNil(totalAmount) && unitPriceRequiredOrSupplement && totalFieldVisibleFlag;

    const differencePrice = this.getDifferencePrice({ totalAmount }); // 差额

    // Your Difference Is {Currentpricedifference}, Which Is Not Within The Range Of The Difference Required By The Purchaser [{Negcurrentspredprice}~{Currentspreadprice}], And You Cannot Bid

    let buttonPopoverContent = '';
    // 补充单价页面，|差额|>价差时（差额=当前出价-竞价过程中最后一次出价），【立即出价】按钮置灰，
    // 鼠标放在【立即出价】按钮上后，有气泡说明【您的差额是1,000，不在采购方要求的差额范围【-100～100】内，无法出价】
    const showPriceDifferenceWarning =
      !isNil(biddingSpreadPrice) &&
      !isNil(differencePrice) &&
      math.gt(math.abs(differencePrice), biddingSpreadPrice);
    const currentPriceDifference = numberSeparatorRender(differencePrice);
    const negCurrentSpredPrice = numberSeparatorRender(math.negated(biddingSpreadPrice));
    const currentSpreadPrice = numberSeparatorRender(biddingSpreadPrice);

    if (showPriceDifferenceWarning) {
      buttonPopoverContent = intl
        .get('ssrc.biddingHall.view.title.biddingSpreadBiggerThanDifferenceWarning', {
          currentPriceDifference,
          negCurrentSpredPrice,
          currentSpreadPrice,
        })
        .d(
          '您的差额是{currentPriceDifference}, 不在采购方要求的差额范围【{negCurrentSpredPrice}～{currentSpreadPrice}】内, 无法出价'
        );
    }

    return (
      <div className={Styles['supplier-bidding-hall-body-quotation-warning-total-price-wrap']}>
        <div
          className={`${Styles['supplier-bidding-hall-body-quotation-warning-total-price-left-wrap']} supplier-bottom-wrap-bidding`}
        >
          {!isNil(currentStageBiddingRemainQuotationCount) &&
          biddingRemainingQuotationCountVisible ? (
            <div
              className={`${Styles['total-price-quotation-count-wrap']} total-price-quotation-count-wrap-num`}
            >
              {intl
                .get('ssrc.biddingHall.view.title.biddingAllowedQuotationCount', {
                  count: currentStageBiddingRemainQuotationCount,
                })
                .d('剩余可出价{count}次')}
            </div>
          ) : (
            ''
          )}
          {totalVisibleFlag ? (
            <div className={Styles['total-price-amount-to-wrap']}>
              <span className={Styles['total-price-amount-to-label']}>
                {intl.get('ssrc.biddingHall.view.title.amountTo').d('合计')}
              </span>
              <span
                className={`${Styles['total-price-amount-to-price-value']} total-price-amount-to-price-value-num`}
              >
                <span>{currencyAndPrice}</span>
              </span>
            </div>
          ) : (
            ''
          )}
          <div className={Styles['total-price-amount-wrap']}>
            {text && processFlag ? (
              <>
                <Icon type="error" style={{ marginRight: '8px', fontSize: '14px' }} />
                <Popover content={text}>{text}</Popover>
              </>
            ) : (
              ''
            )}
            {this.renderDifferencePrice(differencePrice)}
          </div>
        </div>

        {!biddingSubmitShowFlag ? (
          ''
        ) : (
          <C7NCPopover content={showPriceDifferenceWarning ? buttonPopoverContent : ''}>
            <Button
              color="primary"
              onClick={submitQuotationPrice}
              loading={pageLoading || pageOperationLoading}
              disabled={submitDisabledFlag || showPriceDifferenceWarning}
              style={{ marginLeft: '12px' }}
            >
              {intl.get('ssrc.biddingHall.view.title.quotationPriceImmediately').d('立即出价')}
            </Button>
          </C7NCPopover>
        )}
      </div>
    );
  };

  render() {
    const {
      // pageReadOnlyFlag,
      pageLoading,
      pageOperationLoading,
      // supplementUnitPriceFlag,
      // lineDisabledFlag,
      warningPriceShowFlag,
      totalPriceFlag,
      unitWholeBatchPriceFlag = false, // 单价-整单批量
      japanDutchTotalPrice,
    } = this.props;

    // right view
    let rightContent = this.renderTotalPriceAllowLineQuotationOperateView();
    if (unitWholeBatchPriceFlag) {
      // 单价竞价-整单批量出价-主内容footer
      rightContent = this.renderUnitWholeBatchPriceOperateView();
    }

    return (
      <div
        className={classnames(Styles['supplier-bidding-hall-body-quotation-warning-wrap'], {
          [Styles[
            'supplier-bidding-hall-body-quotation-warning-wrap-totalPrice'
          ]]: !!totalPriceFlag,
          [Styles[
            'supplier-bidding-hall-body-quotation-warning-wrap-unit-price-whole-batch'
          ]]: !!unitWholeBatchPriceFlag,
        })}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{this.renderWarningPriceInfo()}</div>
        {warningPriceShowFlag &&
        !totalPriceFlag &&
        !unitWholeBatchPriceFlag &&
        !japanDutchTotalPrice ? (
          <a
            onClick={this.handleOperaterWarningPrice}
            disabled={pageLoading || pageOperationLoading}
          >
            <Icon type="drive_file_rename_outline" style={{ color: '#868D9C' }} />
          </a>
        ) : (
          ''
        )}
        {rightContent}
      </div>
    );
  }
}

export default WarningPrice;
