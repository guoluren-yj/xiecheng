import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

// 询价DS 全局规则 - 附件要求
const fileTemplateAttachmentDS = ({ customizeUnitCode = '' } = {}) => ({
  autoQuery: false,
  dataToJSON: 'all',
  selection: false,
  fields: [
    {
      name: 'attachmentTypeMeaning',
      label: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
    },
    {
      name: 'tempAttachmentUuid',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachmentTemplate`)
        .d('模板附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
    },
    {
      name: 'remark',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.describeTemplate`)
        .d('模板描述'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.attachment`).d('附件'),
      type: 'attachment',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { sourceId } = {} } = dataSet;
      if (!sourceId || sourceId === 'null') return;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/list`,
        method: 'POST',
        params: { customizeUnitCode },
        data: {
          sourceCategory: 'RFX',
          sourceId,
        },
      };
    },
  },
});

export { fileTemplateAttachmentDS };
