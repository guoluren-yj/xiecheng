import intl from 'utils/intl';

const SourceNoticeDS = () => {
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题'),
        name: 'noticeTitle',
        disabled: true,
      },
      {
        name: 'noticeDays',
        disabled: true,
        label: intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数'),
      },
      {
        name: 'noticeAttachmentUuid',
        label: intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'noticePreview',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.noticePreview').d('公告预览'),
        disabled: true,
      },
      { name: 'sourceHeaderId' },
      { name: 'sourceFrom', defaultValue: 'RFX' },
      { name: 'tenantId' },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
    ],
  };
};

export default SourceNoticeDS;
