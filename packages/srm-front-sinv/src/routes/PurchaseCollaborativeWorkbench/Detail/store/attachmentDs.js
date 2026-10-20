import intl from 'utils/intl';

// 附件信息
const attachmentDataSet = () => ({
  dataToJSON: 'all',
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'headerAttachmentUuid',
      type: 'attachment',
      label: intl.get(`sinv.common.view.attachment`).d('附件'),
    },
  ],
});

export default attachmentDataSet;
