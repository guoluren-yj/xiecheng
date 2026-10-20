import React from 'react';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

import intl from 'utils/intl';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getAllottedQuantity,
  getPriceName,
  getNetPriceName,
  getLadderFrom,
  getLadderTo,
} from '@/utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { INQUIRY, getQuotationName } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
const quoteLineDS = ({ rfxHeaderId, sourceKey = INQUIRY, handleAllQuoteQuery }) => {
  return {
    primaryKey: 'quotationLineId',
    dataToJSON: 'all',
    cacheSelection: true,
    cacheModified: true, // 缓存修改过的数据
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        name: 'suggestedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) =>
            Number(record.get('invalidFlag')) ||
            record.get('summaryReviewResult') === 'NO_APPROVED' ||
            record.get('eliminateRoundNumber') ||
            record.get('supplierStatus') === 'PROHIBIT_QUOTATION' || // 供应商状态-禁止报价 ps: 未补充单价,不用处理，会被过滤掉报价相关数据
            record.get('quotationLineStatus') === 'ABANDONED',
        },
      },
      {
        label: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        name: 'categoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => getUomName(dataSet.getState('doubleUnitFlag')),
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'companyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'companyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
        name: 'candidateSuggestion',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        name: 'stageDescription',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`).d('报价币种'),
        name: 'quotationCurrencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
        name: 'weightPrice',
      },
      {
        label: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
      },
      {
        name: 'validQuotationPrice',
        dynamicProps: {
          label: ({ dataSet }) => getPriceName(dataSet.getState('doubleUnitFlag')),
        },
      },
      {
        name: 'validNetPrice',
        dynamicProps: {
          label: ({ dataSet }) => getNetPriceName(dataSet.getState('doubleUnitFlag')),
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        name: 'perNetPrice',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        name: 'perTaxIncludedPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        name: 'referencePrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        name: 'differentPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
          .d('本币含税单价'),
        name: 'baseQuotationPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`)
          .d('本币单价(不含税)'),
        name: 'baseNetPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetailFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        name: 'priceBatchQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        name: 'allottedSecondaryQuantity',
        max: '99999999999999999999',
        type: 'number',
        dynamicProps: {
          required: ({ record, dataSet }) =>
            dataSet.getState('doubleUnitFlag') &&
            dataSet.getState('checkWay') === 'quantity' &&
            record.get('suggestedFlag'),
          disabled: ({ record }) => !record.get('suggestedFlag'),
        },
      },
      {
        name: 'allottedQuantity',
        max: '99999999999999999999',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => getAllottedQuantity(dataSet.getState('doubleUnitFlag')),
          required: ({ record, dataSet }) =>
            !dataSet.getState('doubleUnitFlag') &&
            dataSet.getState('checkWay') === 'quantity' &&
            record.get('suggestedFlag'),
          disabled: ({ record, dataSet }) =>
            dataSet.getState('doubleUnitFlag') || !record.get('suggestedFlag'),
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        name: 'allottedRatio',
        type: 'number',
        min: 0,
        dynamicProps: {
          required: ({ record, dataSet }) =>
            dataSet.getState('checkWay') === 'ratio' && record.get('suggestedFlag'),
          disabled: ({ record }) => !record.get('suggestedFlag'),
        },
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
          .d('{quotationName}状态'),
        name: 'quotationLineStatusMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        name: 'suggestedRemark',
        dynamicProps: {
          required: ({ record }) => record.get('suggestedFlag'),
          disabled: ({ record }) => !record.get('suggestedFlag'),
        },
        maxLength: 500,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        name: 'preQuotationPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
        name: 'initialFluctuation',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.priceCompareToFirst`)
          .d('与首次报价差额'),
        name: 'priceCompareToFirst',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
      },
      {
        name: 'rfxQuantity',
        dynamicProps: {
          label: ({ dataSet }) => getQtyName(dataSet.getState('doubleUnitFlag')),
        },
      },
      {
        name: 'validQuotationQuantity',
        dynamicProps: {
          label: ({ dataSet }) => getAvailableQtyName(dataSet.getState('doubleUnitFlag')),
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        name: 'totalPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'netAmount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`).d('预估单价(含税)'),
        name: 'estimatedPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
          .d('预估单价(不含税)'),
        name: 'netEstimatedPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
        name: 'estimatedAmount',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        name: 'netEstimatedAmount',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
          .d('{quotationName}说明'),
        name: 'validQuotationRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermName',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
      },
      {
        label: intl.get('ssrc.common.productionPlace').d('产地'),
        name: 'origin',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        name: 'validExpiryDateFrom',
        max: 'validExpiryDateTo',
        type: 'date',
        transformRequest: (value) => value && moment(value, DEFAULT_DATETIME_FORMAT),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        name: 'validExpiryDateTo',
        min: 'validExpiryDateFrom',
        type: 'date',
        transformRequest: (value) => value && moment(value, DEFAULT_DATETIME_FORMAT),
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.promDeliveryDate').d('承诺交货日期'),
        name: 'validPromisedDate',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'validDeliveryCycle',
        type: 'number',
        disabled: true,
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        name: 'minPurchaseQuantity',
        disabled: true,
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        name: 'minPackageQuantity',
        disabled: true,
        type: 'number',
        min: '0',
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        name: 'freightAmount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.changePercent`).d('涨跌幅(%)'),
        name: 'changePercent',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        name: 'minPrice',
      },
      {
        name: 'supplierSavingAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingAmount`)
          .d('节支金额(供应商)'),
      },
      {
        name: 'supplierSavingRatio',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingRatio`)
          .d('节支率(供应商)'),
      },
      {
        name: 'supplierMinMaxSuggestedRatio',
        dynamicProps: {
          label({ dataSet }) {
            return dataSet?.getState('auctionDirection') === 'FORWARD'
              ? intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.supplierMaxSuggestedRatio`)
                  .d('最高价中标率(供应商)')
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.supplierMinMaxSuggestedRatio`)
                  .d('最低价中标率(供应商)');
          },
        },
      },
      {
        name: 'itemSavingAmount',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingAmount`).d('节支金额(物料)'),
      },
      {
        name: 'itemSavingRatio',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingRatio`).d('节支率(物料)'),
      },
      {
        name: 'itemMinMaxSuggestedFlag',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.minMaxSuggestedFlag`)
          .d('是否最低价中标'),
      },
      {
        name: 'quotationLineSavingAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingAmount`)
          .d('节支金额'),
      },
      {
        name: 'quotationLineSavingRatio',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingRatio`).d('节支率'),
      },
      {
        name: 'itemSignPostPrice',
        type: 'number',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.itemSignPostPrice').d('标杆价'),
      },
      {
        name: 'comparePriceHistory',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          const {
            eliminateRoundNumber, // 淘汰
            invalidFlag, // 置为无效
            summaryReviewResult, // 符合性检查不通过
            supplierStatus, // 供应商状态-禁止报价 ps: 未补充单价,不用处理，会被过滤掉报价相关数据
          } = record.get([
            'eliminateRoundNumber',
            'supplierStatus',
            'invalidFlag',
            'summaryReviewResult',
          ]);
          // 禁止勾选【淘汰】【禁止报价】【置为无效】【符合性检查不通过】
          const disabledSelectable =
            eliminateRoundNumber ||
            supplierStatus === 'PROHIBIT_QUOTATION' ||
            Number(invalidFlag) === 1 ||
            summaryReviewResult === 'NO_APPROVED';
          if (disabledSelectable) {
            // eslint-disable-next-line no-param-reassign
            record.selectable = false;
          }
        });
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const url = `${SRM_SSRC}/v1/${organizationId}/rfx/check`;
        const rfxLineSupplierIds = dataSet.getQueryParameter('supplier') || '';
        const rfxLineItemIds = dataSet.getQueryParameter('item') || '';
        const commonProps = dataSet.getQueryParameter('commonProps') || {};
        return {
          url,
          method: 'GET',
          data: {
            rfxHeaderId,
            checkRemotePriceFlag: 0,
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`,
            rfxLineSupplierIds,
            rfxLineItemIds,
            ...commonProps,
          },
          transformResponse: (value) => {
            const res = JSON.parse(value);
            handleAllQuoteQuery(res);
            return res;
          },
        };
      },
      submit: ({ data, dataSet }) => {
        const url = `${SRM_SSRC}/v1/${organizationId}/rfx/save-check`;
        return {
          url,
          method: 'POST',
          body: {
            checkPriceDTOLineList: [
              {
                quotationLineList: data.map((item) => {
                  if (dataSet.getState('checkWay') === 'quantity') {
                    return { ...item, allottedRatio: null };
                  }
                  return { ...item, allottedSecondaryQuantity: null, allottedQuantity: null };
                }),
                type: 'DETAIL',
              },
            ],
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`,
          },
        };
      },
    },
  };
};

const strategyDS = () => {
  return {
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quickSelection`).d('快速选用'),
        name: 'selectedPolicyValue',
        lookupCode: 'SSRC.QUICK_CHOOSE_STRATEGY',
      },
    ],
  };
};

/**
 * 阶梯报价DS
 * @returns Json
 */
const ladderQuotationTableDS = (doubleUnitFlag) => ({
  primaryKey: 'rfxLadderLineNum',
  selection: false,
  paging: false,

  fields: [
    {
      name: 'rfxLadderLineNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      label: (
        <span>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
          {`(<)`}
        </span>
      ),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      label: (
        <span>
          {getLadderFrom(doubleUnitFlag)}
          {`(>=)`}
        </span>
      ),
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      label: (
        <span>
          {getLadderTo(doubleUnitFlag)}
          {`(<)`}
        </span>
      ),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
      name: 'validLadderSecPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
      name: 'validNetLadderSecPrice',
    },
    {
      label: getPriceName(doubleUnitFlag),
      name: 'validLadderPrice',
    },
    {
      label: getNetPriceName(doubleUnitFlag),
      name: 'validNetLadderPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.isCumulativeFlag`).d('是否累计阶梯'),
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
      name: 'validBargainPrice',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commonProps = {} },
      } = dataSet;
      const { quotationLineId, customizeUnitCode } = commonProps;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
        method: 'GET',
        data: {
          customizeUnitCode,
        },
      };
    },
  },
});

export { quoteLineDS, strategyDS, ladderQuotationTableDS };
