import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const ReleasePrepareAttachmentDS = () => {
  return {
    fields: [
      {
        name: 'techAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        readOnly: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
        name: 'businessAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        readOnly: true,
      },
    ],
  };
};

export default ReleasePrepareAttachmentDS;
