import { getHeaderAttachmentUuid } from '@/services/deliveryCreationService';
import intl from 'utils/intl';

// 附件信息
const attachmentDataSet = (headerFormDs) => ({
  dataToJSON: 'all',
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'approveAttachmentUuid',
      type: 'attachment',
      label: intl.get(`sinv.common.view.purchaserAuditAttachment`).d('采购方审核附件'),
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get(`sinv.common.view.supplierAttachment`).d('供应商附件'),
    },
    {
      name: 'reviewAttachmentUuid',
      type: 'attachment',
      label: intl.get(`sinv.common.view.purchaserReviewAttachment`).d('采购方复核附件'),
    },
    {
      name: 'supplierAttaUuid',
      type: 'attachment',
      label: intl.get(`sinv.common.attachment.supplier.other`).d('供应商其他附件'),
    },
    {
      name: 'otherAttachmentUuid',
      type: 'attachment',
      label: intl.get(`sinv.common.view.otherAttachment`).d('采购方其他附件'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      const headerRecord = headerFormDs.current;
      if (name === 'supplierAttaUuid') {
        if (record.get('asnHeaderId')) {
          const data = {
            asnHeaderId: record.get('asnHeaderId'),
            objectVersionNumber: record.get('objectVersionNumber'),
            _token: record.get('_token'),
            otherAttachmentUuid: record.get('otherAttachmentUuid'),
            approveAttachmentUuid: record.get('approveAttachmentUuid'),
            supplierAttaUuid: value,
            reviewAttachmentUuid: record.get('reviewAttachmentUuid'),
          };
          getHeaderAttachmentUuid(data).then((res) => {
            if (res && !res.failed) {
              headerRecord.init({
                supplierAttaUuid: res.supplierAttaUuid,
                objectVersionNumber: res.objectVersionNumber,
              });
            }
          });
        }
      }
    },
  },
});

export default attachmentDataSet;
