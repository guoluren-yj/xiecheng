import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
// import { PRIVATE_BUCKET } from '_utils/config';

const supplierLineDS = (options = {}) => {
  const { rfxHeaderId, customizeUnitCode, organizationId } = options || {};

  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        name: 'companyId',
        type: 'string',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'supplierCategoryDescription',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        name: 'contactName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        name: 'contactMobilephone',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        name: 'contactMail',
        type: 'email',
      },
      // {
      //   label: intl.get(`ssrc.offlineResultEntry.model.offlineEntry.supAttachment`).d('供应商附件'),
      //   name: 'currentAttachmentUuid',
      //   type: 'attachment',
      //   bucketDirectory: '',
      //   bucketName: PRIVATE_BUCKET,
      //   disabled: true,
      // },
    ],
    transport: {
      read: ({ data }) => {
        if (!rfxHeaderId || rfxHeaderId === 'null') {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/suppliers`,
          method: 'GET',
          data: {
            tenantId: organizationId,
            organizationId,
            rfxHeaderId,
            customizeUnitCode,
            ...data,
          },
        };
      },
    },
  };
};

export { supplierLineDS };
