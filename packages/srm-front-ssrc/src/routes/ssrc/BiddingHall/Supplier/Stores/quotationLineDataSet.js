// import React from 'react';
import moment from 'moment';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

// import { getQuantityAndUomCombine } from '@/utils/utils';

import { getQuotationRangeLabel } from '../../utils/renders';
import { updateUnitPriceUpdatedFlag } from '../../utils/updateFlag';

// unit price list view table
const quotationLineDataSet = (options) => {
  const {
    getBiddingRemainingQuotationCount,
    biddingUnitWholeBatchPriceFlag = () => {},
    getTaxOrUntax = () => {},
    readonlyOrPaused = () => {},
  } = options || {};

  const getBiddingRemainingCountFieldValue = (currentData) => {
    if (!getBiddingRemainingQuotationCount) {
      return null;
    }
    const { biddingRemainingCount } = getBiddingRemainingQuotationCount(currentData) || {};
    return biddingRemainingCount;
  };

  const unitPriceLineCommonDisabled = ({ dataSet, record }) => {
    // const header = dataSet.getState('header');
    const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
    // const taxFlag = getTaxOrUntax();
    const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();
    const readonlyOrPausedFlag = readonlyOrPaused();

    const flag =
      pageReadOnlyFlag ||
      // taxFlag ||
      !unitPriceBatchQuotationFlag ||
      getBiddingRemainingCountFieldValue({ record }) === 0 ||
      readonlyOrPausedFlag;

    return flag;
  };

  return {
    autoQuery: false,
    primaryKey: 'biddingSupLineCurId',
    // cacheSelection: false,
    selection: false,
    pageSize: 20,
    autoQueryAfterSubmit: false,
    fields: [
      {
        label: intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息'),
        name: 'itemInfoWrap',
      },
      {
        name: 'itemInfos',
        disabled: true,
      },
      {
        name: 'itemCode',
        disabled: true,
      },
      {
        name: 'itemName',
        disabled: true,
      },
      {
        name: 'specs',
        disabled: true,
      },
      {
        name: 'numbers',
        disabled: true,
      },
      {
        name: 'quantityAndName',
        label: intl.get('ssrc.common.number').d('数量'),
        disabled: true,
      },
      {
        name: 'uomName',
        disabled: true,
      },
      {
        name: 'rfxQuantity',
        disabled: true,
      },
      {
        name: 'secondaryQuantity',
        disabled: true,
      },
      {
        name: 'secondaryUomName',
        disabled: true,
      },
      // {
      //   name: 'startingBiddingPriceWrap',
      // },
      {
        name: 'startingBiddingPrice',
        label: intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价'),
        dynamicProps: {
          label({ dataSet }) {
            const { biddingQuotationMethod } = dataSet.getState('header') || {};

            let title = intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价');
            if (biddingQuotationMethod === 'AUCTION') {
              title = intl.get('ssrc.biddingHall.model.startingAuctionBiddingPrice').d('起拍价');
            }

            return title;
          },
        },
        disabled: true,
      },
      {
        name: 'quotationRange',
        dynamicProps: {
          label: ({ dataSet }) => {
            const { biddingQuotationMethod } = dataSet.getState('header') || {};

            const label = getQuotationRangeLabel({
              biddingQuotationMethod,
            });

            return label;
          },
        },
        disabled: true,
      },
      {
        name: 'predicateWrap',
        label: intl.get('ssrc.biddingHall.model.predicate').d('预计'),
      },
      {
        name: 'supplierDeferCount',
        disabled: true,
      },
      { name: 'estimatedStartDate', disabled: true },
      { name: 'lowestQuotationPrice', disabled: true },
      {
        name: 'operate',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'quotation',
        label: intl.get('ssrc.biddingHall.model.quotationPrice').d('出价'),
      },
      {
        name: 'currentQuotationSecPrice',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        type: 'number',
        min: 0,
        dynamicProps: {
          required({ dataSet, record }) {
            // const header = dataSet.getState('header');
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            // const {
            //   benchmarkPriceType,
            // } = header || {};
            const taxFlag = getTaxOrUntax();
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();
            const readonlyOrPausedFlag = readonlyOrPaused();

            const flag =
              !pageReadOnlyFlag &&
              taxFlag &&
              unitPriceBatchQuotationFlag &&
              !readonlyOrPausedFlag &&
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            return flag;
          },
          disabled({ dataSet, record }) {
            // const header = dataSet.getState('header');
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            // const {
            //   benchmarkPriceType,
            // } = header || {};
            const taxFlag = getTaxOrUntax();
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();
            const readonlyOrPausedFlag = readonlyOrPaused();

            const flag =
              pageReadOnlyFlag ||
              !taxFlag ||
              !unitPriceBatchQuotationFlag ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              readonlyOrPausedFlag;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { defaultPrecision } = header || {};

            return defaultPrecision;
          },
        },
      },
      {
        name: 'netSecondaryPrice',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        type: 'number',
        min: 0,
        dynamicProps: {
          required({ dataSet, record }) {
            // const header = dataSet.getState('header');
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            // const {
            //   benchmarkPriceType,
            // } = header || {};
            const taxFlag = getTaxOrUntax();
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();
            const readonlyOrPausedFlag = readonlyOrPaused();

            const flag =
              !pageReadOnlyFlag &&
              !taxFlag &&
              unitPriceBatchQuotationFlag &&
              !readonlyOrPausedFlag &&
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            return flag;
          },
          disabled({ dataSet, record }) {
            // const header = dataSet.getState('header');
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const taxFlag = getTaxOrUntax();
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();
            const readonlyOrPausedFlag = readonlyOrPaused();

            const flag =
              pageReadOnlyFlag ||
              taxFlag ||
              !unitPriceBatchQuotationFlag ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              readonlyOrPausedFlag;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { defaultPrecision } = header || {};

            return defaultPrecision;
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
          required({ dataSet, record }) {
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();

            const flag =
              !pageReadOnlyFlag &&
              unitPriceBatchQuotationFlag &&
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            return flag;
          },
          disabled({ dataSet, record }) {
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();
            const readonlyOrPausedFlag = readonlyOrPaused();

            const flag =
              pageReadOnlyFlag ||
              !unitPriceBatchQuotationFlag ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              readonlyOrPausedFlag;

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
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();

            const flag =
              !pageReadOnlyFlag &&
              unitPriceBatchQuotationFlag &&
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            return flag && taxIncludedFlag === 1;
          },
          disabled({ dataSet, record }) {
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const unitPriceBatchQuotationFlag = biddingUnitWholeBatchPriceFlag();
            const readonlyOrPausedFlag = readonlyOrPaused();

            const flag =
              pageReadOnlyFlag ||
              !unitPriceBatchQuotationFlag ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              readonlyOrPausedFlag;

            return flag || taxIncludedFlag === 0;
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
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        help: intl
          .get('ssrc.supplierQuotation.model.supQuo.priceQuantityExplainHelp')
          .d(
            '一个单位包含多少个货品;例如以"袋"为单位的螺丝里,一袋有20个螺丝,价格批量即为20,用以价格库等地方计算"每一单价"，即"单价"除以"价格批量"'
          ),
        name: 'priceBatchQuantity',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量'),
        name: 'currentQuotationSecQuantity',
        type: 'number',
        min: '0',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const flag = unitPriceLineCommonDisabled({ dataSet, record });

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
          disabled({ dataSet, record }) {
            const flag = unitPriceLineCommonDisabled({ dataSet, record });

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
          disabled({ dataSet, record }) {
            const flag = unitPriceLineCommonDisabled({ dataSet, record });

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
    ],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, advanced = {}, tagCheckedStatus = {}, ...others } = data || {};
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/sup/line/cur/page`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...advanced, ...tagCheckedStatus, ...others },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (!dataSet?.length) {
          return;
        }

        dataSet.forEach((record = {}) => {
          const {
            currentQuotationSecPrice = null,
            netSecondaryPrice = null,
          } = record.get([
            'currentQuotationSecPrice',
            'netSecondaryPrice',
          ]) || {};

          // 单价存一份
          record.set({
            currentQuotationSecPriceTemp: currentQuotationSecPrice,
            netSecondaryPriceTemp: netSecondaryPrice,
          });
        });
      },
      update: ({ record, name, dataSet }) => {
        updateUnitPriceUpdatedFlag({ name, dataSet, record });
      },
    },
  };
};

// unit price detail view item list
const quotationItemDataSet = () => {
  return {
    autoQuery: false,
    primaryKey: 'biddingSupLineCurId',
    cacheSelection: false,
    selection: false,
    pageSize: 1_000_000,
    fields: [
      {
        name: 'itemCode',
      },
      {
        name: 'itemName',
      },
      {
        name: 'specs',
      },
      {
        name: 'startingBiddingPrice',
        label: intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价'),
        dynamicProps: {
          label({ dataSet }) {
            const { biddingQuotationMethod } = dataSet.getState('header') || {};

            let title = intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价');
            if (biddingQuotationMethod === 'AUCTION') {
              title = intl.get('ssrc.biddingHall.model.startingAuctionBiddingPrice').d('起拍价');
            }

            return title;
          },
        },
      },
      {
        name: 'quotationRange',
        // label: intl.get('ssrc.biddingHall.model.quotationRange').d('报价幅度'),
        dynamicProps: {
          label({ dataSet }) {
            const { biddingQuotationMethod } = dataSet.getState('header') || {};

            const label = getQuotationRangeLabel({
              biddingQuotationMethod,
            });

            return label;
          },
        },
      },
      {
        name: 'predicateWrap',
        label: intl.get('ssrc.biddingHall.model.predicate').d('预计'),
      },
      { name: 'estimatedStartDate' },
      { name: 'displayBiddingSupLineStatus' },
      { name: 'objectVersionNumber' },
    ],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, advanced = {}, tagCheckedStatus = {}, ...others } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/sup/line/cur/list`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...advanced, ...tagCheckedStatus, ...others },
        };
      },
    },
  };
};

// total price table
const totalPriceTableDataSet = (options) => {
  const { getBiddingRemainingQuotationCount } = options || {};

  const getBiddingRemainingCountFieldValue = (currentData) => {
    if (!getBiddingRemainingQuotationCount) {
      return null;
    }
    const { biddingRemainingCount } = getBiddingRemainingQuotationCount(currentData) || {};
    return biddingRemainingCount;
  };

  const totalPriceLineCommonDisabled = ({ dataSet, record }) => {
    const header = dataSet.getState('header');
    const { biddingTotalPricePrinciple } = header || {};
    const headerFormRecord = dataSet.getState('headerFormRecord');
    const {
      // benchmarkPriceType,
      displayBiddingSupHeaderStatus,
      biddingSupplierPriceSubmitFlag,
      biddingSupplementPriceNotStartFlag,
      biddingSupplementPriceRunningFlag,
    } = headerFormRecord
      ? headerFormRecord.get([
          // 'benchmarkPriceType',
          'displayBiddingSupHeaderStatus',
          'biddingSupplierPriceSubmitFlag',
          'biddingSupplementPriceNotStartFlag',
          'biddingSupplementPriceRunningFlag',
        ])
      : {};
    // const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
    const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
    const priceTypeFlag =
      biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
      biddingSupplementPriceRunningFlag === 1;

    // 补充单价未开始或者已补充单价
    const supplementaryFlag =
      biddingSupplementPriceNotStartFlag ||
      (biddingSupplementPriceRunningFlag && biddingSupplierPriceSubmitFlag);

    const flag =
      pageReadOnlyFlag ||
      // taxFlag ||
      !priceTypeFlag ||
      displayBiddingSupHeaderStatus !== 'IN_PROGRESS' ||
      getBiddingRemainingCountFieldValue({ record }) === 0 ||
      supplementaryFlag;

    return flag;
  };

  return {
    autoQuery: false,
    primaryKey: 'rfxLineItemId',
    // cacheSelection: false,
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息'),
        name: 'itemName',
        disabled: true,
      },
      {
        name: 'itemCode',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        name: 'specs',
        disabled: true,
      },
      {
        label: intl.get('ssrc.common.quantityAndUomCombine').d('数量-单位'),
        name: 'quantityAndName',
        // dynamicProps: {
        //   label({ dataSet }) {
        //     const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
        //     return getQuantityAndUomCombine(doubleUnitFlag);
        //   },
        // },
      },
      {
        name: 'uomName',
        disabled: true,
      },
      {
        name: 'rfxQuantity',
        disabled: true,
      },
      {
        name: 'secondaryQuantity',
        disabled: true,
      },
      {
        name: 'secondaryUomName',
        disabled: true,
      },
      {
        name: 'validQuotationSecPrice',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        type: 'number',
        disabled: true,
      },
      {
        name: 'currentQuotationSecPrice',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        type: 'number',
        min: 0,
        dynamicProps: {
          required({ dataSet, record }) {
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const {
              benchmarkPriceType,
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag, // 补充单价已提交
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'benchmarkPriceType',
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const supplementaryFlag =
              biddingSupplementPriceRunningFlag && !biddingSupplierPriceSubmitFlag;

            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' && !!supplementaryFlag);

            const totalPriceFlag =
              !pageReadOnlyFlag &&
              taxFlag &&
              priceTypeFlag &&
              displayBiddingSupHeaderStatus === 'IN_PROGRESS' &&
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            const flag = totalPriceFlag;

            return flag;
          },
          disabled({ dataSet, record }) {
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const {
              benchmarkPriceType,
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceNotStartFlag,
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'benchmarkPriceType',
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceNotStartFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');

            // 补充单价未开始或者已补充单价
            let supplementaryFlag = false;
            supplementaryFlag =
              biddingSupplementPriceNotStartFlag ||
              (biddingSupplementPriceRunningFlag && biddingSupplierPriceSubmitFlag);
            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              biddingSupplementPriceRunningFlag === 1;

            const flag =
              pageReadOnlyFlag ||
              !taxFlag ||
              !priceTypeFlag ||
              displayBiddingSupHeaderStatus !== 'IN_PROGRESS' ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              supplementaryFlag;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { defaultPrecision } = header || {};

            // let currentPrecision = null;
            // if (biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED') {
            //   currentPrecision = defaultPrecision;
            // }
            // // if (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED') {
            // //   currentPrecision = financialPrecision;
            // // }

            return defaultPrecision;
          },
        },
      },
      {
        name: 'validNetSecondaryPrice',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        type: 'number',
        disabled: true,
      },
      {
        name: 'netSecondaryPrice',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        type: 'number',
        min: 0,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const {
              benchmarkPriceType,
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceNotStartFlag,
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'benchmarkPriceType',
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceNotStartFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              biddingSupplementPriceRunningFlag === 1;

            // 补充单价未开始或者已补充单价
            const supplementaryFlag =
              biddingSupplementPriceNotStartFlag ||
              (biddingSupplementPriceRunningFlag && biddingSupplierPriceSubmitFlag);

            const flag =
              pageReadOnlyFlag ||
              taxFlag ||
              !priceTypeFlag ||
              displayBiddingSupHeaderStatus !== 'IN_PROGRESS' ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              supplementaryFlag;

            return flag;
          },
          required({ dataSet, record }) {
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const {
              benchmarkPriceType,
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'benchmarkPriceType',
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const supplementaryFlag =
              !!biddingSupplementPriceRunningFlag && !biddingSupplierPriceSubmitFlag;
            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' && !!supplementaryFlag);

            const totalPriceFlag =
              !pageReadOnlyFlag ||
              !taxFlag ||
              priceTypeFlag ||
              displayBiddingSupHeaderStatus === 'IN_PROGRESS' ||
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            const flag = totalPriceFlag;

            return flag;
          },
          precision({ dataSet }) {
            const header = dataSet.getState('header');
            const { defaultPrecision } = header || {};

            // let currentPrecision = null;
            // if (biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED') {
            //   currentPrecision = defaultPrecision;
            // }
            // if (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED') {
            //   currentPrecision = financialPrecision;
            // }

            return defaultPrecision;
          },
        },
      },
      {
        name: 'netAmount',
        label: intl.get('ssrc.common.validNetAmountValue').d('有效行金额(不含税)'),
        type: 'number',
        disabled: true,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'currentLnNetAmount',
        type: 'number',
        disabled: true,
      },
      {
        name: 'totalAmount',
        label: intl.get('ssrc.common.validAmountValue').d('有效行金额(含税)'),
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('行金额(含税)'),
        name: 'currentLnTotalAmount',
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const {
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceNotStartFlag,
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceNotStartFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              biddingSupplementPriceRunningFlag === 1;

            // 补充单价未开始或者已补充单价
            const supplementaryFlag =
              biddingSupplementPriceNotStartFlag ||
              (biddingSupplementPriceRunningFlag && biddingSupplierPriceSubmitFlag);

            const flag =
              pageReadOnlyFlag ||
              !priceTypeFlag ||
              displayBiddingSupHeaderStatus !== 'IN_PROGRESS' ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              supplementaryFlag;

            return flag;
          },
          required({ dataSet, record }) {
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const {
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const supplementaryFlag =
              !!biddingSupplementPriceRunningFlag && !biddingSupplierPriceSubmitFlag;
            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' && !!supplementaryFlag);
            const totalPriceFlag =
              !pageReadOnlyFlag &&
              priceTypeFlag &&
              displayBiddingSupHeaderStatus === 'IN_PROGRESS' &&
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            const flag = totalPriceFlag;

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
          disabled({ dataSet, record }) {
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const {
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceNotStartFlag,
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceNotStartFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              biddingSupplementPriceRunningFlag === 1;

            // 补充单价未开始或者已补充单价
            const supplementaryFlag =
              biddingSupplementPriceNotStartFlag ||
              (biddingSupplementPriceRunningFlag && biddingSupplierPriceSubmitFlag);

            const flag =
              pageReadOnlyFlag ||
              !priceTypeFlag ||
              displayBiddingSupHeaderStatus !== 'IN_PROGRESS' ||
              getBiddingRemainingCountFieldValue({ record }) === 0 ||
              supplementaryFlag;

            return flag || taxIncludedFlag === 0;
          },
          required({ dataSet, record }) {
            const header = dataSet.getState('header');
            const { biddingTotalPricePrinciple } = header || {};
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);
            const headerFormRecord = dataSet.getState('headerFormRecord');
            const {
              displayBiddingSupHeaderStatus,
              biddingSupplierPriceSubmitFlag,
              biddingSupplementPriceRunningFlag,
            } = headerFormRecord
              ? headerFormRecord.get([
                  'displayBiddingSupHeaderStatus',
                  'biddingSupplierPriceSubmitFlag',
                  'biddingSupplementPriceRunningFlag',
                ])
              : {};
            const pageReadOnlyFlag = dataSet.getState('pageReadOnlyFlag');
            const supplementaryFlag =
              !!biddingSupplementPriceRunningFlag && !biddingSupplierPriceSubmitFlag;
            const priceTypeFlag =
              biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
              (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' && !!supplementaryFlag);
            const totalPriceFlag =
              !pageReadOnlyFlag &&
              priceTypeFlag &&
              displayBiddingSupHeaderStatus === 'IN_PROGRESS' &&
              getBiddingRemainingCountFieldValue({ record }) !== 0;

            const flag = totalPriceFlag;

            return flag && taxIncludedFlag === 1;
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
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        help: intl
          .get('ssrc.supplierQuotation.model.supQuo.priceQuantityExplainHelp')
          .d(
            '一个单位包含多少个货品;例如以"袋"为单位的螺丝里,一袋有20个螺丝,价格批量即为20,用以价格库等地方计算"每一单价"，即"单价"除以"价格批量"'
          ),
        name: 'priceBatchQuantity',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量'),
        name: 'currentQuotationSecQuantity',
        type: 'number',
        min: '0',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const flag = totalPriceLineCommonDisabled({ dataSet, record });

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
          disabled({ dataSet, record }) {
            const flag = totalPriceLineCommonDisabled({ dataSet, record });

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
          disabled({ dataSet, record }) {
            const flag = totalPriceLineCommonDisabled({ dataSet, record });

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
    ],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, advanced = {}, ...others } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/sup/line/cur/total-price/page`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...advanced, ...others },
        };
      },
      update: ({ data, params = {} }) => {
        const { commonProps = {}, advanced = {}, ...others } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/sup/header/cur/save`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...advanced, ...others },
        };
      },
    },
  };
};

export { quotationLineDataSet, quotationItemDataSet, totalPriceTableDataSet };
