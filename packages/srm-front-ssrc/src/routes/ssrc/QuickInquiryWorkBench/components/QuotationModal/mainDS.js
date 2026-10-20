import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
//  报价表单
export const quotationFormDS = ({ rfqQuotationId }) => {
  return {
    autoQuery: true,
    fields: [
      // 用于获取状态的tag值
      {
        name: 'quotationStatus',
        type: 'string',
        lookupCode: 'SSRC_QUICK_RFQ_QUOTATION_STATUS_SUPPLIER',
      },
      /** 供应商信息 */
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.supplierCompanyNum')
          .d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.supplierCompanyName')
          .d('供应商名称'),
      },
      {
        name: 'contactName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.contactName')
          .d('联系人姓名'),
      },
      {
        name: 'contactMobilephone',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.contactMobilephone')
          .d('联系方式'),
      },
      {
        name: 'contactMail',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.contactMail').d('邮箱'),
      },
      /** 报价信息 */
      {
        name: 'localQuotationSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationSecPrice')
          .d('单价(含税)'),
      },
      {
        name: 'localQuotationPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationPrice')
          .d('基本单价(含税)'),
      },
      {
        name: 'localNetSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netSecondaryPrice')
          .d('单价(不含税)'),
      },
      {
        name: 'localNetPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netPrice')
          .d('基本单价(不含税)'),
      },
      {
        name: 'quotationSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.originQuotationSecPrice')
          .d('原币单价(含税)'),
      },
      {
        name: 'quotationPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.originQuotationPrice')
          .d('基本原币单价(含税)'),
      },
      {
        name: 'netSecondaryPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.originNetSecondaryPrice')
          .d('原币单价(不含税)'),
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.originNetPrice')
          .d('基本原币单价(不含税)'),
      },
      {
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.originCurrencyCode')
          .d('原币币种'),
        name: 'currencyCode',
      },
      {
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.localCurrencyCode')
          .d('本币币种'),
        name: 'localCurrencyCode',
      },
      {
        name: 'exchangeRate',
        type: 'number',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.exchangeRate').d('汇率'),
      },
      {
        name: 'taxRate',
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
      },
    ],
    transport: {
      read: ({ dataSet, data = {} }) => {
        // 关联行-查看报价
        const newRfqQuotationId = dataSet.getState('rfqQuotationId');
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/purchase/quick-rfq-quotations/view/quotation`,
          method: 'POST',
          data: { rfqQuotationId: newRfqQuotationId || rfqQuotationId },
          params: {
            ...(data || {}),
            customizeUnitCode:
              'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.SUPPLIER_FORM,SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.QUOTE_FORM',
          },
        };
      },
    },
  };
};

// 关联报价列表DS
export const associateQuotationLineDS = ({ rfqItemId, rfqQuotationId }) => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'quotationStatusMeaning',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.statusMeaning').d('状态'),
      },

      {
        name: 'action',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.action').d('操作'),
      },
      {
        name: 'localQuotationSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationSecPrice')
          .d('单价(含税)'),
      },
      {
        name: 'localQuotationPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationPrice')
          .d('基本单价(含税)'),
      },
      {
        name: 'localNetSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netSecondaryPrice')
          .d('单价(不含税)'),
      },
      {
        name: 'localNetPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netPrice')
          .d('基本单价(不含税)'),
      },

      {
        name: 'currencyCode',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationCurrencyName')
          .d('币种'),
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.supplierCompanyNum')
          .d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.supplierCompanyName')
          .d('供应商名称'),
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
      // {
      //   name: 'ladderQuotationLink',
      //   type: 'string',
      //   label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderQuotation').d('阶梯报价'),
      // },
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
    ],
    transport: {
      read: ({ dataSet, data = {} }) => {
        const newRfqItemId = dataSet.getState('rfqItemId');
        const newRfqQuotationId = dataSet.getState('rfqQuotationId');
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/purchase/quick-rfq-quotations/view/item-quotation`,
          method: 'POST',
          data: {
            rfqItemId: newRfqItemId || rfqItemId,
            rfqQuotationId: newRfqQuotationId || rfqQuotationId,
          },
          params: {
            ...(data || {}),
            customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.QUOTE_LINES',
          },
        };
      },
    },
  };
};
