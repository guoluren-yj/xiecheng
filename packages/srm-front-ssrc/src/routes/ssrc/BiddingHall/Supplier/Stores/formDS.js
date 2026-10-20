import moment from 'moment';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { isNil, noop } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import { getRatioTitle, getRangeTitle } from '@/routes/ssrc/BiddingHall/utils/renders';

import { transferToNumber } from '@/routes/ssrc/BiddingHall/utils/utils';
import {
  calcQuotationRangeValue,
  calcLowestMinusQuotationRange,
} from '@/routes/ssrc/BiddingHall/utils/calculatorPrice';
import {
  startingBiddingPriceTitle,
  trialStartingBiddingPriceTitle,
} from '@/routes/ssrc/InquiryHallNew/Update/utils/renderer';
import { getQuotationRangeLabel } from '../../utils/renders';
import { getUpdateFlag } from '../../utils/updateFlag';

// 单据头基本信息
const headerDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [],
  };
};

const ruleDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'biddingTarget',
        label: intl.get('ssrc.biddingHall.view.biddingTarget').d('竞价对象'),
      },
      {
        name: 'biddingStrategy',
        label: intl.get('ssrc.biddingHall.view.biddingStrategy').d('出价策略'),
      },
    ],
  };
};

const cardDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'biddingTarget',
        label: intl.get('ssrc.biddingHall.view.biddingTarget').d('竞价对象'),
      },
      {
        name: 'biddingStrategy',
        label: intl.get('ssrc.biddingHall.view.biddingStrategy').d('出价策略'),
      },
    ],
  };
};

// 警戒价form
const warningDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'warnPriceReductionRatio',
        type: 'number',
        min: 0.01,
        precision: 2,
        dynamicProps: {
          label({ dataSet }) {
            const header = dataSet.getState('header');
            const { biddingQuotationMethod } = header || {};
            return getRatioTitle({ biddingQuotationMethod });
          },
          max({ dataSet }) {
            const header = dataSet.getState('header');
            const { biddingQuotationMethod } = header || {};
            if (!biddingQuotationMethod) {
              return;
            }

            const max = biddingQuotationMethod === 'BIDDING' ? 100 : null;
            return max;
          },
        },
      },
      {
        name: 'warnPriceReductionRange',
        // min: '0.000000001',
        dynamicProps: {
          label({ dataSet }) {
            // const { floatType } = record.get(['floatType']);
            const header = dataSet.getState('header');
            const { biddingQuotationMethod } = header || {};

            // if (floatType === 'ratio') {
            //   return getRatioTitle({ biddingQuotationMethod });
            // }

            return getRangeTitle({ biddingQuotationMethod });
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { defaultPrecision, biddingTarget, financialPrecision } = header || {};

            let currentPrecision = null;
            if (biddingTarget === 'UNIT_PRICE') {
              currentPrecision = defaultPrecision;
            }
            if (biddingTarget === 'TOTAL_PRICE') {
              currentPrecision = financialPrecision;
            }

            return currentPrecision;
          },
          min({ dataSet }) {
            let min = 0.000_000_001;
            const header = dataSet.getState('header');
            let currentPrecision = null;
            const { defaultPrecision, biddingTarget, financialPrecision } = header || {};

            if (biddingTarget === 'UNIT_PRICE') {
              currentPrecision = defaultPrecision;
            }
            if (biddingTarget === 'TOTAL_PRICE') {
              currentPrecision = financialPrecision;
            }

            if (!isNil(currentPrecision)) {
              min = 1 / 10 ** currentPrecision;
            }

            min = transferToNumber(min);

            return min;
          },
        },
      },
      {
        label: intl.get(`ssrc.biddingHall.model.applyToAllItems`).d('适用所有物料'),
        name: 'collectionApplyToAllFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled({ dataSet }) {
            const unitWholeBatchPriceFlag = dataSet.getState('unitWholeBatchPriceFlag');

            const flag = unitWholeBatchPriceFlag;
            return flag;
          },
        },
      },
    ],
  };
};

// detail view form
const detailViewFormDataSet = (dsOptions = {}) => {
  const { japOrDutchBiddingTotalPrice = noop } = dsOptions || {};

  // is unit price
  const unitPrice = (ds = {}) => {
    let unitPriceFlag = false;
    if (!ds) {
      return unitPrice;
    }

    const { biddingTarget } = ds.getState('header') || {};
    unitPriceFlag = biddingTarget === 'UNIT_PRICE';

    return unitPriceFlag;
  };

  // is total price
  const totalPrice = (ds = {}) => {
    let totalPriceFlag = false;
    if (!ds) {
      return unitPrice;
    }

    const { biddingTarget } = ds.getState('header') || {};
    totalPriceFlag = biddingTarget === 'TOTAL_PRICE';

    return totalPriceFlag;
  };

  const getHeaderFormDSRecord = (ds) => {
    if (!ds) {
      return;
    }
    const headerFormDSCurrent = ds.getState('headerFormRecord');
    return headerFormDSCurrent;
  };

  // 最小出价小于报价幅度时候，出价禁用
  const minusQuotationLessThanQuotationRangeFlag = (record, options) => {
    const { validField } = options || {};
    if (!record || !validField) {
      return;
    }
    const calcQuotationRange = calcQuotationRangeValue(record, {
      validField,
    });

    const lowestMinusQuotationRange = calcLowestMinusQuotationRange(record, {
      calcQuotationRange,
      currentValidField: validField,
    });

    const flag =
      !isNil(calcQuotationRange) &&
      !isNil(lowestMinusQuotationRange) &&
      math.lt(lowestMinusQuotationRange, 0);

    return flag;
  };

  const commonDisabled = ({ dataSet }) => {
    const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
    const header = dataSet.getState('header');
    const { displayBiddingSupHeaderStatus } = header || {};

    // // 日/荷兰 总价必输，表单不能编辑
    const flag =
      pageReadOnlyFlag ||
      displayBiddingSupHeaderStatus === 'PAUSED' ||
      japOrDutchBiddingTotalPrice();

    return flag;
  };

  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.biddingHall.model.biddingPriceMode`).d('竞价模式'),
        name: 'biddingModeMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.biddingHall.model.biddingTarget`).d('竞价对象'),
        name: 'biddingTargetMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.biddingHall.model.biddingTarget`).d('竞价对象'),
        name: 'biddingTargetMeaning',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.biddingHall.model.biddingTarget`).d('竞价对象'),
        name: 'biddingTargetMeaning',
        disabled: true,
      },
      {
        name: 'startingBiddingPrice',
        label: intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价'),
        dynamicProps: {
          label({ dataSet }) {
            const { biddingQuotationMethod, biddingMode } = dataSet.getState('header') || {};

            const label = startingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });

            return label;
          },
        },
      },
      {
        name: 'trialStartingBiddingPrice',
        dynamicProps: {
          label({ dataSet }) {
            const { biddingQuotationMethod, biddingMode } = dataSet.getState('header') || {};

            const label = trialStartingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });

            return label;
          },
        },
      },
      {
        name: 'quotationRange',
        // label: intl.get('ssrc.biddingHall.model.quotationRange').d('报价幅度'),
        dynamicProps: {
          label({ dataSet, record }) {
            const { biddingQuotationMethod } = dataSet.getState('header') || {};
            const floatType = record.get('floatType');

            let label = '';

            const flag = japOrDutchBiddingTotalPrice({ record });

            // 当竞价模式=日式、荷兰式显示“叫价幅度”
            if (flag) {
              label = intl
                .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRangeBiddingPrice')
                .d('叫价幅度');
              return label;
            }

            // 当竞价模式=日式、荷兰式显示“叫价幅度”
            if (flag) {
              label = intl
                .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRangeBiddingPrice')
                .d('叫价幅度');
            }

            label = getQuotationRangeLabel({
              biddingQuotationMethod,
              floatType,
            });

            return label;
          },
        },
      },
      {
        name: 'biddingTrialQuotationRange',
        dynamicProps: {
          label({ record }) {
            let label = intl
              .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRangeTrial')
              .d('试竞价报价幅度');

            const flag = japOrDutchBiddingTotalPrice({ record });

            // 当竞价模式=日式、荷兰式显示“叫价幅度”
            if (flag) {
              label = intl
                .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationPriceRangeTrial')
                .d('试竞价叫价幅度');
            }

            return label;
          },
        },
      },
      {
        name: 'lowestQuotationPrice',
        dynamicProps: {
          label({ record }) {
            const biddingQuotationMethod = record.get('biddingQuotationMethod');
            return biddingQuotationMethod === 'AUCTION'
              ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
              : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价');
          },
        },
      },
      {
        name: 'biddingQuotationRank',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.myQuotaitons').d('我的报价'),
      },
      {
        name: 'currentQuotationSecPrice', // 单价-单价
        // label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        label: intl.get('ssrc.common.unitPrice').d('单价'),
        type: 'number',
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '', valueMissing: '' },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);
            const lowestQuotatinoRangeFlag = minusQuotationLessThanQuotationRangeFlag(record, {
              validField: 'validQuotationSecPrice',
            });

            const flag = pageReadOnlyFlag || !taxFlag || !unitPriceFlag || lowestQuotatinoRangeFlag;

            return flag;
          },
          required({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = !pageReadOnlyFlag && taxFlag && unitPriceFlag;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { defaultPrecision } = header || {};

            return defaultPrecision ?? null;
          },
        },
      },
      {
        defaultValidationMessages: { valueMissingNoLabel: '', valueMissing: '' },
        name: 'netSecondaryPrice', // 单价-单价
        label: intl.get('ssrc.common.unitPrice').d('单价'),
        type: 'number',
        min: 0,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);
            const lowestQuotatinoRangeFlag = minusQuotationLessThanQuotationRangeFlag(record, {
              validField: 'validNetSecondaryPrice',
            });

            const flag = pageReadOnlyFlag || taxFlag || !unitPriceFlag || lowestQuotatinoRangeFlag;

            return flag;
          },
          required({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = !pageReadOnlyFlag && !taxFlag && unitPriceFlag;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { defaultPrecision } = header || {};

            return defaultPrecision ?? null;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          required({ dataSet }) {
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = !pageReadOnlyFlag && unitPriceFlag;

            return flag;
          },
          disabled({ dataSet }) {
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = pageReadOnlyFlag || !unitPriceFlag;

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        ignore: 'always',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value) => value && value.taxId,
        transformResponse: (value) => {
          return value ? { taxId: value } : null;
        },
        dynamicProps: {
          lovPara({ dataSet }) {
            const {
              queryParameter: { commonProps = {} },
            } = dataSet;
            const { organizationId } = commonProps;
            return { organizationId };
          },
          required({ dataSet, record }) {
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = !pageReadOnlyFlag && unitPriceFlag;

            return flag && record.get('taxIncludedFlag');
          },
          disabled({ dataSet, record }) {
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = pageReadOnlyFlag || !unitPriceFlag;

            return flag || !record.get('taxIncludedFlag');
          },
        },
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        bind: 'taxId.taxRate',
      },

      {
        name: 'qtnTotalAmount', // 总价-金额
        label: intl.get('ssrc.biddingHall.model.biddingRecord.totalPrice').d('总价'),
        type: 'number',
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '', valueMissing: '' },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const totalPriceFlag = totalPrice(dataSet);
            const headerFormDSCurrent = getHeaderFormDSRecord(dataSet);
            const {
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceRunningFlag,
              biddingTotalPricePrinciple,
            } = headerFormDSCurrent
              ? headerFormDSCurrent.get([
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceRunningFlag',
                  'biddingTotalPricePrinciple',
                ])
              : {};
            const lowestQuotatinoRangeFlag = minusQuotationLessThanQuotationRangeFlag(record, {
              validField: 'validQtnTotalAmount',
            });

            const totalPriceRequired = biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
            // 补充单价
            const supplementPriceDisabledFlag =
              (!!biddingSupplierPriceSubmitFlag && !!biddingSupplementPriceRunningFlag) ||
              lowestQuotatinoRangeFlag ||
              biddingSupplementPriceRunningFlag;

            const flag =
              pageReadOnlyFlag ||
              !taxFlag ||
              !totalPriceFlag ||
              supplementPriceDisabledFlag ||
              !totalPriceRequired;

            return flag;
          },
          required({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const totalPriceFlag = totalPrice(dataSet);
            const headerFormDSCurrent = getHeaderFormDSRecord(dataSet);
            const {
              biddingSupplierPriceSubmitFlag,
              biddingTotalPricePrinciple,
            } = headerFormDSCurrent
              ? headerFormDSCurrent.get([
                  'biddingSupplierPriceSubmitFlag',
                  'biddingTotalPricePrinciple',
                ])
              : {};

            const totalPriceRequired = biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

            const flag =
              !pageReadOnlyFlag &&
              taxFlag &&
              totalPriceFlag &&
              !biddingSupplierPriceSubmitFlag &&
              totalPriceRequired;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { financialPrecision } = header || {};

            return financialPrecision ?? null;
          },
        },
      },
      {
        name: 'qtnNetAmount', // 总价-金额
        label: intl.get('ssrc.biddingHall.model.biddingRecord.totalPrice').d('总价'),
        type: 'number',
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '', valueMissing: '' },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const totalPriceFlag = totalPrice(dataSet);
            const headerFormDSCurrent = getHeaderFormDSRecord(dataSet);
            const {
              biddingSupplierPriceSubmitFlag,
              biddingTotalPricePrinciple,
              biddingSupplementPriceRunningFlag,
            } = headerFormDSCurrent
              ? headerFormDSCurrent.get([
                  'biddingSupplierPriceSubmitFlag',
                  'biddingTotalPricePrinciple',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const lowestQuotatinoRangeFlag = minusQuotationLessThanQuotationRangeFlag(record, {
              validField: 'validQtnNetAmount',
            });
            // 补充单价
            const supplementPriceDisabledFlag =
              (!!biddingSupplierPriceSubmitFlag && !!biddingSupplementPriceRunningFlag) ||
              lowestQuotatinoRangeFlag ||
              biddingSupplementPriceRunningFlag;
            const totalPriceRequired = biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

            const flag =
              pageReadOnlyFlag ||
              taxFlag ||
              !totalPriceFlag ||
              biddingSupplierPriceSubmitFlag ||
              lowestQuotatinoRangeFlag ||
              supplementPriceDisabledFlag ||
              !totalPriceRequired;

            return flag;
          },
          required({ dataSet, record }) {
            const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const totalPriceFlag = totalPrice(dataSet);
            const headerFormDSCurrent = getHeaderFormDSRecord(dataSet);
            const {
              biddingSupplierPriceSubmitFlag,
              biddingTotalPricePrinciple,
            } = headerFormDSCurrent
              ? headerFormDSCurrent.get([
                  'biddingSupplierPriceSubmitFlag',
                  'biddingTotalPricePrinciple',
                ])
              : {};
            const totalPriceRequired = biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

            const flag =
              !pageReadOnlyFlag &&
              !taxFlag &&
              totalPriceFlag &&
              !biddingSupplierPriceSubmitFlag &&
              totalPriceRequired;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { financialPrecision } = header || {};

            return financialPrecision ?? null;
          },
        },
      },
      {
        name: 'unitPriceUpdatedFlag',
      },
      {
        name: 'deferBiddingFlag',
      },
      {
        name: 'biddingAllowedQuotationCount',
      },
      {
        name: 'deferBiddingAllowedQuotationCount',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        help: intl
          .get('ssrc.supplierQuotation.model.supQuo.priceQuantityExplainHelp')
          .d(
            '一个单位包含多少个货品;例如以"袋"为单位的螺丝里,一袋有20个螺丝,价格批量即为20,用以价格库等地方计算"每一单价"，即"单价"除以"价格批量"'
          ),
        name: 'priceBatchQuantity',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量'),
        name: 'currentQuotationSecQuantity',
        type: 'number',
        min: '0',
        dynamicProps: {
          disabled({ dataSet }) {
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = pageReadOnlyFlag || !unitPriceFlag;

            return flag;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        name: 'currentExpiryDateFrom',
        type: 'date',
        dynamicProps: {
          disabled({ dataSet }) {
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = pageReadOnlyFlag || !unitPriceFlag;

            return flag;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        name: 'currentExpiryDateTo',
        type: 'date',
        dynamicProps: {
          disabled({ dataSet }) {
            const pageReadOnlyFlag = commonDisabled({ dataSet });
            const unitPriceFlag = unitPrice(dataSet);

            const flag = pageReadOnlyFlag || !unitPriceFlag;

            return flag;
          },
        },
        computedProps: {
          min({ record }) {
            const currentField = record.getField('currentExpiryDateTo');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const currentExpiryDateFrom = record.get('currentExpiryDateFrom');
            const min = currentExpiryDateFrom
              ? 'currentExpiryDateFrom'
              : moment(new Date()).format(DEFAULT_DATE_FORMAT);
            return min;
          },
        },
      },
      { name: 'objectVersionNumber' },
      {
        name: 'nextBiddingRoundPrice',
        label: intl.get('ssrc.biddingHall.view.title.currentOutcryOfNextRound').d('下轮叫价'),
        disabled: true,
      },
      {
        name: 'validQtnTotalAmount',
        label: intl.get('ssrc.biddingHall.view.title.hasAccepttedPrice').d('已接受叫价'),
        disabled: true,
      },
      {
        name: 'validQtnNetAmount',
        label: intl.get('ssrc.biddingHall.view.title.hasAccepttedPrice').d('已接受叫价'),
        disabled: true,
      },
      {
        name: 'currentBiddingRoundPrice',
        label: intl.get('ssrc.biddingHall.view.title.currentPriceValue').d('当前价格'),
        disabled: true,
      },
      {
        name: 'currentBiddingRoundNumber',
        label: intl.get('ssrc.common.view.currentRoundNumber').d('当前轮次'),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        if (dataSet && dataSet.current) {
          const { qtnTotalAmount = 0, qtnNetAmount = 0 } = dataSet.current
            ? dataSet.current.get(['qtnNetAmount', 'qtnTotalAmount'])
            : {};

          dataSet.current.set({
            qtnTotalAmountTemp: qtnTotalAmount,
            qtnNetAmountTemp: qtnNetAmount,
          });
        }
        dataSet.setState('unitPriceUpdatedFlag', 0);
      },
      update: ({ dataSet, name }) => {
        // 表单字段更新后，需要记录，在切换时候有变更需要调用保存
        const unitPriceUpdatedPriceField = getUpdateFlag({ name });

        if (unitPriceUpdatedPriceField) {
          dataSet.setState('unitPriceUpdatedFlag', 1); // 价格变更记录
        }
      },
    },
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, totalPriceFlag, advanced = {}, ...others } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }

        let currentUrl = '';
        if (totalPriceFlag === 1) {
          currentUrl = `${SRM_SSRC}/v1/${organizationId}/bidding/sup/header/cur/total-price/query-info`;
        }

        return {
          url: currentUrl || `${SRM_SSRC}/v1/${organizationId}/bidding/sup/line/cur/info`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
            totalPriceFlag,
          },
          data: { ...otherCommonProps, ...advanced, ...others },
        };
      },
    },
  };
};

// 单据头基本信息
const detailViewItemInfoFormDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        name: 'rfxQuantity',
      },
      {
        label: intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息'),
        name: 'itemName',
        disabled: true,
      },
    ],
  };
};

const headerBaseInfoDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        textField: 'termName',
        valueField: 'termId',
        transformRequest: (value = {}) => {
          return value?.termId || value?.paymentTermId;
        },
        transformResponse: (value) => (value ? { paymentTermId: value, termId: value } : null),
        lovPara: {
          enabledFlag: 1,
        },
        dynamicProps: {
          disabled({ dataSet }) {
            const disabledAllFieldsFlag = dataSet.getState('disabledAllFieldsFlag');

            const flag = disabledAllFieldsFlag === 1;

            return flag;
          },
        },
      },
      {
        name: 'paymentTermName',
        bind: 'paymentTermId.termName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式'),
        name: 'paymentTypeId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENTTYPE',
        textField: 'typeName',
        valueField: 'typeId',
        transformRequest: (value = {}) => {
          return value?.typeId || value?.paymentTypeId;
        },
        transformResponse: (value) => (value ? { paymentTypeId: value, typeId: value } : null),
        dynamicProps: {
          disabled({ dataSet }) {
            const disabledAllFieldsFlag = dataSet.getState('disabledAllFieldsFlag');

            const flag = disabledAllFieldsFlag === 1;

            return flag;
          },
        },
      },
      // {
      //   name: 'disabledAllFieldsFlag',
      //   defaultValue: false,
      // },
      {
        name: 'paymentTypeName',
        bind: 'paymentTypeId.typeName',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.companyNameAttachmentBusTec`)
          .d('客户商务/技术附件'),
        name: 'companyNameUuid',
        disabled: true,
      },
      {
        name: 'rfxTechAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
      {
        name: 'rfxBusinessAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyCode',
        type: 'string',
        disabled: true,
      },
    ],
  };
};

export {
  detailViewFormDataSet,
  warningDataSet,
  headerDataSet,
  ruleDataSet,
  detailViewItemInfoFormDataSet,
  cardDataSet,
  headerBaseInfoDataSet,
};
