import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

const formDS = (options = {}) => {
  const { organizationId } = options || {};

  return {
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        name: 'rfxTitle',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`).d('询价单标题'),
        dynamicProps: {
          required({ dataSet }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }
            return true;
          },
        },
      },
      {
        name: 'companyId',
        required: true,
        label: intl.get('ssrc.common.company').d('公司'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        transformRequest: (value = {}) => {
          return value?.companyId || null;
        },
        transformResponse: (value) => (value ? { companyId: value } : null),
        dynamicProps: {
          lovPara({ record }) {
            const bidRuleType = record.get('bidRuleType');
            return {
              enabledFlag: 1,
              // expertCategory: type,
              scoreMode: bidRuleType,
              templatePurpose: 'EXPERT_SCORE',
            };
          },
        },
      },
      {
        name: 'companyName',
        bind: 'companyId.companyName',
      },
      {
        name: 'purOrganizationId',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.PURORG',
        textField: 'organizationName',
        valueField: 'purchaseOrgId',
        transformRequest: (value = {}) => {
          return value?.purOrganizationId || value?.purchaseOrgId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                purOrganizationId: value,
                organizationName: data?.purOrganizationName,
                purchaseOrgId: value,
              }
            : null;
        },
      },
      {
        name: 'purchaserId',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        transformRequest: (value = {}) => {
          return value?.purchaserId || value?.purchaseAgentId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                purchaserId: value,
                purchaseAgentName: data?.purchaserName,
                purchaseAgentId: value,
              }
            : null;
        },
        lovPara: {
          organizationId,
        },
      },
      {
        name: 'sourceCategory',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        type: 'string',
        lookupCode: 'SSRC.SECONDARY_SOURCE_CAT',
        disabled: true,
      },
      {
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`).d('适用其他组织'),
        name: 'applicationScopeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'totalPrice',
        label: intl.get('ssrc.inquiryHall.model.whole.distributeTotalPrice').d('分配总金额'),
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyCode',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyCode',
        valueField: 'currencyCode',
        transformRequest: (value = {}) => {
          return value?.currencyCode || null;
        },
        transformResponse: (value) => (value ? { currencyCode: value } : null),
        dynamicProps: {
          required() {
            // const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            // if (skipValidateFlag) {
            //   return false;
            // }
            return true;
          },
        },
      },
      {
        name: 'currencyName',
        bind: 'currencyCode.currencyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`).d('允许多币种报价'),
        name: 'multiCurrencyFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get('ssrc.common.model.common.allowChangePayWayTextReadFlag')
          .d('允许供应商修改付款条款&方式'),
        name: 'paymentTermFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
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
          return value?.termId || value?.paymentTermId || null;
        },
        transformResponse: (value) => (value ? { paymentTermId: value, termId: value } : null),
        lovPara: {
          enabledFlag: 1,
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
          return value?.typeId || value?.paymentTypeId || null;
        },
        transformResponse: (value) => (value ? { paymentTypeId: value, typeId: value } : null),
        lovPara: {
          sourceFrom: 'RFX',
          organizationId,
        },
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentTypeId.typeName',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'checkRemark',
        type: 'string',
      },
      {
        name: 'checkAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.common.model.common.uploadAttachment`).d('上传附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        ...(ChunkUploadProps || {}),
        // dynamicProps: {
        //   required({ dataSet }) {
        //     const skipValidateFlag = dataSet?.getState('skipValidateFlag');
        //     if (skipValidateFlag) {
        //       return false;
        //     }
        //     return true;
        //   },
        // },
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'matchRestrictFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'taxChangeFlag',
      },
      {
        name: 'sourceProjectNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`).d('寻源项目编号'),
      },
    ],
  };
};

export { formDS };
