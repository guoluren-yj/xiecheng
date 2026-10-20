import intl from 'utils/intl';

const SourceNoticeDS = ({ rfxInfoDS }) => {
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题'),
        name: 'noticeTitle',
        required: true,
        type: 'string',
        dynamicProps: {
          required() {
            const sourceMethod = rfxInfoDS?.current?.get?.('sourceMethod');
            return sourceMethod !== 'INVITE';
          },
        },
      },
      {
        name: 'noticeDays',
        label: intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数'),
        type: 'number',
        min: 0,
        defaultValue: 30,
        dynamicProps: {
          required() {
            const sourceMethod = rfxInfoDS?.current?.get?.('sourceMethod');
            return sourceMethod !== 'INVITE';
          },
        },
      },
      {
        name: 'noticeAttachmentUuid',
        label: intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件'),
        type: 'attachment',
      },
      {
        name: 'noticeId',
        type: 'string',
      },
      {
        name: 'noticePreview',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.noticePreview').d('公告预览'),
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
