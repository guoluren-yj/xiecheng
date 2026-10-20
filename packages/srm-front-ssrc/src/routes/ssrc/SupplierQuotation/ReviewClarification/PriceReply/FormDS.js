import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const HeaderFormDS = ({ sourceKey }) => {
  return {
    fields: [
      {
        name: 'clarifyNotifyTitle',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.common.title`).d('标题'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.common.company').d('公司'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'sourceNum',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
      },
      {
        name: 'replyEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.responseEndDate`).d('回复截至时间'),
        type: 'dateTime',
        disabled: true,
        format: getDateTimeFormat(),
      },
      {
        name: 'replyRequirement',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarificationRequests`).d('澄清要求'),
      },
      {
        name: 'clarifyNotifyNum',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyIssueNum`).d('澄清通知编号'),
      },
      {
        name: 'clarifyNotifyStatusMeaning',
        type: 'string',
        disabled: true,
        label: intl.get('hzero.common.button.status').d('状态'),
      },
      {
        name: 'submittedByName',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitPeople`).d('提交人'),
      },
      {
        name: 'submittedDate',
        type: 'dateTime',
        disabled: true,
        format: getDateTimeFormat(),
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitDate`).d('提交时间'),
      },
      {
        name: 'paymentTypeLov',
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentType`).d('付款方式'),
        lovCode: 'SMDM.PAYMENTTYPE',
        ignore: 'always',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              paymentTypeId: 'paymentTypeId',
              tenantId: record?.get('tenantId'),
            };
          },
          disabled: ({ record }) => {
            const sourceTempalteSystemVersion = record.get('sourceTempalteSystemVersion');
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return false;
            }
            return !record?.get('paymentTermFlag');
          },
          required: ({ record }) => {
            const sourceTempalteSystemVersion = record.get('sourceTempalteSystemVersion');
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return false;
            }
            return record?.get('paymentTermFlag');
          },
        },
      },
      {
        name: 'paymentTypeId',
        bind: 'paymentTypeLov.typeId',
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentTypeLov.typeName',
      },
      {
        name: 'paymentTermLov',
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerm`).d('付款条款'),
        lovCode: 'SMDM.PAYMENT.TERM',
        ignore: 'always',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              enabledFlag: 1,
              tenantId: record?.get('tenantId'),
            };
          },
          disabled: ({ record }) => {
            const sourceTempalteSystemVersion = record.get('sourceTempalteSystemVersion');
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return false;
            }
            return !record?.get('paymentTermFlag');
          },
          required: ({ record }) => {
            const sourceTempalteSystemVersion = record.get('sourceTempalteSystemVersion');
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
              return false;
            }
            return record?.get('paymentTermFlag');
          },
        },
      },
      {
        name: 'paymentTermId',
        bind: 'paymentTermLov.termId',
      },
      {
        name: 'paymentTermName',
        bind: 'paymentTermLov.termName',
      },
      {
        name: 'currencyLov',
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
        ignore: 'always',
        textField: 'currencyCode',
        dynamicProps: {
          disabled: ({ record }) => {
            return !record?.get('multiCurrencyFlag');
          },
          required: ({ record }) => {
            return !!record?.get('multiCurrencyFlag');
          },
        },
      },
      {
        name: 'currencyCode',
        bind: 'currencyLov.currencyCode',
      },
      {
        name: 'objectVersionNumber',
      },
      {
        name: 'sourceFrom',
      },
      {
        name: 'organizationId',
      },
      {
        name: 'clarifyNotifyId',
      },
      { name: 'sourceHeaderId' },
      { name: 'clarifyNotifyType', defaultValue: 'PRICE' },
      {
        name: 'businessAttachmentUuid',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.businessAttachmentUuid').d('商务附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        type: 'attachment',
        ...(ChunkUploadProps || {}),
      },
      {
        name: 'techAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        ...(ChunkUploadProps || {}),
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, clarifyNotifyId, sourceFrom, quotationHeaderId = '' } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/${clarifyNotifyId}`,
          method: 'GET',
          data: {
            sourceFrom,
            quotationHeaderId,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT,SSRC.${sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT_ATTACHMENTS`,
          },
        };
      },
    },
  };
};

export { HeaderFormDS };
