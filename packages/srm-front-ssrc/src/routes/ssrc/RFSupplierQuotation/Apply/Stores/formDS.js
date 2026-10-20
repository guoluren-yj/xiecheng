import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const formDS = (options = {}) => {
  const { quotationName } = options;

  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户'),
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.companyNameAttachmentBusTec`)
          .d('客户商务/技术附件'),
        name: 'companyNameUuid',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'rfxRemark',
        // highlight: true,
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartsDate`, { quotationName })
          .d('{quotationName}开始时间'),
        name: 'quotationStartDate',
        showType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndDate`, { quotationName })
          .d('{quotationName}截止时间'),
        name: 'quotationEndDate',
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
        name: 'paymentTermName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.currency`).d('币种'),
        name: 'currencyCode',
      },
      {
        name: 'rfxTitle',
      },
      { name: 'rfxNum' },
      { name: 'sourceCategoryMeaning' },
      {
        name: 'prequalEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`).d('预审截止时间'),
        showType: 'dateTime',
      },
      {
        name: 'prequalRemark',
        label: intl.get(`ssrc.common.qualRequirements`).d('资质要求'),
        type: 'string',
        // highlight: true,
      },
      {
        name: 'prequalHeaderId',
        type: 'string',
      },
      {
        name: 'prequalAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalAttachment`).d('资格预审文件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-prequal',
      },
      {
        name: 'techAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
      {
        name: 'businessAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
    ],
  };
};

export { formDS };
