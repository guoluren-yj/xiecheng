import intl from 'utils/intl';

const attachmentDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'businessAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
    },
    {
      name: 'techAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
    },
  ],
});

export { attachmentDS };
