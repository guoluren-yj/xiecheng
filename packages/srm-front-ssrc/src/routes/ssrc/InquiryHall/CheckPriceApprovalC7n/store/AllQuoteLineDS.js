import React from 'react';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';

import { INQUIRY, getQuotationName } from '@/utils/globalVariable';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getAllottedQuantity,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';

const organizationId = getCurrentOrganizationId();
const quoteLineDS = ({ sourceKey = INQUIRY }) => {
  return {
    primaryKey: 'quotationLineId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.strategy`).d('选择策略'),
        name: 'selectionStrategyMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        name: 'suggestedFlag',
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
        dynamicProps: {
          label({ dataSet }) {
            return getUomName(dataSet.getState('doubleUnitFlag'));
          },
        },
        name: 'uomName',
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
        type: 'number',
        name: 'validQuotationSecPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
        type: 'number',
        name: 'weightPrice',
      },
      {
        label: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        type: 'number',
        name: 'validNetSecondaryPrice',
      },
      {
        dynamicProps: {
          label({ dataSet }) {
            return getPriceName(dataSet.getState('doubleUnitFlag'));
          },
        },
        name: 'validQuotationPrice',
      },
      {
        dynamicProps: {
          label({ dataSet }) {
            return getNetPriceName(dataSet.getState('doubleUnitFlag'));
          },
        },
        name: 'validNetPrice',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        type: 'number',
        name: 'perNetPrice',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        type: 'number',
        name: 'perTaxIncludedPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        type: 'number',
        name: 'referencePrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        type: 'number',
        name: 'differentPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
          .d('本币含税单价'),
        name: 'baseQuotationPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`)
          .d('本币单价(不含税)'),
        name: 'baseNetPrice',
        type: 'number',
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
        type: 'number',
      },
      {
        name: 'allottedQuantity',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            return getAllottedQuantity(dataSet.getState('doubleUnitFlag'));
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        name: 'allottedRatio',
        type: 'number',
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
        name: 'candidateSuggestion',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
      },
      {
        name: 'stageDescription',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        name: 'suggestedRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        name: 'preQuotationPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
        // type: 'number',
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
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
        type: 'number',
      },
      {
        name: 'rfxQuantity',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            return getQtyName(dataSet.getState('doubleUnitFlag'));
          },
        },
      },
      {
        name: 'validQuotationQuantity',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            return getAvailableQtyName(dataSet.getState('doubleUnitFlag'));
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        name: 'totalPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'netAmount',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`).d('预估单价(含税)'),
        name: 'estimatedPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
          .d('预估单价(不含税)'),
        name: 'netEstimatedPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
        name: 'estimatedAmount',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        name: 'netEstimatedAmount',
        type: 'number',
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
        readOnly: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        viewMode: 'popup',
      },
      {
        label: intl.get('ssrc.common.productionPlace').d('产地'),
        name: 'origin',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        name: 'validExpiryDateFrom',
        format: getDateFormat(),
        type: 'date',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        name: 'validExpiryDateTo',
        format: getDateFormat(),
        type: 'date',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.promDeliveryDate').d('承诺交货日期'),
        name: 'validPromisedDate',
        format: getDateFormat(),
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
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        name: 'minPurchaseQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        name: 'minPackageQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        name: 'freightIncludedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        name: 'freightAmount',
        type: 'number',
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
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        name: 'minPrice',
        type: 'number',
      },
      {
        name: 'comparePriceHistory',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
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
    ],
    transport: {
      read: ({ dataSet: { queryParameter } }) => {
        const { queryData = {} } = queryParameter || {};
        const url = `${SRM_SSRC}/v1/${organizationId}/rfx/check`;
        return {
          url,
          method: 'GET',
          data: {
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`,
            ...queryData,
          },
        };
      },
    },
  };
};

/**
 * 阶梯报价DS
 * @returns Json
 */
const ladderQuotationTableDS = () => ({
  primaryKey: 'rfxLadderLineNum',
  selection: false,
  paging: false,

  fields: [
    {
      name: 'rfxLadderLineNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
    },
    {
      name: 'ladderTo',
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
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
      name: 'validLadderPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
      name: 'validNetPrice',
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

export { quoteLineDS, ladderQuotationTableDS };
