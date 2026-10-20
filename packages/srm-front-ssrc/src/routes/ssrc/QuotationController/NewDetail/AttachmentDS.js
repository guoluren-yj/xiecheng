import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const AttachmentDS = () => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
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
    transport: {
      submit: ({ dataSet }) => {
        const record = dataSet.current;
        const adjustRecordId = record?.get('adjustRecordId');
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/attachment/adjust/${adjustRecordId}/save`,
          method: 'POST',
          data: record.toData(),
        };
      },
    },
  };
};

export { AttachmentDS };
