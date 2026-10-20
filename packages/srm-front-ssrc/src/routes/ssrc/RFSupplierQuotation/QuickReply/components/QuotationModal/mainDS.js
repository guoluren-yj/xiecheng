import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { QRQuotationHeaderCodes, QRQuotationHistoryCode } from '../../store/enum';

const amountCalculate = ({ record }) => {
  const isTaxFlag = record.get('targetPriceType') === 'TAX_INCLUDED_PRICE';
  const defaultPrecision = record.getState('currency_precision');
  const caclRule = record.getState('caclRule');
  const { taxRate, quotationSecPrice, netSecondaryPrice, taxRateType } = record.get([
    'taxRate',
    'quotationSecPrice',
    'netSecondaryPrice',
    'taxRateType',
  ]);
  const COMMONS = {
    taxRate,
    caclRule,
    hasMount: false,
    hasTax: isTaxFlag,
    defaultPrecision,
    stageRule: 'noQuantity', // 数量不存在，修改计算场景
    taxRateType,
  };
  if (isTaxFlag) {
    COMMONS.taxUnitPrice = quotationSecPrice;
  }
  if (!isTaxFlag) {
    COMMONS.netUnitPrice = netSecondaryPrice;
  }
  // 无需换算数量，双单位场景待公共方法实现，暂不处理
  const { calcNetUnitPrice, calcTaxUnitPrice } = amountCalculation(COMMONS) || {};
  if (isTaxFlag) {
    record.set({ netSecondaryPrice: calcNetUnitPrice });
    // if(doubleUnitFlag) {
    //   record.set({
    //     quotationPrice: quotationSecPrice,
    //     netPrice: calcNetUnitPrice,
    //    });
    // };
  } else {
    record.set({ quotationSecPrice: calcTaxUnitPrice });
    // if(doubleUnitFlag) {
    //   record.set({
    //     quotationPrice: calcTaxUnitPrice,
    //     netPrice: netSecondaryPrice,
    //    });
    // };
  }
};

//  报价表单
export const quotationFormDS = ({ rfqQuotationId, doubleUnitFlag }) => {
  return {
    autoQuery: true,
    paging: false,
    fields: [
      {
        name: 'quotationSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationSecPrice')
          .d('单价(含税)'),
        min: 0,
        dynamicProps: {
          required: ({ record }) => record.get('targetPriceType') === 'TAX_INCLUDED_PRICE',
          disabled: ({ record }) => record.get('targetPriceType') !== 'TAX_INCLUDED_PRICE',
        },
      },
      {
        name: 'quotationPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationPrice')
          .d('基本单价(含税)'),
        // required: true,
        disabled: true,
        min: 0,
      },
      {
        name: 'netSecondaryPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netSecondaryPrice')
          .d('单价(不含税)'),
        min: 0,
        dynamicProps: {
          required: ({ record }) => record.get('targetPriceType') !== 'TAX_INCLUDED_PRICE',
          disabled: ({ record }) => record.get('targetPriceType') === 'TAX_INCLUDED_PRICE',
        },
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netPrice')
          .d('基本单价(不含税)'),
        // required: true,
        disabled: true,
        min: 0,
      },
      {
        name: 'currencyCode',
        type: 'object',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationCurrencyName')
          .d('币种'),
        lovCode: 'SMDM.CURRENCY',
        textField: 'currencyCode',
        valueField: 'currencyCode',
        required: true,
        transformRequest: (value = {}) => {
          return value?.currencyCode || null;
        },
        transformResponse: (value) => {
          return value
            ? {
                currencyCode: value,
              }
            : null;
        },
      },
      {
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.taxIdLov').d('税率(%)'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value = {}) => {
          return value?.taxId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                taxId: value,
                taxRate: data?.taxRate,
                taxCode: data?.taxCode,
              }
            : null;
        },
      },
      {
        name: 'taxRate',
        bind: 'taxId.taxRate',
      },
      {
        name: 'ladderQuotationLink',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderQuotation')
          .d('阶梯报价'),
      },
      {
        name: 'date',
        type: 'date',
        range: ['from', 'to'],
        label: intl
          .get(`ssrc.quickInquiry.quickReply.model.quickInquiry.quotationEffectTime`)
          .d('报价有效期'),
      },
      {
        name: 'quotationExpiryDateFrom',
        type: 'date',
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
        bind: 'date.from',
      },
      {
        name: 'quotationExpiryDateTo',
        type: 'date',
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
        bind: 'date.to',
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.attachmentUuid').d('附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        ...(ChunkUploadProps || {}),
      },
    ],
    events: {
      update: ({ name, record }) => {
        const isTaxFlag = record.get('targetPriceType') === 'TAX_INCLUDED_PRICE';
        if (name === 'taxId') {
          amountCalculate({ name, record, doubleUnitFlag });
        }
        if (name === 'quotationSecPrice' && isTaxFlag) {
          amountCalculate({ name, record, doubleUnitFlag });
        }
        if (name === 'netSecondaryPrice' && !isTaxFlag) {
          amountCalculate({ name, record, doubleUnitFlag });
        }
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const newRfqQuotationId = dataSet.getState('rfqQuotationId');

        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/view/base`,
          method: 'POST',
          data: { rfqQuotationId: newRfqQuotationId || rfqQuotationId },
          params: { customizeUnitCode: QRQuotationHeaderCodes?.EDIT },
        };
      },
      submit: ({ data, dataSet }) => {
        const submitType = dataSet.getState('submitType');
        const submitOperation = dataSet.getState('submitOperation');
        const { filterCode = '', filterParams } = dataSet.getState('searchBarParams') || {};
        const url = submitType === 'validate' ? 'submit-validate' : 'submit';
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/${url}`,
          method: 'POST',
          data: { operate: submitOperation, quickRfqQuotationCur: data[0] },
          params: {
            customizeUnitCode: [QRQuotationHeaderCodes?.EDIT, filterCode].join(','),
            ...(filterParams || {}),
          },
        };
      },
    },
    feedback: {
      // 成功后回调 阻止弹出操作成功提示 手动控制操作成功提示
      submitSuccess: () => {},
    },
  };
};

// 报价历史列表DS
export const quotationHistoryLineDS = ({ rfqQuotationId }) => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'roundNumber',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.roundNumber')
          .d('报价轮次'),
      },
      {
        name: 'quotationSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationSecPrice')
          .d('单价(含税)'),
      },
      {
        name: 'quotationPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationPrice')
          .d('基本单价(含税)'),
      },
      {
        name: 'localQuotationSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.localQuotationSecPrice')
          .d('本币单价(含税)'),
      },
      {
        name: 'localQuotationPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.localQuotationPrice')
          .d('本币基本单价(含税)'),
      },
      {
        name: 'netSecondaryPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netSecondaryPrice')
          .d('单价(不含税)'),
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netPrice')
          .d('基本单价(不含税)'),
      },
      {
        name: 'localNetSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.localNetSecPrice')
          .d('本币单价(不含税)'),
      },
      {
        name: 'localNetPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.localNetPrice')
          .d('本币基本单价(不含税)'),
      },
      {
        name: 'exchangeRate',
        type: 'number',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.exchangeRate').d('汇率'),
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.taxIdLov').d('税率(%)'),
      },
      {
        name: 'ladderQuotationLink',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderQuotation')
          .d('阶梯报价'),
      },
      {
        name: 'quotationExpiryDateFrom',
        type: 'date',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationExpiryDateFrom')
          .d('报价有效期从'),
      },
      {
        name: 'quotationExpiryDateTo',
        type: 'date',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationExpiryDateTo')
          .d('报价有效期至'),
      },
      {
        name: 'quotedDate',
        type: 'date',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotedDate').d('报价时间'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.attachmentUuid').d('附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        ...(ChunkUploadProps || {}),
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const newRfqQuotationId = dataSet.getState('rfqQuotationId');
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/view/history`,
          method: 'POST',
          data: { rfqQuotationId: newRfqQuotationId || rfqQuotationId },
          params: { customizeUnitCode: QRQuotationHistoryCode },
        };
      },
    },
  };
};
