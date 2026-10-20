import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

const formDS = () => ({
  selection: false,
  autoCreate: true,
  fields: [
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.view.message.close.inquiryListReason`).d('关闭理由'),
      required: true,
    },
    {
      name: 'closeAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.inquiryHall.view.message.close.attachment`).d('关闭附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      ...(ChunkUploadProps || {}),
    },
  ],
});

export { formDS };
