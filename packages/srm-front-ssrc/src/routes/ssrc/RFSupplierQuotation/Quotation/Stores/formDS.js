// import React from 'react';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

// import Style from '../index.less';

const formDS = (options = {}) => {
  const { quotationName } = options || {};

  const getAllPageDisabled = (ds) => {
    let flag = false;
    if (!ds) {
      return flag;
    }

    flag = ds.getState('allPageDisabled');
    return flag;
  };

  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户'),
        name: 'companyName',
        disabled: true,
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.companyNameAttachmentBusTec`)
          .d('客户商务/技术附件'),
        name: 'companyNameUuid',
        disabled: true,
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'rfxRemark',
        type: 'string',
        disabled: true,
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartsDate`, { quotationName })
          .d('{quotationName}开始时间'),
        name: 'quotationStartDate',
        disabled: true,
        showType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndDate`, { quotationName })
          .d('{quotationName}截止时间'),
        name: 'quotationEndDate',
        disabled: true,
        showType: 'dateTime',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)'),
        name: 'bidBond',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidFileExpense').d('招标文件费(元)'),
        name: 'bidFileExpense',
        type: 'number',
        defaultValue: 0,
      },
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
          disabled({ record, dataSet }) {
            const { supplierStatus, paymentTermFlag, systemVersion } = record.get([
              'supplierStatus',
              'paymentTermFlag',
              'systemVersion',
            ]);
            const allPageDisabled = getAllPageDisabled(dataSet);

            const wholeAbandonFlag =
              supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return wholeAbandonFlag || allPageDisabled;
            }
            return paymentTermFlag !== 1 || wholeAbandonFlag || allPageDisabled;
          },
          required({ record, dataSet }) {
            const { supplierStatus, paymentTermFlag, systemVersion } = record.get([
              'supplierStatus',
              'paymentTermFlag',
              'systemVersion',
            ]);
            const wholeAbandonFlag =
              supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
            const allPageDisabled = getAllPageDisabled(dataSet);
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return !wholeAbandonFlag && !allPageDisabled;
            }

            return paymentTermFlag === 1 && !wholeAbandonFlag && !allPageDisabled;
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
          disabled({ dataSet, record }) {
            const { supplierStatus, paymentTermFlag, systemVersion } = record.get([
              'supplierStatus',
              'paymentTermFlag',
              'systemVersion',
            ]);
            const allPageDisabled = getAllPageDisabled(dataSet);

            const wholeAbandonFlag =
              supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return wholeAbandonFlag || allPageDisabled;
            }
            return paymentTermFlag !== 1 || wholeAbandonFlag || allPageDisabled;
          },
          required({ dataSet, record }) {
            const { supplierStatus, paymentTermFlag, systemVersion } = record.get([
              'supplierStatus',
              'paymentTermFlag',
              'systemVersion',
            ]);
            const allPageDisabled = getAllPageDisabled(dataSet);

            const wholeAbandonFlag =
              supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return !wholeAbandonFlag && !allPageDisabled;
            }
            return paymentTermFlag === 1 && !wholeAbandonFlag && !allPageDisabled;
          },
        },
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentTypeId.typeName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyCode',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyName',
        valueField: 'currencyCode',
        transformRequest: (value = {}) => value && value?.currencyCode,
        transformResponse: (value) => ({ currencyCode: value }),
        dynamicProps: {
          disabled({ record, dataSet }) {
            const { supplierStatus, multiCurrencyFlag } = record.get([
              'supplierStatus',
              'multiCurrencyFlag',
            ]);
            const allPageDisabled = getAllPageDisabled(dataSet);
            const wholeAbandonFlag =
              supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
            return multiCurrencyFlag !== 1 || wholeAbandonFlag || allPageDisabled;
          },
          required({ record, dataSet }) {
            const { supplierStatus, multiCurrencyFlag } = record.get([
              'supplierStatus',
              'multiCurrencyFlag',
            ]);
            const allPageDisabled = getAllPageDisabled(dataSet);
            const wholeAbandonFlag =
              supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
            return multiCurrencyFlag === 1 && !wholeAbandonFlag && !allPageDisabled;
          },
        },
      },
      { name: 'rfxHeaderId' },
      {
        name: 'rfxTitle',
      },
      { name: 'rfxNum' },
      { name: 'sourceCategoryMeaning' },
      {
        name: 'businessAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        ...(ChunkUploadProps || {}),
        dynamicProps: {
          readOnly({ dataSet }) {
            const allPageDisabled = getAllPageDisabled(dataSet);
            const flag = allPageDisabled;
            return flag;
          },
        },
      },
      {
        name: 'techAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        ...(ChunkUploadProps || {}),
        dynamicProps: {
          readOnly({ dataSet }) {
            const allPageDisabled = getAllPageDisabled(dataSet);
            const flag = allPageDisabled;
            return flag;
          },
        },
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
    ],
  };
};

const tableSummaryFormDS = (options = {}) => {
  const { quotationName } = options || {};

  return {
    autoQuery: false,
    fields: [
      {
        // label: (
        //   <span className={Style['ssrc-quotation-summary-form-label']}>
        //     {intl
        //       .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationTotalCount`, {
        //         quotationName,
        //       })
        //       .d('{quotationName}行数')}
        //   </span>
        // ),
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationTotalCount`, {
            quotationName,
          })
          .d('{quotationName}行数'),
        name: 'currentQuotationTotalCount',
        disabled: true,
      },
      {
        // label: (
        //   <span className={Style['ssrc-quotation-summary-form-label']}>
        //     {intl
        //       .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationAmountTotalCount`, {
        //         quotationName,
        //       })
        //       .d('{quotationName}总金额')}
        //   </span>
        // ),
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationAmountTotalCount`, {
            quotationName,
          })
          .d('{quotationName}总金额'),
        name: 'currentTotalAmount',
        disabled: true,
      },
      {
        // label: (
        //   <span className={Style['ssrc-quotation-summary-form-label']}>
        //     {intl
        //       .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationedLineNumber`, {
        //         quotationName,
        //       })
        //       .d('已提交{quotationName}行数')}
        //   </span>
        // ),
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationedLineNumber`, {
            quotationName,
          })
          .d('已提交{quotationName}行数'),
        name: 'quotationLineNumber',
        disabled: true,
      },
      {
        // label: (
        //   <span className={Style['ssrc-quotation-summary-form-label']}>
        //     {intl
        //       .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationedTotalAmount`, {
        //         quotationName,
        //       })
        //       .d('已提交{quotationName}总金额')}
        //   </span>
        // ),
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationedTotalAmount`, {
            quotationName,
          })
          .d('已提交{quotationName}总金额'),
        name: 'quotationTotalAmount',
        disabled: true,
      },
    ],
  };
};

export { formDS, tableSummaryFormDS };
