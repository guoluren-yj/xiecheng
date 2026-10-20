import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getAllottedQuantity,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { PRIVATE_BUCKET } from '_utils/config';

import { Prefix, getQuotationName } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const itemLineTableDS = ({ sourceKey, doubleUnitFlag }) => ({
  primaryKey: 'quotationLineId',
  forceValidate: true,
  fields: [
    {
      name: 'suggestedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record, dataSet }) => {
          const selectedPolicyValue = dataSet.getState('selectedPolicyValue');
          const {
            invalidFlag,
            summaryReviewResult,
            eliminateRoundNumber,
            supplierStatus,
            quotationLineStatus,
          } = record.get([
            'invalidFlag',
            'summaryReviewResult',
            'eliminateRoundNumber',
            'supplierStatus',
            'quotationLineStatus',
          ]);
          return (
            selectedPolicyValue !== 'RECOMMENDATION' ||
            Number(invalidFlag) ||
            summaryReviewResult === 'NO_APPROVED' ||
            eliminateRoundNumber ||
            supplierStatus === 'PROHIBIT_QUOTATION' || // 供应商状态-禁止报价 ps: 未补充单价,不用处理，会被过滤掉报价相关数据
            quotationLineStatus === 'ABANDONED'
          );
        },
      },
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
    },
    {
      name: 'companyName',
      label: intl.get('ssrc.common.supplierName').d('供应商名称'),
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
      name: 'taxIncludedFlag',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
    },
    {
      name: 'taxRate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
    },
    {
      name: 'quotationLineStatusMeaning',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
          quotationName: getQuotationName(sourceKey === 'NEW_BID'),
        })
        .d('{quotationName}状态'),
    },
    {
      name: 'quotationCurrencyCode',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`).d('报价币种'),
    },
    {
      name: 'exchangeRate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
    },
    {
      name: 'validQuotationSecPrice',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
    },
    {
      name: 'validNetSecondaryPrice',
      label: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
    },
    {
      name: 'validQuotationPrice',
      label: getPriceName(doubleUnitFlag),
    },
    {
      name: 'validNetPrice',
      label: getNetPriceName(doubleUnitFlag),
    },
    {
      name: 'perNetPrice',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
    },
    {
      name: 'perTaxIncludedPrice',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice').d('每一单价(含税)'),
    },
    {
      name: 'priceCoefficient',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
    },
    {
      name: 'weightPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
    },
    {
      name: 'differentPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
    },
    {
      name: 'baseQuotationPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`).d('本币含税单价'),
    },
    {
      name: 'baseNetPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`).d('本币单价(不含税)'),
    },
    {
      name: 'quotationDetailFlag',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
    },
    {
      name: 'newPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
    },
    {
      name: 'secondaryQuantity',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
    },
    {
      name: 'validQuotationSecQuantity',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
      name: 'secondaryUomName',
    },
    {
      name: 'rfxQuantity',
      label: getQtyName(doubleUnitFlag),
    },
    {
      name: 'validQuotationQuantity',
      label: getAvailableQtyName(doubleUnitFlag),
    },
    {
      label: getUomName(doubleUnitFlag),
      name: 'uomName',
    },
    {
      name: 'totalPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.theLinePrice`).d('行金额'),
    },
    {
      name: 'netAmount',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
        .d('行金额(不含税)'),
    },
    {
      name: 'estimatedPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`).d('预估单价(含税)'),
    },
    {
      name: 'netEstimatedPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`).d('预估单价(不含税)'),
    },
    {
      name: 'estimatedAmount',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
    },
    {
      name: 'netEstimatedAmount',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
        .d('预估行金额(不含税)'),
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
    },
    {
      name: 'allottedSecondaryQuantity',
      type: 'number',
      dynamicProps: {
        required({ record, dataSet }) {
          return (
            doubleUnitFlag &&
            dataSet.getState('checkWay') === 'quantity' &&
            record.get('suggestedFlag')
          );
        },
        disabled({ record }) {
          return !record.get('suggestedFlag');
        },
      },
      max: '99999999999999999999',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
    },
    {
      name: 'allottedQuantity',
      type: 'number',
      max: '99999999999999999999',
      label: getAllottedQuantity(doubleUnitFlag),
      dynamicProps: {
        required({ record, dataSet }) {
          return (
            !doubleUnitFlag &&
            dataSet.getState('checkWay') === 'quantity' &&
            record.get('suggestedFlag')
          );
        },
        disabled({ record }) {
          return doubleUnitFlag || !record.get('suggestedFlag');
        },
      },
    },
    {
      name: 'allottedRatio',
      dynamicProps: {
        required({ record, dataSet }) {
          return dataSet.getState('checkWay') === 'ratio' && record.get('suggestedFlag');
        },
        disabled({ record }) {
          return !record.get('suggestedFlag');
        },
      },
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
    },
    {
      name: 'suggestedRemark',
      maxLength: 500,
      dynamicProps: {
        required({ record }) {
          return record.get('suggestedFlag');
        },
        disabled({ record }) {
          return !record.get('suggestedFlag');
        },
      },
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedRemark`).d('选用理由'),
    },
    {
      name: 'ladderInquiryFlag',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
    },
    {
      name: 'preQuotationPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.preQuotationPrice`).d('上次报价'),
    },
    {
      name: 'priceFluctuation',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceFluctuation`).d('价格浮动'),
    },
    {
      name: 'initialFluctuation',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
    },
    {
      name: 'priceCompareToFirst',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCompareToFirst`).d('与首次报价差额'),
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
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingRatio`).d('节支率(供应商)'),
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
      name: 'validQuotationRemark',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
          quotationName: getQuotationName(sourceKey === 'NEW_BID'),
        })
        .d('{quotationName}说明'),
    },
    {
      name: 'origin',
      label: intl.get('ssrc.common.productionPlace').d('产地'),
    },
    {
      name: 'paymentTypeName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
    },
    {
      name: 'paymentTermName',
      label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
    },
    {
      name: 'validExpiryDateFrom',
      type: 'date',
      format: getDateFormat(),
      disabled: true,
      max: 'validExpiryDateTo',
      transformRequest: (value) => value && moment(value, DEFAULT_DATETIME_FORMAT),
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
    },
    {
      name: 'validExpiryDateTo',
      type: 'date',
      format: getDateFormat(),
      disabled: true,
      min: 'validExpiryDateFrom',
      transformRequest: (value) => value && moment(value, DEFAULT_DATETIME_FORMAT),
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
    },
    {
      name: 'validPromisedDate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
    },
    {
      name: 'validDeliveryCycle',
      disabled: true,
      type: 'number',
      label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
    },
    {
      name: 'minPurchaseQuantity',
      type: 'number',
      max: '99999999999999999999',
      disabled: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
    },
    {
      name: 'minPackageQuantity',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
      disabled: true,
      type: 'number',
      min: '0',
      max: '99999999999999999999',
    },
    {
      name: 'freightIncludedFlag',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
    },
    {
      name: 'freightAmount',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
    },
    {
      name: 'quotedDate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
      type: 'dateTime',
    },
    {
      name: 'costPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.costPrice`).d('成本单价'),
    },
    {
      name: 'freightAmount',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
    },
    {
      name: 'attachmentUuid',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationline',
      viewMode: 'popup',
      type: 'attachment',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
        .d('供应商行附件'),
    },
    {
      name: 'comparePriceHistory',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
      name: 'minPrice',
    },
  ],
  transport: {
    read: ({ dataSet: { queryParameter } }) => {
      const { queryData } = queryParameter || {};
      return {
        url: `${Prefix}/${organizationId}/rfx/check`,
        method: 'GET',
        data: {
          ...queryData,
          checkRemotePriceFlag: 0,
        },
      };
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((record) => {
        const {
          priceBatchQuantity,
          batchPrice,
          eliminateRoundNumber,
          supplierStatus,
          invalidFlag,
          summaryReviewResult,
        } = record.get([
          'priceBatchQuantity',
          'batchPrice',
          'eliminateRoundNumber',
          'supplierStatus', // 供应商状态-禁止报价 ps: 未补充单价,不用处理，会被过滤掉报价相关数据
          'invalidFlag',
          'summaryReviewResult',
        ]);
        if (!(priceBatchQuantity || priceBatchQuantity === 0)) {
          record.set('priceBatchQuantity', batchPrice ?? 1);
        }

        if (dataSet.getState('selectedPolicyValue') !== 'RECOMMENDATION') {
          record.set('suggestedFlag', 0);
          record.set('allottedQuantity', '');
          record.set('allottedSecondaryQuantity', '');
          record.set('allottedRatio', '');
          record.set('suggestedRemark', '');
        }

        const invalidStatus = Number(invalidFlag) || summaryReviewResult === 'NO_APPROVED'; // 供应商【置为无效】 或 【符合性检查不通过】
        const selectable =
          !eliminateRoundNumber && supplierStatus !== 'PROHIBIT_QUOTATION' && !invalidStatus;
        Object.assign(record, {
          selectable,
        });
      });
    },
  },
});

export { itemLineTableDS };
