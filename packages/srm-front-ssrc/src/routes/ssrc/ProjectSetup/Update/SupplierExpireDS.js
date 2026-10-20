import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const SupplierBulkExpiredModalDS = () => {
  return {
    primaryKey: 'index',
    autoQuery: false,
    selection: 'multiple',
    dataToJSON: 'selected',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentName`).d('附件名称'),
        name: 'attachmentDesc',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentsName`).d('文件到期日'),
        name: 'expirationDate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件'),
        name: 'supplierAttachmentUuid',
        type: 'attachment',
        readOnly: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
      },
    ],
  };
};

export { SupplierBulkExpiredModalDS };
