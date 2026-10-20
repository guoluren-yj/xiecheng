import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

const closeRFXDS = (rfxHeaderId, afterClose) => ({
  selection: false,
  autoCreate: true,
  fields: [
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`ssrc.qualiExam.model.qualiExam.closeReason`).d('关闭理由'),
      required: true,
    },
    {
      name: 'closeAttachmentUuid',
      type: 'attachment',
      label: intl.get(`hzero.common.upload.text`).d('上传附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      ...(ChunkUploadProps || {}),
    },
  ],
  transport: {
    submit: ({ data }) => {
      const datas = {
        terminatedRemark: data[0].remark,
        closeAttachmentUuid: data[0].closeAttachmentUuid ?? '',
        rfxHeaderIds: [rfxHeaderId],
      };
      return {
        url: `${Prefix}/${getCurrentOrganizationId()}/rfx/close`,
        method: 'POST',
        data: datas,
        transformResponse: (res) => {
          if (!res) {
            afterClose();
          } else {
            const result = JSON.parse(res);
            const { failed, message } = result;
            if (failed) {
              throw new Error(message);
            }
          }
        },
      };
    },
  },
});

export { closeRFXDS };
