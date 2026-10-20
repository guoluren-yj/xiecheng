import { math } from 'choerodon-ui/dataset';

const getUpdateFlag = (data) => {
  const { name } = data || {};

  const markUpdatedFlag =
    !!name &&
    name !== 'trendFlag' &&
    name !== 'startingBiddingPrice' &&
    name !== 'quotationRange' &&
    name !== 'displayBiddingSupLineStatus' &&
    name !== 'displayBiddingSupLineStatusMeaning' &&
    name !== 'estimatedStartDate' &&
    name !== 'supplierDeferCount' &&
    name !== 'lowestQuotationPrice' &&
    name !== 'lowestDisplaySupplierName' &&
    name !== 'biddingQuotationRank' &&
    name !== 'displayQuotationPrice' &&
    name !== 'priceBatchQuantity' &&
    name !== 'currentLnTotalAmount' &&
    name !== 'currentLnNetAmount' &&
    name !== 'prequalEndDate' &&
    name !== 'currentDateTime' &&
    name !== 'lineQuotationStartDate' &&
    name !== 'lineQuotationEndDate' &&
    name !== 'startingTrialBiddingEndDate' &&
    name !== 'startingTrialBiddingStartDate' &&
    name !== 'checkFinishedDate' &&
    name !== 'allSupplierQuotedCount' &&
    name !== 'lineTrialQuotationEndDate' &&
    name !== 'status' &&
    name !== 'nextBiddingRoundPrice' &&
    name !== 'currentBiddingRoundPrice' &&
    name !== 'validQtnTotalAmount' &&
    name !== 'validQtnNetAmount' &&
    name !== 'signInEndDate' &&
    name !== 'headerQuotationEndDate' &&
    name !== 'latestQuotationEndDate' &&
    name !== 'headerQuotationStartDate' &&
    name !== 'lineTrialQuotationStartDate' &&
    name !== 'trafficLight';

  return markUpdatedFlag;
};

// 单价-整单批量，只监听价格字段
const updateUnitPriceUpdatedFlag = ({ name, dataSet, record }) => {
  const header = dataSet?.getState('header') || {};
  const { benchmarkPriceType } = header;
  const {
    currentQuotationSecPrice,
    netSecondaryPrice,
    currentQuotationSecPriceTemp,
    netSecondaryPriceTemp,
  } =
    record.get([
      'currentQuotationSecPrice',
      'netSecondaryPrice',
      'currentQuotationSecPriceTemp',
      'netSecondaryPriceTemp',
    ]) || {};

  let flag = 0;

  const taxPriceChange =
    benchmarkPriceType === 'TAX_INCLUDED_PRICE' && name === 'currentQuotationSecPrice';
  const unTaxPriceChange = benchmarkPriceType === 'NET_PRICE' && name === 'netSecondaryPrice';

  if (taxPriceChange) {
    const taxPriceValueChange = !math.eq(currentQuotationSecPrice, currentQuotationSecPriceTemp);
    flag = taxPriceValueChange ? 1 : 0;
    record.set('updatedFlag', flag);
  }

  if (unTaxPriceChange) {
    const unTaxPriceValueChange = !math.eq(netSecondaryPrice, netSecondaryPriceTemp);
    flag = unTaxPriceValueChange ? 1 : 0;
    record.set('updatedFlag', flag);
  }
};

export { getUpdateFlag, updateUnitPriceUpdatedFlag };
