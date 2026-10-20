import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { Prefix } from '@/utils/globalVariable';

const attachmentTableDS = () => {
  return {
    primaryKey: 'evaluateExpertId',
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'loginName',
        type: 'string',
        label: intl.get('ssrc.expert.model.expert.userId').d('招标编号'),
      },
      {
        name: 'expertName',
        type: 'string',
        label: intl.get('ssrc.bidHall.model.bidHall.expertName').d('专家名称'),
      },
      {
        name: 'reviewAttachmentUuid',
        type: 'attachment',
        label: intl.get('ssrc.common.model.common.attachment').d('附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        readOnly: true,
      },
      {
        name: 'reviewDate',
        label: intl.get('ssrc.common.model.common.creationDate').d('上传时间'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${Prefix}/${getCurrentOrganizationId()}/evaluate-scores/review/query/files`,
          method: 'POST',
          data,
        };
      },
    },
  };
};
export { attachmentTableDS };
