import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Prefix } from '@/utils/globalVariable';
import { getCurrentOrganizationId } from 'utils/utils';

const closeSourceProjectDS = (payload) => ({
  selection: false,
  autoCreate: true,
  dataToJSON: 'all',
  forceValidate: true,
  fields: [
    {
      name: 'closedComments',
      type: 'string',
      label: intl.get(`ssrc.projectSetup.view.message.close.reason`).d('关闭理由'),
      required: true,
    },
    {
      name: 'closedAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.inquiryHall.view.message.close.attachment`).d('关闭附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
    },
  ],
  transport: {
    submit: ({ data }) => {
      if (!payload?.sourceProjectId) return;
      return {
        url: `${Prefix}/${getCurrentOrganizationId()}/source-projects/close`,
        method: 'POST',
        data: { ...(data[0] || {}), sourceProjectId: payload?.sourceProjectId },
        params: {
          customizeUnitCode: 'SSRC.PROJECT_SETUP.NEW_LIST.CLOSE_SOURCE_PROJECT_FORM',
        },
      };
    },
  },
});

export { closeSourceProjectDS };
